exports.WriteOperationType = {
  UPDATE: "update",
  PUT: "put",
  DELETE: "delete",
}

exports.ReadOperationType = {
  GET: "get",
  QUERY: "query",
  SCAN: "scan",
}

exports.BatchOperationType = {
  BATCH_GET: "batchGet",
  BATCH_WRITE: "batchWrite",
}

exports.OperationType = Object.assign(exports.WriteOperationType, exports.ReadOperationType, exports.BatchOperationType);
