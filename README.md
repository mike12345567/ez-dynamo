# Ez (Easy) DynamoDB

Thanks for having a look at my library for simplifying your Node DynamoDB usage!

This module is designed to reduce the effort required to get up and running with DynamoDB 
and make it a bit more friendly to use than the standard DynamoDB DocumentClient.

While this is a lot easier to use than basic DynamoDB it is generally still quite 
complex as it uses a lot of somewhat confusing language of the DynamoDB API still, 
documentation of the Document Client can be found [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html).

## Why?

First question you might ask is why I might make another library for this as there are some pretty 
good libraries out there already. That's a very good question, one that I've asked myself a few
times since starting this! The main reasons are as follows:

1. *Simple and easy to use out of the box* - some of the libraries out there right now take some 
time to get setup properly.
2. *Convention over configuration* - some of the libraries out there give you the ability to configure
every single option of Dynamo, while in my experience the vast majority of options for standard
projects should be left as standard until a specific use case is found.
3. *Pure JS* - Typescript is great, but not the perfect tool for every project. Sometimes you might
want to put together a quick script or Lambda that performs some basic Dynamo calls, your database 
library shouldn't impose a language choice on you.
4. *Parameter builder, not a Modeling tool* - Modeling tools are nice, like Mongoose or Sequelize,
but often you as the developer end up learning the intricacies of the library rather than the 
database itself. This knowledge is non-transferable between languages and sometimes even frameworks -
I'm not trying to lock you in like that. Ideally this library should only simplify creating Dynamo
parameters; ideally when building queries you will still be looking at the Dynamo docs to understand how 
certain parameters work (rather than docs for this library).

## Examples
Some some quick examples! To get the full ins and outs of this look into the `examples` directory where 
I have fleshed out some full examples of how this stuff works.

So, lets see how easy it is to create a table, write something and then get it back:
```
let userTable = new Table("usersTable")
  .primary("username")
  .sort("lastLogin")
  .schema({
    username: schema.string(),
    lastLogin: schema.number(),
    email: schema.string().email(),
    admin: schema.boolean(),
    preferences: schema.object(),
  })
  .addGlobalIndex("email-index", "email")
  .writeCapacity(2)
  .readCapacity(2);
await userTable
  .put({ 
    username: "mdrury", 
    lastLogin: date, 
    email: "test@test.com", 
    admin: true 
  }).run();
return await userTable
  .get()
  .primary("mdrury")
  .sort(date)
  .properties(["email", "admin", "username", "preferences"])
  .run();
```

## Inspirations
1. [dynamodb](https://github.com/baseprime/dynamodb) - loved the use of JOI as a validation library.
2. [dynamo-easy](https://github.com/shiftcode/dynamo-easy) - a fantastic library for Typescript which has 
inspired me in terms of syntax cascading for query/update building. If you're reading this I'm sorry
about the close choice of name, I actually picked my name before even seeing this library!