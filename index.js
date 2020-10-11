let Operations = require("./lib/Operations");
let schema = require("./lib/schema");
let dynamo = require("./lib/dynamo");

function setRegion(region) {
  dynamo.AWS.config.update({ region });
}

module.exports = {
  Table: Operations,
  schema: schema,
  dynamo,
  getAWSEndpoint: dynamo.getAWSEndpoint,

  configure: function(region, endpoint) {
    setRegion(region);
    dynamo.init(endpoint);
  },
  configureFromPath: function(region, endpoint, path) {
    setRegion(region);
    dynamo.AWS.config.loadFromPath(path);
    dynamo.init(endpoint);
  },
  configureFromArg: function(region, endpoint, secretAccessKey, accessKeyId) {
    setRegion(region);
    dynamo.AWS.config.update({ secretAccessKey, accessKeyId });
    dynamo.init(endpoint);
  }
};
