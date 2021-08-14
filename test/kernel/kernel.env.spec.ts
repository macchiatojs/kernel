import assert from 'assert'
import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('kernel', () => {
  describe('.env', () => {
    it('should be development', async () => {
      process.env.NODE_ENV = ''
      const app = new Kernel()

      app.use((request: Request, response: Response) => {
        assert(app.dev === true)
        response.send(200, app.env)
      })

      await request(app.start())
      .get('/')
      .expect(200, 'development')
    })

    it('should be test', async () => {
      process.env.NODE_ENV = 'test'
      const app = new Kernel()

      app.use((request: Request, response: Response) => {
        assert(app.dev === false)
        response.send(200, app.env)
      })

      await request(app.start())
      .get('/')
      .expect(200, 'test')
    })
  })
})
