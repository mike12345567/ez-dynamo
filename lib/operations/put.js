let dynamo = require("../dynamo"),
    BasicWrite = require("./basic-write"),
    opUtils = require("./op-utils");

function Put(table) {
  this.appendToParams({TableName: table.getName()});
  this.table = table;
}

Put.prototype = Object.create(BasicWrite.prototype);
Put.prototype.constructor = Put;

Put.prototype.object = function(obj) {
  this.table.validateAgainstSchema(obj);
  this.appendToParams({Item: obj});
  return this;
};

Put.prototype.overwrite = function() {
  this.addCondition("notExist", `attribute_not_exists(${this.table.getPrimary()})`);
  this.appendToParams({ReturnValues: opUtils.ReturnValues.OLD});
  return this;
};

Put.prototype.run = function() {
  return new Promise((resolve, reject) => {
    dynamo.docClient.put(this.getParams(), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = Put;

