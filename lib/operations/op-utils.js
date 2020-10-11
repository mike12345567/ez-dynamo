module.exports.getPropFilter = properties => {
  let obj = {};
  obj.ProjectionExpression = "";
  if (obj.ExpressionAttributeNames == null) {
    obj.ExpressionAttributeNames = {};
  }
  let first = true;
  let count = 0;
  for (let attr of properties) {
    obj.ExpressionAttributeNames[`#filter${count}`] = attr;
    obj.ProjectionExpression += `${first ? "" : ","} #filter${count++}`;
    first = false;
  }
  return obj;
};

module.exports.getFilterForPropertyExists = (property, isWrite = false) => {
  let obj = {};
  if (obj.ExpressionAttributeNames == null) {
    obj.ExpressionAttributeNames = {};
  }
  obj.ExpressionAttributeNames["#filterprop"] = property;
  let expr = "attribute_exists(#filterprop)";
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
