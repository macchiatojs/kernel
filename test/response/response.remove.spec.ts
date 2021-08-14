import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('response', () => {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })
  
  describe('.remove(field, value)', () => {
    it('should remove a field', async () => {
      app.use((request: Request, response: Response) => {
        response.set('x-foo', 'bar')
        response.remove('x-foo')
        response.send(200, response.get('x-foo'))
      })

      await request(app.start())
      .get('/')
      .expect(200, '')
    })
  })
})
