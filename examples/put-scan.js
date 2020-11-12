const userTable = require("./create-table");

const usernames = ["mdrury", "jsmith", "tname", "asmith", "dsloth"];

async function runTest() {
  const date = Date.now();
  await userTable.validate().create();
  let adminCount = 3;
  for (let username of usernames) {
    const admin = adminCount-- > 0
    await userTable
      .put({ username, lastLogin: date, email: "test@test.com", admin })
      .run();
  }
  let operation = userTable.scan().limit(1);
  // currently have to attach filter separately
  operation.where().property("admin").equals(true);
  let items = [];
  do {
    items = items.concat(await operation.run());
  } while (!operation.finished());
  return items;
}

runTest().then(users => {
  console.log("User count: " + users.length);
});
