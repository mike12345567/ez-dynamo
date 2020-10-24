const opUtils = require("./op-utils");

function BasicGet() {
  this.params = {};
}

BasicGet.prototype.getParams = function() {
  return this.params;
};

BasicGet.prototype.appendToParams = function(obj) {
  this.params = opUtils.assignNested(this.params, obj);
};

module.exports = BasicGet;
