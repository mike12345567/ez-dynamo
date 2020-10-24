const ezDynamo = require("../index"),
  schema = ezDynamo.schema,
  Table = ezDynamo.Table;

// mocking credentials for local dynamo
ezDynamo.configureFromArg("eu-west-1", "http://localhost:8123", "mock", "mock");

const userTable = new Table("usersTable")
  .primary("username")
  .sort("lastLogin")
  .schema({
    username: schema.string(),
    lastLogin: schema.number(),
    email: schema.string().email(),
    phone: schema.string().alphanum(),
    admin: schema.boolean(),
    preferences: schema.object(),
    password: schema.string(),
    smartPlugs: schema.array()
  })
  .addGlobalIndex("email-index", "email")
  .writeCapacity(2)
  .readCapacity(2);

async function runTest() {
  await userTable.validate().create();
}

if (require.main === module) {
  runTest().then(() => {
    console.log("Table created successfully!");
  });
}

module.exports = userTable;
