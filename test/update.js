const chai = require("chai");
const should = chai.should();

const ezDynamo = require("../index"),
  schema = ezDynamo.schema,
  Table = ezDynamo.Table;

ezDynamo.configureFromArg("eu-west-1", "http://localhost:8123", "mock", "mock");

let table

describe("Test some basic updates", () => {
  it("should successfully create a table and entry", async () => {
    table = new Table("testing")
      .primary("test")
      .schema({
        test: schema.string(),
        string: schema.string(),
        number: schema.number(),
        set: schema.array(),
      })
      .writeCapacity(2)
      .readCapacity(2);
    await table.validate().create();
    await table.put({
      test: "TEST",
      string: "TEST",
      number: 1
    }).run();
  });

  it("should allow a basic update of the 'string' prop", async () => {
    await table.update().primary("TEST").set("string", "UPDATE").run();
    const obj = await table.get().primary("TEST").run();
    obj.string.should.equal("UPDATE");
  });
});