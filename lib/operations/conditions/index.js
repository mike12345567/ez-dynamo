const utils = require("./utils");
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
  this.cndNames = null;
  this.nameField = null;
  this.hasUpdated = false;
  // start at 100 to not interrupt any starting numbers
  this.index = 100;
  utils.setNextFunc(this, utils.NextFunction.KICKOFF);
}

Condition.prototype.property = function property(propName) {
  if (propName.indexOf(".") === -1) {
    this.nameField = `#${utils.fname(this)}`;
    this.cndNames = {
      [this.nameField]: propName
    };
  } else {
    const nestedProps = propName.split(".");
    this.nameField = "";
    this.cndNames = {};
    for (const nest of nestedProps) {
      const fname = `#${utils.fname(this)}`;
      if (this.nameField !== "") {
        this.nameField += ".";
      }
      this.nameField += fname;
      this.cndNames[fname] = nest;
    }
  }
  utils.setNextFunc(this, utils.NextFunction.OPERATION);
  return this;
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

Condition.prototype.exists = function exists(attribute) {
  // TODO: needs completed
  utils.checkNextFunc(this, exists.name);
  utils.setNextFunc(this, utils.NextFunction.CONJUCTION);
  return this;
};

Condition.prototype.beginsWith = function beginsWith(string) {
  // TODO: needs completed
  utils.checkNextFunc(this, beginsWith.name);
  utils.setNextFunc(this, utils.NextFunction.CONJUCTION);
  return this;
};

Condition.prototype.contains = function contains(string) {
  // TODO: needs completed
  utils.checkNextFunc(this, contains.name);
  utils.setNextFunc(this, utils.NextFunction.CONJUCTION);
  return this;
};

Condition.prototype.not = function not() {
  utils.checkNextFunc(this, not.name);
  utils.updateParams(this, {}, "NOT ");
  utils.setNextFunc(this, utils.NextFunction.OPERATION);
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
