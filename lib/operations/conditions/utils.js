// these are static lists, these will not update unless Dynamo is updated
// we can't really add any more functions at the condition level, we may
// want to create functions up above however in the parent operation, e.g.
// the combination of multiple conditions for some common use cases.
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
  "contains",
  "not",
];
const CONJUCTION_LIST = ["and", "or"];
const KICKOFF_LIST = ["property", "not"];

exports.NextFunction = {
  OPERATION: "op",
  CONJUCTION: "con",
  KICKOFF: "kick",
};

exports.setNextFunc = (condition, nextFunc) => {
  switch (nextFunc) {
    case exports.NextFunction.OPERATION:
      condition.nextFuncs = OPERATION_LIST;
      break;
    case exports.NextFunction.CONJUCTION:
      condition.nextFuncs = CONJUCTION_LIST;
      break;
    case exports.NextFunction.KICKOFF:
      condition.nextFuncs = KICKOFF_LIST;
      break;
    default:
      throw "Unknown set of next functions."
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

exports.fname = (condition) => {
  return `cnd${condition.index++}`;
};

exports.updateParams = (condition, values, cndString) => {
  let params = condition.operation.getParams();
  if (params.ConditionExpression) {
    cndString = params.ConditionExpression + cndString;
  }
  const updateParams = {
    ExpressionAttributeValues: values,
    ExpressionAttributeNames: condition.cndNames,
    ConditionExpression: cndString,
  };
  condition.operation.appendToParams(updateParams);
};