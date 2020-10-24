const dynamo = require("../dynamo"),
  opUtils = require("./op-utils"),
  BasicWrite = require("./basic-write");

const internal = {};

internal.getOperationString = (paramStr, type) => {
  switch (type) {
    case "SET":
      return `#${paramStr} = :${paramStr}`;
    case "ADD":
    case "DELETE":
      return `#${paramStr} :${paramStr}`;
    case "REMOVE":
      return `#${paramStr}`;
  }
};

internal.generateParamsFromPropArray = (array, expression, count, type) => {
  expression = expression == null ? "" : expression + " ";
  let params = {};
  let first = true;
  for (const el of array) {
    const obj = {};
    const paramStr = `${type}${count}`;
    expression += `${type === "SET" && !first ? ", " : type} ${internal.getOperationString(paramStr, type)}`;
    if (el.property) {
      obj.ExpressionAttributeNames = {
        [`#${paramStr}`]: el.property
      };
    }
    if (el.value) {
      obj.ExpressionAttributeValues = {
        [`:${paramStr}`]: el.value
      };
    }
    params = opUtils.assignNested(params, obj);
    first = false;
  }
  params.UpdateExpression = expression;
  return params;
};

internal.finalise = updateOperation => {
  for (const key of Object.keys(updateOperation.expressions)) {
    const expression = updateOperation.getParams().UpdateExpression;
    updateOperation.appendToParams(
      internal.generateParamsFromPropArray(updateOperation.expressions[key], expression, updateOperation.propCount, key)
    );
    updateOperation.propCount++;
  }
};

function Update(table) {
  BasicWrite.call(this);
  this.addCondition("existence", `attribute_exists(${table.getPrimary()})`);
  this.appendToParams({ TableName: table.getName() });
  this.table = table;
  this.propCount = 0;
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

Update.prototype.setProperty = function(property, value) {
  if (!this.table.isValidValueForProperty(property, value)) {
    throw "The value specified is not valid for the property schema.";
  }
  this.expressions.SET.push({ property, value });
  return this;
};

Update.prototype.removeProperty = function(property) {
  if (!this.table.isValidProperty(property)) {
    throw "The property specified is not in the table schema.";
  }
  this.expressions.REMOVE.push({ property });
  return this;
};

Update.prototype.addToProperty = function(property, value) {
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

Update.prototype.deleteFromProperty = function(property, value) {
  if (!this.table.isValidValueForProperty(property, value)) {
    throw "The value specified is not valid for the property schema.";
  }
  this.expressions.DELETE.push({ property, value });
  return this;
};

Update.prototype.createIfNotExist = function() {
  this.removeCondition("existence");
  return this;
};

Update.prototype.run = async function() {
  internal.finalise(this);
  if (this.propCount === 0) {
    throw "No properties added to update call.";
  }
  return await dynamo.docClient.update(this.getParams()).promise();
};

module.exports = Update;
