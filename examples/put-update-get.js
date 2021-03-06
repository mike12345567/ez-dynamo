const userTable = require("./create-table");

async function runTest() {
  const date = Date.now();
  await userTable.validate().create();
  await userTable
    .put({ username: "mdrury", lastLogin: date, email: "test@test.com", admin: true })
    .run();
  await userTable
    .update()
    .primary("mdrury")
    .sort(date)
    .setProperty("preferences", { testing: true })
    .removeProperty("admin")
    .run();
  return await userTable
    .get()
    .primary("mdrury")
    .sort(date)
    .properties(["email", "admin", "username", "preferences"])
    .run();
}

runTest().then(user => {
  console.log("Found user: " + JSON.stringify(user));
});
