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
  let result = {statusCode: 403}
  result.headers = {}
  const ORIGIN = 'origin'
  const REQUEST_METHOD = 'access-control-request-method'
  const REQUEST_HEADERS = 'access-control-request-headers'
  const allowedOrigins = ['http://localhost:3000', 'https://localhost:3000', 'https://ride-sharing.tk']
  const allowedMethods = ['get', 'post', 'delete', 'put']
  const allowedHeaders = ['content-type', 'authorization', 'x-api-key']
  const headers = {}
  for (const key in event.headers) {
    headers[key.toLowerCase()] = event.headers[key].trim().toLowerCase()
  }
  let requestedOrigin = headers[ORIGIN]
  let requestedMethod = headers[REQUEST_METHOD]
  let requestedHeaders = headers[REQUEST_HEADERS]
  if (!(requestedOrigin && requestedMethod && requestedHeaders)) {
    result.body = JSON.stringify({
      message: `missing CORS request header or headers`
    })
    callback(null, result)
    return
  }
  requestedOrigin = requestedOrigin
  requestedMethod = requestedMethod
  requestedHeaders = requestedHeaders
                            .split(',')
                            .map(h => h.trim().toLowerCase())
  if (!allowedOrigins.includes(requestedOrigin)
      || !allowedMethods.includes(requestedMethod)
      || !requestedHeaders.every(requestedHeader => allowedHeaders.includes(requestedHeader))) {
    result.body = JSON.stringify({
      message: `CORS not allowed`
    })
    callback(null, result)
    return
  }
  result.statusCode = 200
  result.headers = {
    "Access-Control-Allow-Headers": headers[REQUEST_HEADERS],
    "Access-Control-Allow-Methods": headers[REQUEST_METHOD],
    "Access-Control-Allow-Origin": headers[ORIGIN],
    "Access-Control-Max-Age": 600
  }
  callback(null, result)
}
