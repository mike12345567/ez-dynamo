const userTable = require("./create-table");

const date = Date.now();
const USER_OBJ = {
  username: "mdrury",
  lastLogin: date,
  email: "test@test.com",
  admin: true
};
const wait = timeout => new Promise(resolve => setTimeout(resolve, timeout));

async function runTest() {
  await userTable.validate().create();
  await wait(1000);
  await userTable.put(USER_OBJ).run();
  await userTable
    .update()
    .primary("mdrury")
    .sort(date)
    .add("smartPlugs", "UK")
    .onlyIf()
    .property("lastLogin")
    .lessThanEqual(Date.now())
    .run();
  return await userTable
    .get()
    .primary("mdrury")
    .sort(date)
    .run();
}

runTest().then(user => {
  console.log("Found user: " + JSON.stringify(user));
});
