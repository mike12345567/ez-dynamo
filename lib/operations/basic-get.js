const opUtils = require("./op-utils");

function BasicGet(type) {
  this.params = {};
  this.type = type;
}

BasicGet.prototype.getParams = function() {
  return this.params;
};

BasicGet.prototype.appendToParams = function(obj) {
  this.params = opUtils.assignNested(this.params, obj);
};

BasicGet.prototype.getType = function() {
  return this.type;
};

module.exports = BasicGet;
