let AWS = require("aws-sdk");
let schema = require("./schema");

module.exports.configured = false;

module.exports.getAWSEndpoint = (region) => {
  return `https://dynamodb.${region}.amazonaws.com`;
};

module.exports.init = (endpoint) => {
  let opts = {correctClockSkew: true, endpoint: endpoint};
  module.exports.dynamoDB = new AWS.DynamoDB(opts);
  module.exports.docClient = new AWS.DynamoDB.DocumentClient(opts);
  module.exports.configured = true;
};

module.exports.AWS = AWS;