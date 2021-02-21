const opUtils = require("./op-utils"),
  Condition = require("./conditions");

function BasicWrite(type) {
  this.params = {};
  this.conditions = {};
  this.type = type;
}

BasicWrite.prototype.finaliseCondition = function() {
  let expression = "";
  let first = true;
  for (const conditionKey of Object.keys(this.conditions)) {
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

BasicWrite.prototype.onlyIf = function() {
  return new Condition(this);
};

BasicWrite.prototype.getType = function() {
  return this.type;
};

module.exports = BasicWrite;
