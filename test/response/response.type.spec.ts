import request from 'supertest'
import { contentType } from 'mime-types'

import Kernel from '../../src'
import type { Request, Response } from '../../src'
import { shouldNotHaveHeader } from './response.redirect.spec'

describe('response', () => {
  describe('.type with internal behave', () => {
    let app: Kernel
  
    beforeEach(() => {
      app = new Kernel()
    })
  
    describe('.type(str)', () => {
      it('should set the Content-Type based on a filename', async () => { 
        app.use((request: Request, response: Response) => {
          response.type = 'foo.js'
          response.end('let name = "imed";')
        })
  
        await request(app.start())
          .get('/')
          .expect('Content-Type', 'application/javascript; charset=utf-8')
      })
  
      it('should default to empty', async () => { 
        app.use((request: Request, response: Response) => {
          response.type = 'rawr'
          response.end('let name = "imed";')
        })
  
        await request(app.start())
          .get('/')
          .expect(shouldNotHaveHeader('Content-Type'))
      })
  
      it('should set the Content-Type with type/subtype', async () => { 
        app.use((request: Request, response: Response) => {
          response.type = 'application/vnd.amazon.ebook'
          response.end('let name = "imed";')
        })
  
        await request(app.start())
          .get('/')
          .expect('Content-Type', 'application/vnd.amazon.ebook')
      })
    })
  })
  describe('.type with mime-types behave', () => {
    let app: Kernel
  
    beforeEach(() => {
      app = new Kernel({ getContentType: contentType })
    })
  
    describe('.type(str)', () => {
      it('should set the Content-Type based on a filename', async () => { 
        app.use((request: Request, response: Response) => {
          response.type = 'foo.js'
          response.end('let name = "imed";')
        })
  
        await request(app.start())
          .get('/')
          .expect('Content-Type', 'application/javascript; charset=utf-8')
      })
  
      it('should default to empty', async () => { 
        app.use((request: Request, response: Response) => {
          response.type = 'rawr'
          response.end('let name = "imed";')
        })
  
        await request(app.start())
          .get('/')
          .expect(shouldNotHaveHeader('Content-Type'))
      })
  
      it('should set the Content-Type with type/subtype', async () => { 
        app.use((request: Request, response: Response) => {
          response.type = 'application/vnd.amazon.ebook'
          response.end('let name = "imed";')
        })
  
        await request(app.start())
          .get('/')
          .expect('Content-Type', 'application/vnd.amazon.ebook')
      })
    })
  })
})


