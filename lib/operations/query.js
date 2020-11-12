const dynamo = require("../dynamo"),
  BasicGet = require("./basic-get"),
  opUtils = require("./op-utils"),
  Condition = require("./conditions");

function Query(table) {
  BasicGet.call(this);
  this.appendToParams({ TableName: table.getName() });
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

// TODO: this isn't properly fleshed out yet, need to build QueryExpression
Query.prototype.run = async function() {
  const getObj = this;
  let data = await dynamo.docClient.query(getObj.getParams()).promise();
  return data != null && data.Item != null ? data.Item : null;
};

module.exports = Query;
