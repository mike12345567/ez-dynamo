const { ReadOperationType, WriteOperationType, BatchOperationType } = require("../../constants");

module.exports.getPropFilter = properties => {
  const obj = {};
  obj.ProjectionExpression = "";
  if (obj.ExpressionAttributeNames == null) {
    obj.ExpressionAttributeNames = {};
  }
  let first = true;
  let count = 0;
  for (const attr of properties) {
    obj.ExpressionAttributeNames[`#filter${count}`] = attr;
    obj.ProjectionExpression += `${first ? "" : ","} #filter${count++}`;
    first = false;
  }
  return obj;
};

module.exports.getFilterForPropertyExists = (property, isWrite = false) => {
  const obj = {};
  if (obj.ExpressionAttributeNames == null) {
    obj.ExpressionAttributeNames = {};
  }
  obj.ExpressionAttributeNames["#filterprop"] = property;
  const expr = "attribute_exists(#filterprop)";
  if (isWrite) {
    obj.ConditionExpression = expr;
  } else {
    obj.FilterExpression = expr;
  }
  return obj;
};

module.exports.ReturnValues = {
  NONE: "NONE",
  OLD: "ALL_OLD",
  UPDATED_OLD: "UPDATED_OLD",
  UPDATED_NEW: "UPDATED_NEW",
  NEW: "ALL_NEW"
};

module.exports.assignNested = function(target, source) {
  Object.keys(source).forEach(key => {
    const sourceProp = source[key];
    const targetProp = target[key];
    target[key] =
      targetProp && sourceProp && typeof targetProp === "object" && typeof sourceProp === "object"
        ? module.exports.assignNested(targetProp, sourceProp)
        : sourceProp;
  });
  return target;
};

module.exports.OpTypes = {
  GET: "get",
  WRITE: "write"
};

module.exports.checkReadComplete = (operation, response) => {
  if (response != null && response.LastEvaluatedKey) {
    operation.appendToParams({ ExclusiveStartKey: response.LastEvaluatedKey });
  } else {
    operation.complete = true;
  }
  return operation;
};

module.exports.isReadOperation = operation => {
  return Object.values(ReadOperationType).indexOf(operation.getType()) !== -1;
};

module.exports.isWriteOperation = operation => {
  return Object.values(WriteOperationType).indexOf(operation.getType()) !== -1;
};

module.exports.isBatchOperation = operation => {
  return Object.values(BatchOperationType).indexOf(operation.getType()) !== -1;
};

module.exports.getUpdateFunctionString = (paramStr, type) => {
  switch (type) {
    case "SET":
      return `#${paramStr} = :${paramStr}`;
    case "ADD":
    case "DELETE":
      return `#${paramStr} :${paramStr}`;
    case "REMOVE":
      return `#${paramStr}`;
  }
};

module.exports.generateParamsFromPropArray = (array, expression, count, type) => {
  expression = expression == null || expression === "" ? "" : expression + " ";
  let params = {};
  let first = true;
  for (const el of array) {
    const obj = {};
    const paramStr = `${type}${count}`;
    expression += `${type === "SET" && !first ? ", " : type} ${exports.getUpdateFunctionString(
      paramStr,
      type
    )}`;
    if (el.property) {
      obj.ExpressionAttributeNames = {
        [`#${paramStr}`]: el.property
      };
    }
    if (el.value) {
      obj.ExpressionAttributeValues = {
        [`:${paramStr}`]: el.value
      };
    }
    params = exports.assignNested(params, obj);
    first = false;
  }
  params.UpdateExpression = expression;
  return params;
};

module.exports.finaliseUpdateParams = updateOperation => {
  for (const key of Object.keys(updateOperation.expressions)) {
    const expression = updateOperation.getParams().UpdateExpression;
    updateOperation.appendToParams(
      exports.generateParamsFromPropArray(
        updateOperation.expressions[key],
        expression,
        updateOperation.propCount,
        key
      )
    );
    updateOperation.propCount++;
  }
};
