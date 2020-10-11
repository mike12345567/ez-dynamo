let dynamo = require("../dynamo"),
  opUtils = require("./op-utils"),
  BasicWrite = require("./basic-write");

let internal = {};

internal.getOperationString = (paramStr, type) => {
  switch (type) {
    case "SET":
      return `#${paramStr} = :${paramStr}`;
    case "ADD":
    case "DELETE":
      return `#${paramStr} :${paramStr}`;
    case "REMOVE":
      return `#${paramStr}`;
  }
};

internal.generateParamsFromPropArray = (array, expression, count, type) => {
  expression = expression == null ? "" : expression + " ";
  let params = {};
  let first = true;
  for (let el of array) {
    let obj = {};
    let paramStr = `${type}${count}`;
    expression += `${type === "SET" && !first ? ", " : type} ${internal.getOperationString(paramStr, type)}`;
    if (el.property) {
      obj.ExpressionAttributeNames = {
        [`#${paramStr}`]: el.property
      };
    }
    if (el.value) {
      obj.ExpressionAttributeValues = {
        [`:${paramStr}`]: el.value
      };
    }
    params = opUtils.assignNested(params, obj);
    first = false;
  }
  params.UpdateExpression = expression;
  return params;
};

function Update(table) {
  BasicWrite.call(this);
  this.addCondition("existence", `attribute_exists(${table.getPrimary()})`);
  this.appendToParams({ TableName: table.getName() });
  this.table = table;
  this.propCount = 0;
  this.expressions = {
    REMOVE: [],
    DELETE: [],
    SET: [],
    ADD: []
  };
}

Update.prototype = Object.create(BasicWrite.prototype);
Update.prototype.constructor = Update;

Update.prototype.primary = function(value) {
  let primaryName = this.table.getPrimary();
  this.table.isValidValueForProperty(primaryName, value);
  this.appendToParams({ Key: { [primaryName]: value } });
  return this;
};

Update.prototype.sort = function(value) {
  let sortName = this.table.getSort();
  if (sortName == null) {
    throw "No sort property specified for table.";
  }
  this.table.isValidValueForProperty(sortName, value);
  this.appendToParams({ Key: { [sortName]: value } });
  return this;
};

Update.prototype.setProperty = function(property, value) {
  if (!this.table.isValidValueForProperty(property, value)) {
    throw "The value specified is not valid for the property schema.";
  }
  this.expressions.SET.push({ property, value });
  return this;
};

Update.prototype.removeProperty = function(property) {
  if (!this.table.isValidProperty(property)) {
    throw "The property specified is not in the table schema.";
  }
  this.expressions.REMOVE.push({ property });
  return this;
};

Update.prototype.addToProperty = function(property, value) {
  if (!this.table.isValidValueForProperty(property, value)) {
    throw "The value specified is not valid for the property schema.";
  }
  this.expressions.ADD.push({ property, value });
};

Update.prototype.deleteFromProperty = function(property, value) {
  if (!this.table.isValidValueForProperty(property, value)) {
    throw "The value specified is not valid for the property schema.";
  }
  this.expressions.DELETE.push({ property, value });
};

Update.prototype.createIfNotExist = function() {
  this.removeCondition("existence");
};

Update.prototype.finalise = function() {
  for (let key of Object.keys(this.expressions)) {
    let expression = this.getParams().UpdateExpression;
    this.appendToParams(internal.generateParamsFromPropArray(this.expressions[key], expression, this.propCount, key));
    this.propCount++;
  }
};

Update.prototype.run = function() {
  let updateObj = this;

  return new Promise((resolve, reject) => {
    updateObj.finalise();
    if (updateObj.propCount === 0) {
      reject("No properties added to update call.");
      return;
    }
    dynamo.docClient.update(updateObj.getParams(), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = Update;
