## DynamoDB Operations

In this section we will discuss the operations that are supported by the module currently and how they are supported. In
general this module focuses on support of the DynamoDB [Document Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html),
but some normal AWS Dynamo SDK operations are supported, such as table creation and so on. In this section we will cover
the specific parameters that each operation supports through the Document Client.

Please note that there is a lot of extra parameters that are supported by DynamoDB but this module works on the latest
options and will not be supporting any legacy options, in general most legacy operations have been replaced with the use
of the `ConditionExpression`.

### Create Table

### Put item
This module allows putting items to a Dynamo table and it supports the following components of the put call:
* TableName - the table which the item is to be written to.
* Item - the item which is to be written, a JSON object.
* ReturnValues - if overwrite is enabled then any old object that is overwritten during a put will be returned.

The following is not yet fully supported:
* ConditionExpression, ExpressionAttributeNames and ExpressionAttributeValues - these parameters are used to generate
conditional puts, e.g. under certain circumstances the put will complete, otherwise it will fail. This will be supported
in the future as it can be very useful for confirming the state of an entry before writing in an atomic manner.

### Get item
This module allows getting items from a DynamoDB table and it supports the following components of the get call:
* TableName - the table which the item will be retrieved from.
* Key - the key of the entry to retrieve.
* ProjectionExpression - the properties to retrieve from the object, if not all.
* ConsistentRead - retrieve the entry in a strongly consistent read.

### Update item
This module allows updating items within a DynamoDB table and it supports the following components of the update call:
* TableName - the table that the update call is to take place in.
* Key - the key of the entry which is to be updated.
* UpdateExpression - this string is built by the update operation, reducing the complexity of building it.
* ReturnValues - all values are supported in some manner, allowing returning the previous state of the database entry.

The following is not yet fully supported:
* ConditionExpression, ExpressionAttributeNames and ExpressionAttributeValues - these parameters are used to generate
conditional updates, e.g. under certain circumstances the update will complete, otherwise it will fail. This will be supported
in the future as it can be very useful for confirming the state of an entry before writing in an atomic manner.