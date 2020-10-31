## DynamoDB Operations

In this section we will discuss the operations that are supported by the module currently and how they are supported. In
general this module focuses on support of the DynamoDB [Document Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html),
but some normal AWS Dynamo SDK operations are supported, such as table creation and so on. In this section we will cover
the specific parameters that each operation supports through the Document Client.

Please note that there is a lot of extra parameters that are supported by DynamoDB but this module works on the latest
options and will not be supporting any legacy options, in general most legacy operations have been replaced with the use
of the `ConditionExpression`.

### Create Table
Currently the process of creating a table is quite simple, an example of this has been shown in `examples/create-table.js`.

### Put item
This module allows putting items to a Dynamo table and it supports the following components of the put call:
* TableName - the table which the item is to be written to.
* Item - the item which is to be written, a JSON object.
* ReturnValues - if overwrite is enabled then any old object that is overwritten during a put will be returned.

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
* UpdateExpression - this string is built by the update operation, reducing the complexity of building it. It should be
noted initially some of the complex functionality of this like incrementing and decrementing, list appending will not be
supported.

# To be supported
The following section contains the rough design for what is to come.

### Update item
Still to be supported:
* ReturnValues - all values are supported in some manner, allowing returning the previous state of the database entry.

### Delete item
This is a very basic operation and the following will be supported:
* Returning the value of the item before the deletion was performed, in the same manner as the ReturnValues of update call.
* ConditionExpression as with all write operations.
* This will appear very similar to the get operation, simply supplying the key and run for it to operate.

### Scan items
To be supported:
* Pagination with the help of the `ExclusiveStartKey` - the result of a scan will be a "page" which can be continued.
* Limits will be supported, allowing setting the maximum number of items per page.
* Scanning an index will be supported, supplying the index name.
* ProjectionExpression will be supported as with the get operation.
* Filter expression will be supported, this is identical to the format of the write conditions.
* ConsistentRead will be supported.

In the future after the full basic functionality has been built the following will be provided:
* Parallel scanning will be supported with the `Segment` and `TotalSegments` parameters, this allows specifying the
number of workers which will be handling the scan with the total and then the segment essentially identifies that
particular worker. This is an advanced feature and will only be built out eventually for use with worker threads.

### Querying
Currently the query has not been built or designed yet.

### Batch write/reads
Once all read/write operations have been completed there will be a process developed to wrap multiple read/write operations
in a batch and send them all off at once.

### Transactions
Once all read/write operations have been completed as part of the batch write/read update transactions will be completed as well.

### Table operations
Still to be supported:
* Returning a list of currently configured indexes, the name and keys of them.
