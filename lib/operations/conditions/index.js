const utils = require("./utils");

/**
 * Here we build a condition, this builds an expression which can be applied to the following operations:
 * 1. Delete
 * 2. Put
 * 3. Update
 * 4. Scan
 * 5. Query
 * Due to the fact that all these operations can support the ConditionExpression/FilterExpression parameter transactions
 * also support this.
 * More information can be found here:
 * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html
 * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Scan.html#Scan.FilterExpression
 * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#Query.FilterExpression
 * @constructor
 */
function Condition(operation) {
  this.operation = operation;
  this.cndNames = null;
  this.nameField = null;
  this.hasUpdated = false;
  // start at 100 to not interrupt any starting numbers
  this.index = 100;
  utils.setNextFunc(this, utils.NextFunction.KICKOFF);
}

Condition.prototype.property = function property(propName) {
  utils.checkNextFunc(this, property.name);
  utils.setNextFunc(this, utils.NextFunction.PROPERTY_OPERATION);
  return utils.addProperty(this, propName);
};

Condition.prototype.equals = function equals(value) {
  utils.basicCondition(this, equals.name, "=", value);
  return this;
};

Condition.prototype.greaterThan = function greaterThan(value) {
  utils.basicCondition(this, greaterThan.name, ">", value);
  return this;
};

Condition.prototype.greaterThanEqual = function greaterThanEqual(value) {
  utils.basicCondition(this, greaterThanEqual.name, ">=", value);
  return this;
};

Condition.prototype.lessThan = function lessThan(value) {
  utils.basicCondition(this, lessThan.name, "<", value);
  return this;
};

Condition.prototype.lessThanEqual = function lessThanEqual(value) {
  utils.basicCondition(this, lessThanEqual.name, "<=", value);
  return this;
};

Condition.prototype.between = function between(lower, upper) {
  utils.checkNextFunc(this, between.name);
  const field = utils.fname(this);
  const values = {
    [`:${field}lwr`]: lower,
    [`:${field}upr`]: upper
  };
  const condition = `${this.nameField} BETWEEN :${field}lwr AND :${field}upr`;
  utils.setNextFunc(this, utils.NextFunction.CONJUCTION);
  utils.updateParams(this, values, condition);
  return this;
};

Condition.prototype.oneOf = function oneOf(list) {
  utils.checkNextFunc(this, oneOf.name);
  if (list.length >= 100) {
    throw "Cannot build an IN list with more than 100 values";
  }
  const values = {};
  let oneOfString = "";
  for (const val of list) {
    const field = utils.fname(this);
    if (oneOfString !== "") {
      oneOfString += ",";
    }
    oneOfString += `:${field}`;
    values[`:${field}`] = val;
  }
  const condition = `${this.nameField} IN (${oneOfString})`;
  utils.setNextFunc(this, utils.NextFunction.CONJUCTION);
  utils.updateParams(this, values, condition);
  return this;
};

Condition.prototype.exists = function exists(property) {
  return utils.addFunction(this, exists.name, "attribute_exists", property);
};

Condition.prototype.beginsWith = function beginsWith(property, string) {
  return utils.addFunction(this, beginsWith.name, "begins_with", property, string);
};

Condition.prototype.contains = function contains(string) {
  return utils.addFunction(this, contains.name, "contains", property, string);
};

Condition.prototype.size = function size(property) {
  return utils.addFunction(this, size.name, "size", property);
};

Condition.prototype.isType = function isType(property, type) {
  return utils.addFunction(this, isType.name, "attribute_type", property, type);
};

Condition.prototype.not = function not() {
  utils.checkNextFunc(this, not.name);
  utils.updateParams(this, {}, " NOT ");
  utils.setNextFunc(this, utils.NextFunction.KICKOFF);
  return this;
};

Condition.prototype.and = function and() {
  utils.checkNextFunc(this, and.name);
  utils.updateParams(this, {}, " AND ");
  utils.setNextFunc(this, utils.NextFunction.KICKOFF);
  return this;
};

Condition.prototype.or = function or() {
  utils.checkNextFunc(this, or.name);
  utils.updateParams(this, {}, " OR ");
  utils.setNextFunc(this, utils.NextFunction.KICKOFF);
  return this;
};

// execute the main operation now that we have completed conditional
Condition.prototype.run = function() {
  if (this.operation.run) {
    return this.operation.run();
  } else {
    return this.operation;
  }
};

module.exports = Condition;
