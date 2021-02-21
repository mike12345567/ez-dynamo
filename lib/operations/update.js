const dynamo = require("../dynamo"),
  { finaliseUpdateParams } = require("./utils"),
  BasicWrite = require("./base/basic-write"),
  { checkForSets } = require("../utils"),
  { WriteOperationType } = require("../constants");

function Update(table) {
  BasicWrite.call(this, WriteOperationType.UPDATE);
  this.addCondition("existence", `attribute_exists(${table.getPrimary()})`);
  this.appendToParams({ TableName: table.getName() });
  this.table = table;
  this.type = this.propCount = 0;
  this.expressions = {
    REMOVE: [],
    DELETE: [],
    SET: [],
    ADD: []
  };
}

Update.prototype = Object.create(BasicWrite.prototype);
Update.prototype.constructor = Update;

Update.prototype.primary = function(value) {
  const primaryName = this.table.getPrimary();
  this.table.isValidValueForProperty(primaryName, value);
  this.appendToParams({ Key: { [primaryName]: value } });
  return this;
};

Update.prototype.sort = function(value) {
  const sortName = this.table.getSort();
  if (sortName == null) {
    throw "No sort property specified for table.";
  }
  this.table.isValidValueForProperty(sortName, value);
  this.appendToParams({ Key: { [sortName]: value } });
  return this;
};

Update.prototype.set = function(property, value) {
  if (!this.table.isValidValueForProperty(property, value)) {
    throw "The value specified is not valid for the property schema.";
  }
  value = checkForSets(value);
  this.expressions.SET.push({ property, value });
  return this;
};

Update.prototype.remove = function(property) {
  if (!this.table.isValidProperty(property)) {
    throw "The property specified is not in the table schema.";
  }
  this.expressions.REMOVE.push({ property });
  return this;
};

Update.prototype.add = function(property, value) {
  if (!this.table.isValidValueForProperty(property, value)) {
    throw "The value specified is not valid for the property schema.";
  }
  if (isNaN(value)) {
    if (!(value instanceof Array)) {
      value = [value];
    }
    value = dynamo.docClient.createSet(value);
  }
  this.expressions.ADD.push({ property, value });
  return this;
};

Update.prototype.delete = function(property, value) {
  if (!this.table.isValidValueForProperty(property, value)) {
    throw "The value specified is not valid for the property schema.";
  }
  if (isNaN(value)) {
    if (!(value instanceof Array)) {
      value = [value];
    }
    value = dynamo.docClient.createSet(value);
  }
  this.expressions.DELETE.push({ property, value });
  return this;
};

Update.prototype.createIfNotExist = function() {
  this.removeCondition("existence");
  return this;
};

Update.prototype.getParams = function() {
  finaliseUpdateParams(this);
  return BasicWrite.prototype.getParams.call(this);
};

Update.prototype.run = async function() {
  if (this.propCount === 0) {
    throw "No properties added to update call.";
  }
  return await dynamo.docClient.update(this.getParams()).promise();
};

module.exports = Update;
