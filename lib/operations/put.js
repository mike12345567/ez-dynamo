const dynamo = require("../dynamo"),
  BasicWrite = require("./base/basic-write"),
  opUtils = require("./utils"),
  { checkForSets } = require("../utils"),
  { WriteOperationType } = require("../constants");

function Put(table) {
  BasicWrite.call(this, WriteOperationType.PUT);
  this.appendToParams({ TableName: table.getName() });
  this.table = table;
}

Put.prototype = Object.create(BasicWrite.prototype);
Put.prototype.constructor = Put;

Put.prototype.object = function(obj) {
  this.table.validateAgainstSchema(obj);
  obj = checkForSets(obj);
  this.appendToParams({ Item: obj });
  return this;
};

Put.prototype.overwrite = function() {
  this.addCondition("notExist", `attribute_not_exists(${this.table.getPrimary()})`);
  this.appendToParams({ ReturnValues: opUtils.ReturnValues.OLD });
  return this;
};

Put.prototype.run = async function() {
  return dynamo.docClient.put(this.getParams()).promise();
};

module.exports = Put;
