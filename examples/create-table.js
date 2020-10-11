let ezDynamo = require("../index"),
  schema = ezDynamo.schema,
  Table = ezDynamo.Table;

ezDynamo.configure("eu-west-1", "http://localhost:8123");

let userTable = new Table("usersTable")
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
  runTest()
    .then(() => {
      console.log("Table created successfully!");
    })
    .catch(err => {
      console.error("Failed for reason: " + JSON.stringify(err));
    });
}

module.exports = userTable;
