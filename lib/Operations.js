let Get = require("./operations/get"),
  Query = require("./operations/query"),
  Scan = require("./operations/scan"),
  Delete = require("./operations/delete"),
  Put = require("./operations/put"),
  Update = require("./operations/update"),
  Table = require("./Table");

function Operations(tableName) {
  Table.call(this, tableName);
}

Operations.prototype = Object.create(Table.prototype);
Operations.prototype.constructor = Operations;

Operations.prototype.put = function(object) {
  let put = new Put(this);
  return put.object(object);
};

Operations.prototype.update = function() {
  return new Update(this);
};

Operations.prototype.delete = function() {};

Operations.prototype.get = function() {
  return new Get(this);
};

Operations.prototype.query = function() {};

Operations.prototype.scan = function() {};

module.exports = Operations;
