const dynamo = require("../dynamo"),
  BasicGet = require("./base/basic-get"),
  opUtils = require("./utils"),
  Condition = require("./conditions"),
  { ReadOperationType } = require("../constants");

function Scan(table) {
  BasicGet.call(this, ReadOperationType.SCAN);
  this.appendToParams({ TableName: table.getName() });
  this.table = table;
  this.complete = false;
}

Scan.prototype = Object.create(BasicGet.prototype);
Scan.prototype.constructor = Scan;

Scan.prototype.properties = function(props) {
  this.appendToParams(opUtils.getPropFilter(props));
  return this;
};

Scan.prototype.where = function() {
  return new Condition(this);
};

Scan.prototype.limit = function(limit) {
  this.appendToParams({ Limit: limit });
  return this;
};

Scan.prototype.nextPage = async function() {
  return this.run();
};

Scan.prototype.finished = function() {
  return this.complete;
};

Scan.prototype.run = async function() {
  const scanObj = this;
  let data = await dynamo.docClient.scan(scanObj.getParams()).promise();
  opUtils.checkReadComplete(this, data);
  return data != null && data.Items != null ? data.Items : null;
};

module.exports = Scan;
