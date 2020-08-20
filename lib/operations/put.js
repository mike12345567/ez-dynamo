let dynamo = require("../dynamo"),
    opUtils = require("./op-utils");

function Put(table) {
  this.params = {TableName: table.getName()};
  this.table = table;
}

Put.prototype.object = function(obj) {
  this.table.validateAgainstSchema(obj);
  this.params.Item = obj;
  return this;
};

Put.prototype.overwrite = function() {
  this.params.ConditionExpression = `attribute_not_exists(${this.table.getPrimary()})`;
  return this;
};

Put.prototype.run = function() {
  return new Promise((resolve, reject) => {
    dynamo.docClient.put(this.params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = Put;

