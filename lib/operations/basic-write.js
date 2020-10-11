let opUtils = require("./op-utils");

function BasicWrite() {
  this.params = {};
  this.conditions = {};
}

BasicWrite.prototype.finaliseCondition = function() {
  let expression = "";
  let first = true;
  for (let conditionKey of Object.keys(this.conditions)) {
    expression += `${first ? "" : " AND"} ${this.conditions[conditionKey]}`;
  }
  this.params.ConditionExpression = expression;
};

BasicWrite.prototype.addCondition = function(conditionName, condition) {
  this.conditions[conditionName] = condition;
  this.finaliseCondition();
  return this;
};

BasicWrite.prototype.removeCondition = function(conditionName) {
  delete this.conditions[conditionName];
  this.finaliseCondition();
  return this;
};

BasicWrite.prototype.getParams = function() {
  return this.params;
};

BasicWrite.prototype.appendToParams = function(obj) {
  this.params = opUtils.assignNested(this.params, obj);
};

module.exports = BasicWrite;