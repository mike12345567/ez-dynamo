let dynamo = require("../dynamo"),
    BasicWrite = require("./basic-write"),
    opUtils = require("./op-utils");

function Update(table) {
  this.addCondition("existence", `attribute_exists(${this.table.getPrimary()})`);
  this.appendToParams({TableName: table.getName()});
  this.table = table;
}

Update.prototype = Object.create(BasicWrite.prototype);
Update.prototype.constructor = Update;

Update.prototype.primary = function(value) {
  let primaryName = this.table.getPrimary();
  this.table.isValidValueForProperty(primaryName, value);
  this.appendToParams({[primaryName]: value});
  return this;
};

Update.prototype.sort = function(value) {
  let sortName = this.table.getSort();
  if (sortName == null) {
    throw "No sort property specified for table.";
  }
  this.table.isValidValueForProperty(sortName, value);
  this.appendToParams({[sortName]: value});
  return this;
};

Update.prototype.addProperty = function(property, value) {
  let valid = this.table.isValidValueForProperty(property, value);
  if (!valid) {
    throw "The value specified is not valid for the property schema.";
  }
  // TODO: update expression
  return this;
};

Update.prototype.removeProperty = function(property) {
  // TODO: update expression
  return this;
};

Update.prototype.createIfNotExist = function() {
  this.removeCondition("existence");
};

Update.prototype.run = function() {
  return new Promise((resolve, reject) => {
    dynamo.docClient.update(this.getParams(), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = Update;

