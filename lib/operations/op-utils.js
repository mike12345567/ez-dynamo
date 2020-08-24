module.exports.addPropFilter = (params, properties) => {
  params.ProjectionExpression = "";
  if (params.ExpressionAttributeNames == null) {
    params.ExpressionAttributeNames = {};
  }
  let first = true;
  let count = 0;
  for (let attr of properties) {
    params.ExpressionAttributeNames[`#filter${count}`] = attr;
    params.ProjectionExpression += `${first ? "" : ","} #filter${count++}`;
    first = false;
  }
  return params;
};

module.exports.addFilterForPropertyExists = (params, property, isWrite = false) => {
  if (params.ExpressionAttributeNames == null) {
    params.ExpressionAttributeNames = {};
  }
  params.ExpressionAttributeNames["#filterprop"] = property;
  let expr = "attribute_exists(#filterprop)";
  if (isWrite) {
    params.ConditionExpression = expr;
  } else {
    params.FilterExpression = expr;
  }
  return params;
};

module.exports.ReturnValues = {
  NONE: "NONE",
  OLD: "ALL_OLD",
  UPDATED_OLD: "UPDATED_OLD",
  UPDATED_NEW: "UPDATED_NEW",
  NEW: "ALL_NEW"
};