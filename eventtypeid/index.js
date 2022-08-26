const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

exports.handler = async (event) => {
    console.log(event);

    let results = new Set();

	const documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

    var params = {
        TableName: 'ATWOOD'
    };

    console.log(params);

	console.log('scanning pass');

    const items =  await documentClient.scan(params).promise();
    items.Items.forEach((item) => results.add(item.eventTypeId));

    console.log('results');
    console.log(Array.from(results));

    const response = {
        statusCode: 200,
        body: Array.from(results)
    };

    return response;    
}