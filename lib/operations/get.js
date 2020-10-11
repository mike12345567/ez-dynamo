let dynamo = require("../dynamo"),
  BasicGet = require("./basic-get"),
  opUtils = require("./op-utils");

function Get(table) {
  BasicGet.call(this);
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

Get.prototype.run = function() {
  let getObj = this;
  return new Promise((resolve, reject) => {
    dynamo.docClient.get(getObj.getParams(), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data != null && data.Item != null ? data.Item : null);
      }
    });
  });
};

module.exports = Get;