const DynamoDB = require('aws-sdk').DynamoDB
const sinon = require('sinon')
const list = require('../list').list
const handler = require('../list').lambdaHandler
const expect = require('chai').expect

const createDefaultScanStub = sandbox => {
  sandbox.stub(DynamoDB.DocumentClient.prototype, 'scan').callsFake((tableName, callback) => {
    callback(null, {Items: []})
  })
}

describe("List method", () => {

  const sandbox = sinon.createSandbox()

  afterEach(() => {
    sandbox.restore()
  })

  it('returns an empty list if there are no rides', (done) => {
    createDefaultScanStub(sandbox)
    list((err, items) => {
      expect(items).to.have.lengthOf(0)
      done()
    })
  })
})

const origin = 'https://ride-sharing.tk'
const FORBIDDEN_STATUS = 403
const ORIGIN_CORS_RESPONSE_HEADER = 'Access-Control-Allow-Origin'

describe("List handler", () => {

  const sandbox = sinon.createSandbox()
  const event = {}
  const context = null

  beforeEach(() => {
    createDefaultScanStub(sandbox)
    event.headers = {
      Origin: origin
    }
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('if it is given allowed origin', () => {
    it('returns the origin CORS header', (done) => {
      handler(event, context, (err, result) => {
        console.log(`received ${JSON.stringify(result)}`)
        const headers = result.headers
        expect(headers).not.to.be.null
        expect(headers).to.have.property(ORIGIN_CORS_RESPONSE_HEADER, origin)
        expect(result.statusCode).to.equal(200)
        expect(err).to.be.null
        done()
      })
    })
    it('returns the origin CORS header regardless of case in the header key', (done) => {
      event.headers = {
        'oRigiN': origin
      }
      handler(event, context, (err, result) => {
        const headers = result.headers
        expect(headers).to.have.property(ORIGIN_CORS_RESPONSE_HEADER, origin)
        done()
      })
    })
  })
  it('returns a forbidden status if there is no Origin header', (done) => {
    event.headers = {}
    handler(event, context, (err, result) => {
      expect(result.statusCode).to.equal(FORBIDDEN_STATUS)
      done()
    })
  })
})
