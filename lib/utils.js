const docClient = require("./dynamo").docClient

module.exports.schemaToDynamo = schemaEntry => {
  if (schemaEntry == null || schemaEntry.type == null) {
    throw "Schema is not valid based on input keys.";
  }
  switch (schemaEntry.type) {
    case "string":
      return "S";
    case "date":
      return "DATE";
    case "number":
      return "N";
    case "boolean":
      return "BOOL";
    case "binary":
      return "B";
    case "array":
      return "L";
    default:
      return null;
  }
};

module.exports.checkForSets = val => {
  if (val == null || !(typeof val === "object")) {
    return val;
  }
  if (typeof val instanceof Array) {
    val = docClient.createSet(val);
  } else {
    for (let [key, value] of Object.entries(val)) {
      if (value instanceof Array) {
        val[key] = docClient.createSet(value);
      }
    }
  }
  return val;
}
