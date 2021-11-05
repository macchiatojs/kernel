import request from 'supertest'

import Kernel from '../../src'
import type { Request, Response } from '../../src'
import { shouldNotHaveHeader } from './response.redirect.spec'

describe('response.vary()', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  // with no arguments --> handled by TS.
  describe('with an empty array', () => {
    it('should not set Vary', async () => { 
      app.use((request: Request, response: Response) => {
        response.vary([])
        response.end()
      })

      await request(app.start())
        .get('/')
        .expect(shouldNotHaveHeader('Vary'))
        .expect(200)
    })
  })

  describe('with an array', () => {
    it('should set the values', async () => { 
      app.use((request: Request, response: Response) => {
        response.vary(['Accept', 'Accept-Language', 'Accept-Encoding'])
        response.end()
      })

      await request(app.start())
        .get('/')
        .expect('Vary', 'Accept, Accept-Language, Accept-Encoding')
        .expect(200)
    })
  })

  describe('with a string', () => {
    it('should set the value', async () => { 
      app.use((request: Request, response: Response) => {
        response.vary('Accept')
        response.end()
      })

      await request(app.start())
        .get('/')
        .expect('Vary', 'Accept')
        .expect(200)
    })
  })

  describe('when the value is present', () => {
    it('should not add it again', async () => { 
      app.use((request: Request, response: Response) => {
        response.vary('Accept')
        response.vary('Accept-Encoding')
        response.vary('Accept-Encoding')
        response.vary('Accept-Encoding')
        response.vary('Accept')
        response.end()
      })

      await request(app.start())
        .get('/')
        .expect('Vary', 'Accept, Accept-Encoding')
        .expect(200)
    })
  })
})
