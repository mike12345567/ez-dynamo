module.exports.schemaToDynamo = (schemaEntry) => {
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