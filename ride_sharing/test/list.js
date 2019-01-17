const DynamoDB = require('aws-sdk').DynamoDB
const sinon = require('sinon')
const list = require('../list').list
const handler = require('../list').lambdaHandler
const expect = require('chai').expect

describe("List method", () => {

  const sandbox = sinon.createSandbox()

  afterEach(() => {
    sandbox.restore()
  })

  it('returns an empty list if there are no rides', (done) => {
    sandbox.stub(DynamoDB.DocumentClient.prototype, 'scan').callsFake((tableName, callback) => {
      callback(null, {Items: []})
    })
    list((err, items) => {
      expect(items).to.have.lengthOf(0)
      done()
    })
  })
})

describe("List handler", () => {
  it('returns an error if there is no Origin header', (done) => {
    const event = {headers: {}}
    const context = null
    handler(event, context, (err, result) => {
      expect(result).not.to.be.null
      expect(result.statusCode).to.equal(403)
      expect(err).to.be.null
      done()
    })
  })
})
