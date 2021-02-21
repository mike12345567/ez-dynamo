const dynamo = require("../dynamo"),
  BasicGet = require("./base/basic-get"),
  opUtils = require("./utils"),
  { ReadOperationType } = require("../constants");

function Get(table) {
  BasicGet.call(this, ReadOperationType.GET);
  this.appendToParams({ TableName: table.getName() });
  this.table = table;
}

Get.prototype = Object.create(BasicGet.prototype);
Get.prototype.constructor = Get;

Get.prototype.primary = function(value) {
  this.appendToParams({ Key: { [this.table.getPrimary()]: value } });
  return this;
};

Get.prototype.sort = function(value) {
  this.appendToParams({ Key: { [this.table.getSort()]: value } });
  return this;
};

Get.prototype.properties = function(props) {
  this.appendToParams(opUtils.getPropFilter(props));
  return this;
};

Get.prototype.consistent = function() {
  this.appendToParams({ ConsistentRead: true });
  return this;
};

Get.prototype.run = async function() {
  const getObj = this;
  let data = await dynamo.docClient.get(getObj.getParams()).promise();
  return data != null && data.Item != null ? data.Item : null;
};

module.exports = Get;
