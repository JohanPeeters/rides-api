const sinon = require('sinon')
const handler = require('../options').lambdaHandler
const expect = require('chai').expect

describe('Options handler', () => {
  const event = {}
  const context = null
  beforeEach(() => {
    event.headers = {
      Origin: 'https://ride-sharing.tk',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'x-api-key'
    }
  })
  describe('if it is given allowed origin, methods and headers', () => {
    it('returns all CORS headers', (done) => {
      handler(event, context, (err, result) => {
        const headers = result.headers
        expect(result).not.to.be.null
        expect(headers).to.have.property('Access-Control-Allow-Origin')
        expect(headers).to.have.property('Access-Control-Allow-Methods')
        expect(headers).to.have.property('Access-Control-Allow-Headers')
        expect(result.statusCode).to.equal(200)
        expect(err).to.be.null
        done()
      })
    })
    it('returns CORS headers regardless of leading white space', (done) => {
      event.headers['Access-Control-Request-Method'] = ' GET'
      handler(event, context, (err, result) => {
        const headers = result.headers
        expect(result).not.to.be.null
        expect(headers).to.have.property('Access-Control-Allow-Origin')
        expect(headers).to.have.property('Access-Control-Allow-Methods')
        expect(headers).to.have.property('Access-Control-Allow-Headers')
        expect(result.statusCode).to.equal(200)
        expect(err).to.be.null
        done()
      })
    })
  })
  describe('if the Origin header is missing in the request', () => {
    it('does not include the Access-Control-Allow-Origin header in the response ', (done) => {
      event.headers.Origin = undefined
      const context = null
      handler(event, context, (err, result) => {
        expect(result).not.to.be.null
        expect(result.headers).not.to.have.property('Access-Control-Allow-Origin')
        expect(result.statusCode).to.equal(403)
        expect(err).to.be.null
        done()
      })
    })
  })
  describe('if a disallowed method (PATCH) is requested', () => {
    it('does not include the Access-Control-Allow-Method header in the response ', (done) => {
      event.headers['Access-Control-Request-Method'] = 'PATCH'
      handler(event, context, (err, result) => {
        expect(result).not.to.be.null
        expect(result.headers).not.to.have.property('Access-Control-Allow-Methods')
        expect(result.statusCode).to.equal(403)
        expect(err).to.be.null
        done()
      })
    })
  })
  describe('if a disallowed header is requested', () => {
    it('does not include the Access-Control-Allow-Header header in the response ', (done) => {
      event.headers['Access-Control-Request-Headers'] = 'Content-Type,Authorization,X-Api-Key,Set-Cookie'
      handler(event, context, (err, result) => {
        expect(result).not.to.be.null
        expect(result.headers).not.to.have.property('Access-Control-Allow-Headers')
        expect(result.statusCode).to.equal(403)
        expect(err).to.be.null
        done()
      })
    })
  })
})
