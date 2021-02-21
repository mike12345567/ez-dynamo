const { isReadOperation, isWriteOperation } = require("../utils");

// these are static lists, these will not update unless Dynamo is updated
// we can't really add any more functions at the condition level, we may
// want to create functions up above however in the parent operation, e.g.
// the combination of multiple conditions for some common use cases.
const PROPERTY_OPERATOR_LIST = [
  "equals",
  "greaterThan",
  "greaterThanEqual",
  "lessThan",
  "lessThanEqual",
  "between",
  "oneOf"
];
const FUNCTION_LIST = ["exists", "beginsWith", "contains", "isType"];
const OPERATION_LIST = PROPERTY_OPERATOR_LIST.concat(FUNCTION_LIST);
const CONJUCTION_LIST = ["and", "or"];
const KICKOFF_LIST = ["property", "size", "not"].concat(FUNCTION_LIST);
const NUMERIC_LIST = [
  "equals",
  "greaterThan",
  "greaterThanEqual",
  "lessThan",
  "lessThanEqual",
  "between"
];

function getExpressionName(operation) {
  if (isReadOperation(operation)) {
    return "FilterExpression";
  } else if (isWriteOperation(operation)) {
    return "ConditionExpression";
  }
  throw "Unknown type of operation found";
}

exports.NextFunction = {
  ALL_OPERATION: "all_operation",
  PROPERTY_OPERATION: "property_operation",
  FUNCTION: "function",
  CONJUCTION: "conjuction",
  KICKOFF: "kickoff",
  NUMERIC: "numeric"
};

exports.setNextFunc = (condition, nextFunc) => {
  switch (nextFunc) {
    case exports.NextFunction.PROPERTY_OPERATION:
      condition.nextFuncs = PROPERTY_OPERATOR_LIST;
      break;
    case exports.NextFunction.ALL_OPERATION:
      condition.nextFuncs = OPERATION_LIST;
      break;
    case exports.NextFunction.FUNCTION:
      condition.nextFuncs = FUNCTION_LIST;
      break;
    case exports.NextFunction.CONJUCTION:
      condition.nextFuncs = CONJUCTION_LIST;
      break;
    case exports.NextFunction.KICKOFF:
      condition.nextFuncs = KICKOFF_LIST;
      break;
    case exports.NextFunction.NUMERIC:
      condition.nextFuncs = NUMERIC_LIST;
      break;
    default:
      throw "Unknown set of next functions.";
  }
};

exports.checkNextFunc = (condition, funcName) => {
  if (condition.nextFuncs.indexOf(funcName) === -1) {
    throw "Cannot apply operation in this order.";
  }
};

exports.basicCondition = (condition, funcName, operator, value) => {
  exports.checkNextFunc(condition, funcName);
  const field = exports.fname(condition);
  const values = {
    [`:${field}`]: value
  };
  const cndString = `${condition.nameField} ${operator} :${field}`;
  exports.setNextFunc(condition, exports.NextFunction.CONJUCTION);
  exports.updateParams(condition, values, cndString);
};

exports.fname = condition => {
  return `cnd${condition.index++}`;
};

exports.updateParams = (condition, values, cndString) => {
  const params = condition.operation.getParams();
  const expressionName = getExpressionName(condition.operation);
  if (params[expressionName] && !condition.hasUpdated) {
    condition.hasUpdated = true;
    cndString = params[expressionName] + " AND " + cndString;
  } else if (params[expressionName]) {
    cndString = params[expressionName] + cndString;
  }
  condition.hasUpdated = true;
  const updateParams = {
    ExpressionAttributeValues: values,
    ExpressionAttributeNames: condition.cndNames,
    [expressionName]: cndString
  };
  condition.operation.appendToParams(updateParams);
};

exports.addProperty = (condition, propName) => {
  if (propName.indexOf(".") === -1) {
    condition.nameField = `#${exports.fname(condition)}`;
    condition.cndNames = {
      [condition.nameField]: propName
    };
  } else {
    const nestedProps = propName.split(".");
    condition.nameField = "";
    condition.cndNames = {};
    for (const nest of nestedProps) {
      const fname = `#${exports.fname(condition)}`;
      if (condition.nameField !== "") {
        condition.nameField += ".";
      }
      condition.nameField += fname;
      condition.cndNames[fname] = nest;
    }
  }
  return condition;
};

exports.addFunction = (condition, funcName, operation, path, value = null) => {
  exports.checkNextFunc(condition, funcName);
  // initially add the prop
  condition = exports.addProperty(condition, path);
  let conditionString = `${operation} (${condition.nameField}`;
  let values;
  if (value) {
    const valueString = `:${exports.fname(condition)}`;
    values = {
      [valueString]: value
    };
    conditionString += `, ${valueString})`;
  } else {
    conditionString += ")";
  }
  exports.updateParams(condition, values, conditionString);
  exports.setNextFunc(
    condition,
    funcName === "size" ? exports.NextFunction.NUMERIC : exports.NextFunction.CONJUCTION
  );
  return condition;
};
