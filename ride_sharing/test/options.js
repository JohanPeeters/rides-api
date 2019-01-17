const sinon = require('sinon')
const handler = require('../options').lambdaHandler
const expect = require('chai').expect

const requestedOrigin = 'https://ride-sharing.tk'
const requestedMethod = 'GET'
const requestedHeaders = 'x-api-key'
const ORIGIN_CORS_RESPONSE_HEADER = 'Access-Control-Allow-Origin'
const METHODS_CORS_RESPONSE_HEADER = 'Access-Control-Allow-Methods'
const HEADERS_CORS_RESPONSE_HEADER = 'Access-Control-Allow-Headers'
const MAX_AGE_CORS_RESPONSE_HEADER = 'Access-Control-Max-Age'

describe('Options handler', () => {
  const event = {}
  const context = null
  beforeEach(() => {
    event.headers = {
      Origin: requestedOrigin,
      'Access-Control-Request-Method': requestedMethod,
      'Access-Control-Request-Headers': requestedHeaders
    }
  })
  describe('if it is given allowed origin, methods and headers', () => {
    it('returns the Origin, Methods, Headers and Max-Age CORS headers', (done) => {
      handler(event, context, (err, result) => {
        const headers = result.headers
        expect(headers).not.to.be.null
        expect(headers).to.have.property(ORIGIN_CORS_RESPONSE_HEADER)
        expect(headers).to.have.property(METHODS_CORS_RESPONSE_HEADER)
        expect(headers).to.have.property(HEADERS_CORS_RESPONSE_HEADER)
        expect(headers).to.have.property(MAX_AGE_CORS_RESPONSE_HEADER)
        expect(result.statusCode).to.equal(200)
        expect(err).to.be.null
        done()
      })
    })
    it('Origin, Methods and Headers CORS headers reflect the requested values', (done) => {
      handler(event, context, (err, result) => {
        const headers = result.headers
        expect(headers).to.have.property(ORIGIN_CORS_RESPONSE_HEADER, requestedOrigin)
        expect(headers).to.have.property(METHODS_CORS_RESPONSE_HEADER, requestedMethod)
        expect(headers).to.have.property(HEADERS_CORS_RESPONSE_HEADER, requestedHeaders)
        done()
      })
    })
    it('Max-Age CORS header is 600s', (done) => {
      handler(event, context, (err, result) => {
        const headers = result.headers
        expect(headers).to.have.property(MAX_AGE_CORS_RESPONSE_HEADER, 600)
        done()
      })
    })
    it('returns CORS headers regardless of leading white space in the method', (done) => {
      event.headers['Access-Control-Request-Method'] = ' GET'
      handler(event, context, (err, result) => {
        const headers = result.headers
        expect(result).not.to.be.null
        expect(headers).to.have.property(ORIGIN_CORS_RESPONSE_HEADER)
        expect(headers).to.have.property(METHODS_CORS_RESPONSE_HEADER)
        expect(headers).to.have.property(HEADERS_CORS_RESPONSE_HEADER)
        expect(result.statusCode).to.equal(200)
        expect(err).to.be.null
        done()
      })
    })
  })
  describe('if the Origin header is missing in the request', () => {
    it('does not include the ORIGIN_CORS_RESPONSE_HEADER header in the response ', (done) => {
      event.headers.Origin = undefined
      const context = null
      handler(event, context, (err, result) => {
        expect(result).not.to.be.null
        expect(result.headers).not.to.have.property(ORIGIN_CORS_RESPONSE_HEADER)
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
        expect(result.headers).not.to.have.property(METHODS_CORS_RESPONSE_HEADER)
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
        expect(result.headers).not.to.have.property(HEADERS_CORS_RESPONSE_HEADER)
        expect(result.statusCode).to.equal(403)
        expect(err).to.be.null
        done()
      })
    })
  })
})
