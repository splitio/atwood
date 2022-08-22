const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
const url = require('url');

exports.handler = async (event) => {
    console.log(event);
    if(!event.queryStringParameters
        || !event.queryStringParameters.eventTypeId) {
        const response = {
            statusCode: 400,
            body: {'error':'missing query parameter <eventTypeId>'}
        };
        return response;
    } else if (!event.queryStringParameters
        || !event.queryStringParameters.last) {
        const response = {
            statusCode: 400,
            body: {'error':'missing query parameter <last>'}
        };
        return response;
    } else if (!event.queryStringParameters
        || !event.queryStringParameters.unit_of_time) {
        const response = {
            statusCode: 400,
            body: {'error': 'missing query parameter <unit_of_time>'}
        }
        return response;
    }

    const eventTypeId = event.queryStringParameters.eventTypeId;
    const last = event.queryStringParameters.last;
    const unit_of_time = event.queryStringParameters.unit_of_time;

    console.log(eventTypeId);
    console.log(last);
    console.log(unit_of_time);

    let results = [];

    const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    // const params = 
    // {
    //     TableName : 'ATWOOD',
    //     IndexName: 'eventTypeId-time-index',
    //     KeyConditionExpression: 'eventTypeId = :eventTypeId',
    //     // ExpressionAttributeNames: {
    //     //     '#eventTypeId': 'eventTypeId'
    //     // },
    //     ExpressionAttributeValues:{
    //         ':eventTypeId': { 'S' : eventTypeId } 
    //     }
    // };    

    let unit = 60 * 1000;
    if(unit_of_time === 'h') {
        unit *= 60;
    } else if (unit_of_time === 'd') {
        unit *= 60 * 24;
    } else {
        // must be min
        if(unit_of_time !== 'm') {
            const response = {
                statusCode: 400,
                body: {'error': 'unit of time must be \'m\' for minutes, \'h\' for hours, or \'d\' for days'}
            }
            return response;
        }
    }

    const edgeOfTime = new Date().getTime() - (last * unit);

    var params = {
        ExpressionAttributeValues: {
            ':e': {S: eventTypeId},
            ':t' : {N: '' + edgeOfTime},
        },
        KeyConditionExpression: 'eventTypeId = :e and split_time > :t',
        TableName: 'ATWOOD',
        IndexName: 'eventTypeId-split_time-index',
    };

    console.log(params);


    // let promise = new Promise((resolve, reject) => {
    //   ddb.scan(params, function(err, data) {
    //     if(err) {
    //       reject(err);
    //     } else {
    //       resolve(data);
    //     }
    //   });
    // });


    const promise = new Promise((resolve, reject) => {
        ddb.query(params, function(err, data) {
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

    await promise.then(data => {
        data.Items.forEach(function(element, index, array) {
            results.push(
                {
                    eventTypeId: element.eventTypeId.S,
                    key: element.key.S, 
                    split: element.split.S, 
                    time: parseInt(element.split_time.N),
                    treatment: element.treatment.S,
                    value: parseInt(element.value.N)
                });
        });
    }).catch(error => {
        console.log(error);
        const response = {
            statusCode: 500,
            body: {'error': 'error during query: ' + error}
        }
        return response;
    })

    const response = {
        statusCode: 200,
        body: results
    };
    return response;
};

