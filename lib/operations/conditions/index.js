const OPERATION_LIST = [
  "equals",
  "greaterThan",
  "greaterThanEqual",
  "lessThan",
  "lessThanEqual",
  "between",
  "isOneOf",
  "exists",
  "beginsWith",
  "contains"
];
const CONJUCTION_LIST = ["and", "or"];
const KICKOFF_LIST = ["property", "not"];
/**
 * Here we build a condition, this builds a ConditionExpression which can be applied to the following operations:
 * 1. Delete
 * 2. Put
 * 3. Update
 * Due to the fact that all write operations can support the ConditionExpression parameter Write transactions also
 * support this.
 * More information can be found here:
 * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html
 * @constructor
 */
function Condition(writeOp) {
  if (writeOp.addCondition == null) {
    throw "Cannot add conditions to none write operations.";
  }
  this.operation = writeOp;
  this.nextFunctions = KICKOFF_LIST;
  this.currentProp = null;
  // start at 100 to not interrupt any starting numbers
  this.index = 100;
}

Condition.prototype._update = function(names, values, condition) {
  this.operation.appendToParams();
};

Condition.prototype._fname = function() {
  return `val${this.index++}`;
};

Condition.prototype._basicOp = function(funName, operator, value) {
  if (this.nextFunctions.indexOf(funName) === -1) {
    throw "Cannot apply operation in this order.";
  }
  const field = this._fname();
  const values = {
    [`:${field}`]: value
  };
  const names = {
    [`#${field}`]: this.currentProp
  };
  const condition = `(#${field} ${operator} :${field})`;
  this._update(names, values, condition);
  this.nextFunctions = CONJUCTION_LIST;
};

Condition.prototype.property = function property(propName) {
  this.currentProp = propName;
};

Condition.prototype.equals = function equals(value) {
  this._basicOp(equals.name, "=", value);
};

Condition.prototype.greaterThan = function greaterThan(value) {
  this._basicOp(greaterThan.name, ">", value);
};

Condition.prototype.greaterThanEqual = function greaterThanEqual(value) {
  this._basicOp(greaterThanEqual.name, ">=", value);
};

Condition.prototype.lessThan = function lessThan(value) {
  this._basicOp(lessThan.name, "<", value);
};

Condition.prototype.lessThanEqual = function lessThanEqual(value) {
  this._basicOp(lessThanEqual.name, "<=", value);
};

Condition.prototype.between = function between(lower, upper) {
  let field = this._fname();
  this.nextFunctions = CONJUCTION_LIST;
};

Condition.prototype.isOneOf = function isOneOf(list) {
  this.nextFunctions = CONJUCTION_LIST;
};

Condition.prototype.exists = function exists(attribute) {
  this.nextFunctions = CONJUCTION_LIST;
};

Condition.prototype.beginsWith = function beginsWith(string) {
  this.nextFunctions = CONJUCTION_LIST;
};

Condition.prototype.contains = function contains(string) {
  this.nextFunctions = CONJUCTION_LIST;
};

Condition.prototype.not = function not() {
  this.nextFunctions = OPERATION_LIST;
};

Condition.prototype.and = function and() {
  this.nextFunctions = KICKOFF_LIST;
};

Condition.prototype.or = function or() {
  this.nextFunctions = KICKOFF_LIST;
};

module.exports = Condition;
