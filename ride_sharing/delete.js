const AWS = require('aws-sdk')
const jwt = require ('jsonwebtoken')

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
  const id = event.pathParameters.rideID
  const token = jwt.decode(event.headers.Authorization.slice(6).trim())
  const user = token.sub
  let result = {statusCode: 200}
  result.headers = {
    "Access-Control-Allow-Origin": '*'
  }
  dynamo.delete({
      Key: {id: id},
      TableName: process.env.TABLE_NAME,
      // access control logic - only let users delete their own rides
      ConditionExpression: "#owner = :caller",
      ExpressionAttributeValues: {
        ":caller": user
      },
      // having to jump through hoops as sub is a reserved word in DynamoDB
      ExpressionAttributeNames: {
        "#owner": "sub"
      }
    }, (err, data) => {
      if (data)
        callback(null, result)
      if (err) {
        result.statusCode = 403
        result.body = JSON.stringify({
          message: 'users can only delete their own rides'
        })
        callback(null, result)
      }
  })
}
