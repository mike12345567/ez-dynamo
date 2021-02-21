const { OperationType } = require("./constants");

const TransactionType = {
  WRITE: "write",
  READ: "read"
};

function Transaction(type) {
  this.type = type;
  this.transactions = {
    TransactItems: []
  };
}

Transaction.prototype.addOperation = async function(operation) {
  // TODO: need to check it is the correct type
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

Transaction.prototype.run = async function() {
  // TODO: need to build this out with some error handling
};

module.exports.WriteTransaction = () => {
  return new Transaction(TransactionType.WRITE);
};

module.exports.ReadTransaction = () => {
  return new Transaction(TransactionType.READ);
};
