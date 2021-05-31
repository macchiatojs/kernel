import { expect } from 'chai'
import HttpError from '../src'

describe('http-error', () => {
  it('should have error stack and status', ()=> {
    const error = new HttpError(404)

    expect(error.stack).to.be.not.undefined
    expect(error.name).to.be.equal('HttpError')
    expect(error.status).to.be.equal(404)
    expect(() => { throw error }).to.throw(/Not Found/)
  })

  it('should return origin status', () => {
    const error = new HttpError('Not Found', '', { status: 400 })

    expect(error.stack).to.be.not.undefined
    expect(error.name).to.be.equal('HttpError')
    expect(error.status).to.be.equal(400)
    expect(() => { throw error }).to.throw(/Bad Request/)   
  })

  it('should return origin statusCode', () => {
    const error = new HttpError('Not Found', '', { statusCode: 400 })

    expect(error.stack).to.be.not.undefined
    expect(error.name).to.be.equal('HttpError')
    expect(error.status).to.be.equal(400)
    expect(() => { throw error }).to.throw(/Bad Request/)   
  })

  it('should handle ENOENT correctly', () => {
    const error = new HttpError('ENOENT')

    expect(error.stack).to.be.not.undefined
    expect(error.name).to.be.equal('HttpError')
    expect(error.status).to.be.equal(404)
    expect(() => { throw error }).to.throw(/Not Found/)   
  })

  it('should handle unsupported status codes as 500', () => {
    const error = new HttpError(700)

    expect(error.stack).to.be.not.undefined
    expect(error.name).to.be.equal('HttpError')
    expect(error.status).to.be.equal(500)
    // here unknown because we pass 700 as status code.
    expect(() => { throw error }).to.throw(/unknown/) 
  })
})
