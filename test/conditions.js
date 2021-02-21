let chai = require("chai");
let should = chai.should();

// use the core operation to test against
const BasicWrite = require("../lib/operations/base/basic-write");
const Condition = require("../lib/operations/conditions");

describe("Test some basic conditions", () => {
  let condition, basicWrite;

  beforeEach(() => {
    basicWrite = new BasicWrite();
    condition = new Condition(basicWrite);
  });

  it("should successfully create an equality condition", () => {
    condition
      .property("test")
      .equals(1)
      .and()
      .property("test2")
      .equals(2);
    const params = basicWrite.getParams();
    params.ExpressionAttributeValues[":cnd101"].should.equal(1);
    params.ExpressionAttributeValues[":cnd103"].should.equal(2);
    params.ExpressionAttributeNames["#cnd100"].should.equal("test");
    params.ExpressionAttributeNames["#cnd102"].should.equal("test2");
    params.ConditionExpression.should.equal("#cnd100 = :cnd101 AND #cnd102 = :cnd103");
  });

  it("should successfully create a list condition", () => {
    condition.property("test").oneOf(["1", "2", "3", "4"]);
    const params = basicWrite.getParams();
    params.ExpressionAttributeNames["#cnd100"].should.equal("test");
    params.ExpressionAttributeValues[":cnd101"].should.equal("1");
    params.ExpressionAttributeValues[":cnd102"].should.equal("2");
    params.ExpressionAttributeValues[":cnd103"].should.equal("3");
    params.ExpressionAttributeValues[":cnd104"].should.equal("4");
    params.ConditionExpression.should.equal("#cnd100 IN (:cnd101,:cnd102,:cnd103,:cnd104)");
  });

  it("should allow nested properties correctly", () => {
    condition.property("test.testing").equals(1);
    const params = basicWrite.getParams();
    params.ExpressionAttributeNames["#cnd100"].should.equal("test");
    params.ExpressionAttributeNames["#cnd101"].should.equal("testing");
    params.ConditionExpression.should.equal("#cnd100.#cnd101 = :cnd102");
  });
});
