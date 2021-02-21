const { OperationType } = require("./constants");
const { isReadOperation, isWriteOperation, isBatchOperation } = require("./operations/utils");
const dynamo = require("./dynamo");

const TransactionType = {
  WRITE: "write",
  READ: "read"
};

function Transaction(type) {
  this.type = type;
  this.transactions = {
    TransactItems: []
  };
  this.usedCapacity = null;
}

Transaction.prototype.addOperation = async function(operation) {
  if (this.type === TransactionType.READ && isWriteOperation(operation)) {
    throw "Cannot add put, delete or update operations to a read transaction.";
  }
  if (this.type === TransactionType.WRITE && isReadOperation(operation)) {
    throw "Cannot add get, scan or query operations to a write transaction.";
  }
  if (isBatchOperation(operation)) {
    throw "Cannot perform batch operations as part of a transaction.";
  }
  const wrapped = {};
  const params = operation.getParams();
  switch (operation.getType()) {
    case OperationType.GET:
      wrapped.Get = params;
      break;
    case OperationType.SCAN:
      wrapped.Scan = params;
      break;
    case OperationType.QUERY:
      wrapped.Query = params;
      break;
    case OperationType.PUT:
      wrapped.Put = params;
      break;
    case OperationType.DELETE:
      wrapped.Delete = params;
      break;
    case OperationType.UPDATE:
      wrapped.Update = params;
      break;
  }
  this.transactions.TransactItems.push(wrapped);
};

Transaction.prototype.getUsedCapacity = function() {
  return this.usedCapacity;
};

Transaction.prototype.run = async function() {
  let data;
  if (this.type === TransactionType.WRITE) {
    data = await dynamo.docClient.transactWrite(this.transactions).promise();
  } else {
    data = await dynamo.docClient.transactGet(this.transactions).promise();
  }
  if (data && data.ConsumedCapacity) {
    this.usedCapacity = data.ConsumedCapacity;
  }
  return data != null && data.Responses != null ? data.Responses : data;
};

module.exports.WriteTransaction = () => {
  return new Transaction(TransactionType.WRITE);
};

module.exports.ReadTransaction = () => {
  return new Transaction(TransactionType.READ);
};
