const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'})

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @param {string} event.resource - Resource path.
 * @param {string} event.path - Path parameter.
 * @param {string} event.httpMethod - Incoming request's method name.
 * @param {Object} event.headers - Incoming request headers.
 * @param {Object} event.queryStringParameters - query string parameters.
 * @param {Object} event.pathParameters - path parameters.
 * @param {Object} event.stageVariables - Applicable stage variables.
 * @param {Object} event.requestContext - Request context, including authorizer-returned key-value pairs, requestId, sourceIp, etc.
 * @param {Object} event.body - A JSON string of the request payload.
 * @param {boolean} event.body.isBase64Encoded - A boolean flag to indicate if the applicable request payload is Base64-encode
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 * @param {string} context.logGroupName - Cloudwatch Log Group name
 * @param {string} context.logStreamName - Cloudwatch Log stream name.
 * @param {string} context.functionName - Lambda function name.
 * @param {string} context.memoryLimitInMB - Function memory.
 * @param {string} context.functionVersion - Function version identifier.
 * @param {function} context.getRemainingTimeInMillis - Time in milliseconds before function times out.
 * @param {string} context.awsRequestId - Lambda request ID.
 * @param {string} context.invokedFunctionArn - Function ARN.
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * @returns {boolean} object.isBase64Encoded - A boolean flag to indicate if the applicable payload is Base64-encode (binary support)
 * @returns {string} object.statusCode - HTTP Status Code to be returned to the client
 * @returns {Object} object.headers - HTTP Headers to be returned
 * @returns {Object} object.body - JSON Payload to be returned
 *
 */
exports.lambdaHandler = (event, context, callback) => {
    let result = {statusCode: 200}
    const goodOrigins = ['http://localhost:3000', 'https://localhost:3000', 'https://ride-sharing.tk']
    const headers = {}
    for (const key in event.headers) {
      headers[key.toLowerCase()] = event.headers[key].trim().toLowerCase()
    }
    const requestedOrigin = headers.origin
    if (!requestedOrigin || !goodOrigins.includes(requestedOrigin)) {
      result.statusCode = 403
      result.body = JSON.stringify({
        message: 'not an allowed origin'
      })
      callback(null, result)
      return
    }
    result.headers = {
      "Access-Control-Allow-Origin": requestedOrigin
      // ,"Content-Type": 'application/vnd.api+json'
    }
    // we should be checking the Accept request header here - TODO
    list((err, items) => {
      if (items) {
        result.body = JSON.stringify(items)
        callback(null, result)
        return
      }
      if (err) {
        result.body = JSON.stringify({errors: [err]})
        callback(result, null)
        return
      }
      result.body = JSON.stringify({errors: []})
      callback(null, result)
    })
  }

  const list = (callback) => {
    dynamo.scan({
      TableName: process.env.TABLE_NAME,
      Limit: 100
    }, (err, data) => {
      if (data) {
        const payload = data.Items.map(ride => {return {
          type: 'ride',
          id: ride.id,
          attributes: {
            from: ride.from,
            to: ride.to,
            when: ride.when
          },
          relationships: {
            owner: {
              data: {
                type: 'user',
                id: ride.sub
              }
            }
          }
        }})
        // payload based on JSON:API spec. Not used for now.
        callback(null, data.Items)
      }
      else if (err) {
        callback(err, null)
      }
      else {
        callback(new Error('no rides, no error'), [])
      }
    })
  }

  exports.list = list
