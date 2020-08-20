let dynamo = require("../dynamo"),
    opUtils = require("./op-utils");

function Get(table) {
  this.params = {TableName: table.getName(), Key: {}};
  this.table = table;
}

Get.prototype.primary = function(value) {
  this.params.Key[this.table.getPrimary()] = value;
  return this;
};

Get.prototype.sort = function(value) {
  this.params.Key[this.table.getSort()] = value;
  return this;
};

Get.prototype.properties = function(props) {
  this.params = opUtils.addPropFilter(this.params, props);
  return this;
};

Get.prototype.consistent = function() {
  this.params.ConsistentRead = true;
  return this;
};

Get.prototype.run = function() {
  return new Promise((resolve, reject) => {
    dynamo.docClient.get(this.params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data != null && data.Item != null ? data.Item : null);
      }
    });
  });
};

module.exports = Get;