const BasicWrite = require("./basic-write"),
  dynamo = require("../dynamo"),
  { WriteOperationType } = require("../constants");

function Delete(table) {
  BasicWrite.call(this, WriteOperationType.DELETE);
  this.appendToParams({ TableName: table.getName() });
  this.table = table;
}

Delete.prototype = Object.create(BasicWrite.prototype);
Delete.prototype.constructor = Delete;

Delete.prototype.primary = function(value) {
  this.appendToParams({ Key: { [this.table.getPrimary()]: value } });
  return this;
};

Delete.prototype.sort = function(value) {
  this.appendToParams({ Key: { [this.table.getSort()]: value } });
  return this;
};

Delete.prototype.run = async function() {
  return dynamo.docClient.delete(this.getParams()).promise();
};

module.exports = Delete;
