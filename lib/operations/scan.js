const dynamo = require("../dynamo"),
  BasicGet = require("./basic-get"),
  opUtils = require("./op-utils"),
  Condition = require("./conditions");

function Scan(table) {
  BasicGet.call(this);
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
}

Scan.prototype.run = async function() {
  const scanObj = this;
  let data = await dynamo.docClient.scan(scanObj.getParams()).promise();
  if (data != null && data.LastEvaluatedKey) {
    this.appendToParams({ ExclusiveStartKey: data.LastEvaluatedKey });
  } else {
    this.complete = true;
  }
  return data != null && data.Items != null ? data.Items : null;
};

Scan.prototype.finished = function() {
  return this.complete;
};

module.exports = Scan;
