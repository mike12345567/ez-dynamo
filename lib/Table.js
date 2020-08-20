let dynamo = require("./dynamo"),
    utils = require("./utils"),
    schema = require("./schema");

let internals = {};

internals.describe = async (tableName) => {
  return await dynamo.dynamoDB.describeTable({TableName: tableName}).promise();
};

internals.checkInSchema = (primary, sort, schema, indexName) => {
  if (schema[primary] == null) {
    throw indexName ? `${indexName} primary key` : "Primary key" + "is not specified in the schema";
  }
  if (sort != null && schema[sort] == null) {
    throw indexName ? `${indexName} sort key` : "Sort key" + "is not specified in the schema";
  }
};

internals.addKeyAttribute = (params, key, keyType, type, keySchemaObj = null) => {
  if (keySchemaObj == null) {
    keySchemaObj = params;
  }
  if (!(params.KeySchema instanceof Array)) {
    keySchemaObj.KeySchema = [];
  }
  if (!(params.AttributeDefinitions instanceof Array)) {
    params.AttributeDefinitions = [];
  }
  keySchemaObj.KeySchema.push({
    AttributeName: key,
    KeyType: keyType
  });
  params.AttributeDefinitions.push({
    AttributeName: key,
    AttributeType: type
  });
};

function Index(name) {
  this._name = name;
  return this;
}

Index.prototype.getName = function() {
  return this._name;
};

Index.prototype.primary = function(primary) {
  this._primary = primary;
  return this;
};

Index.prototype.sort = function(sort) {
  this._sort = sort;
  return this;
};

Index.prototype.getPrimary = function() {
  return this._primary;
};

Index.prototype.getSort = function() {
  return this._sort;
};

Index.prototype.local = function() {
  this._isLocal = true;
  return this;
};

Index.prototype.getLocal = function() {
  return this._isLocal;
};

function Table(name) {
  if (typeof name !== "string") {
    throw "Table name must be of type string.";
  }
  this._name = name;
  this._indexes = [];
  return this;
}

Table.prototype.getName = function() {
  return this._name;
};

Table.prototype.primary = function(primary) {
  this._primary = primary;
  return this;
};

Table.prototype.sort = function(sort) {
  this._sort = sort;
  return this;
};

Table.prototype.getPrimary = function() {
  return this._primary;
};

Table.prototype.getSort = function() {
  return this._sort;
};


Table.prototype.schema = function(schema) {
  this._schema = schema;
  return this;
};

Table.prototype.validateAgainstSchema = function(obj) {
  return this._schema != null ? schema.object(this._schema).validate(obj) : true;
};

Table.prototype.limit = function(count) {
  this._limit = count;
  return this;
};

Table.prototype.readCapacity = function(capacity) {
  this._readCapacity = capacity;
  return this;
};

Table.prototype.writeCapacity = function(capacity) {
  this._writeCapacity = capacity;
  return this;
};

Table.prototype.hasStream = function(viewType = "NEW_AND_OLD_IMAGES") {
  this._stream = viewType;
  return this;
};

Table.prototype.getLimit = function() {
  return this._limit;
};

Table.prototype.addGlobalIndex = function(name, primary, sort) {
  let index = new Index(name).primary(primary);
  if (sort) {
    index.sort(sort);
  }
  this._indexes.push(index);
  return this;
};

Table.prototype.addLocalIndex = function(name, primary, sort) {
  let index = new Index(name).primary(primary).local();
  if (sort) {
    index.sort(sort);
  }
  this._indexes.push(index);
  return this;
};

Table.prototype.validate = function() {
  let schema = this._schema, indexes = this._indexes, primary = this._primary, sort = this._sort;
  internals.checkInSchema(primary, sort, schema);
  for (let index of indexes) {
    internals.checkInSchema(index.getPrimary(), index.getSort(), schema, index.getName());
  }
  return this;
};

Table.prototype.exists = async function() {
  let resp = {exists: true};
  try {
    let described = await internals.describe(this._name);
    if (described) {
      resp.status = described.Table.TableStatus;
    }
  } catch (err) {
    if (err && err.code === "ResourceNotFoundException") {
      resp.exists = false;
    } else {
      throw err;
    }
  }
  return resp;
};

Table.prototype.roughCount = async function() {
  let described = await internals.describe(this._name);
  return described ? described.Table.ItemCount : 0;
};

Table.prototype.ready = async function() {
  this.validate();
  let info = await this.exists();
  return (info.exists && info.status === "ACTIVE");
};

Table.prototype.create = async function() {
  if (await this.ready()) {
    return;
  }
  let schema = this._schema, primary = this._primary, sort = this._sort, indexes = this._indexes;
  let provisioned = {};
  if (this._readCapacity != null) {
    provisioned.ReadCapacityUnits = this._readCapacity;
  }
  if (this._writeCapacity != null) {
    provisioned.WriteCapacityUnits = this._writeCapacity;
  }
  let params = {
    TableName: this._name,
    KeySchema: [],
    AttributeDefinitions: []
  };
  if (Object.keys(provisioned).length !== 0) {
    params.ProvisionedThroughput = provisioned;
  }
  internals.addKeyAttribute(params, primary, "HASH", utils.schemaToDynamo(schema[primary]));
  if (sort != null) {
    internals.addKeyAttribute(params, sort, "RANGE", utils.schemaToDynamo(schema[sort]));
  }
  for (let index of indexes) {
    let indexArrayName = index.getLocal() ? "LocalSecondaryIndexes" : "GlobalSecondaryIndexes";
    let idxPrimary = index.getPrimary(), idxSort = index.getSort();
    let indexParams = {
      IndexName: index.getName(),
      KeySchema: [],
      Projection: {
        ProjectionType: "ALL"
      }
    };
    if (Object.keys(provisioned).length !== 0) {
      indexParams.ProvisionedThroughput = provisioned;
    }
    internals.addKeyAttribute(params, idxPrimary, "HASH", utils.schemaToDynamo(schema[idxPrimary]), indexParams);
    if (idxSort != null) {
      internals.addKeyAttribute(params, idxSort, "RANGE", utils.schemaToDynamo(schema[idxSort]), indexParams);
    }
    if (!(params[indexArrayName] instanceof Array)) {
      params[indexArrayName] = [];
    }
    params[indexArrayName].push(indexParams);
  }
  await dynamo.dynamoDB.createTable(params).promise();
};


module.exports = Table;
