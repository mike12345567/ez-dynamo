const dynamo = require("../dynamo"),
  BasicGet = require("./base/basic-get"),
  opUtils = require("./utils"),
  Condition = require("./conditions"),
  { ReadOperationType } = require("../constants");

function Query(table) {
  BasicGet.call(this, ReadOperationType.QUERY);
  this.appendToParams({ TableName: table.getName() });
  this.complete = false;
  this.table = table;
}

Query.prototype = Object.create(BasicGet.prototype);
Query.prototype.constructor = Query;

Query.prototype.properties = function(props) {
  this.appendToParams(opUtils.getPropFilter(props));
  return this;
};

Query.prototype.where = function() {
  return new Condition(this);
};

Query.prototype.nextPage = async function() {
  return this.run();
};

Query.prototype.finished = function() {
  return this.complete;
};

// TODO: this isn't properly fleshed out yet, need to build QueryExpression
Query.prototype.run = async function() {
  const getObj = this;
  let data = await dynamo.docClient.query(getObj.getParams()).promise();
  opUtils.checkReadComplete(this, data);
  return data != null && data.Item != null ? data.Item : null;
};

module.exports = Query;
