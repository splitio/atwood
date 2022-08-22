const AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

exports.handler = async (event) => {
    console.log(event);
    const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    const body = JSON.parse(event.body);
    console.log(body);

    if(body) {
        let pass = true;
        let error = '';
        if(!body.key) {
            pass = false;
            error = 'key'
        } else if (!body.split) {
            pass = false;
            error = 'split';
        } else if (!body.time) {
            pass = false;
            error = 'time';
        } else if (!body.treatment) {
            pass = false;
            error = 'treatment';
        } else if (!body.eventTypeId) {
            pass = false;
            error = 'eventTypeId';
        } else if (!body.trafficTypeName) {
            pass = false;
            error = 'trafficTypeName';
        }

        if(!pass) {
            const missingInput = {
                statusCode: 400,
                body: 'missing input: ' + error
            }
            return missingInput;
        }
    }

    let Items = {};
    Items['ID'] = {S: uuidv4()};

    const now = new Date().getTime();
    const nowInSeconds = Math.round(now / 1000);
    const ttl = nowInSeconds + (60 * 60 * 24 * 7);
    Items['ttl'] = {'N' : '' + ttl }; 

    Object.keys(body).forEach((key) => {
        if(key === 'time') {
            Items['split_time'] = {N: '' + body[key]};
        } else if (key === 'value') {
            Items[key] = {N: '' + body[key]};
        } else if (key === 'properties') {
            Items[key] = {S: JSON.stringify(body[key])};
        } else {
            Items[key] = {S: body[key]};
        }
    });

    const params = {
      TableName: 'ATWOOD',
      Item: Items
    }
    let code;
    let results;

    console.log(params);

    await ddb.putItem(params, function(err, data) {
      if(err) {
        console.log(err);
        const error = {
            statusCode: 500,
            body: err
        }
        return error;
      } else {
        console.log('success');
      }
    }).promise();    


    const response = {
        statusCode: 200,
        body: 'success',
    };
    return response;
};

