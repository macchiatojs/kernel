import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request.json()', function () {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  it('should respond with valid json', async () => {
    app.use((request: Request, response: Response) => {
      response.statusCode(200).json({ ok: true, msg: 'created' })
    })

    await request(app.start())
    .post('/')
    .expect('Content-Type', 'application/json')
    .expect(200, /{"ok":true,"msg":"created"}/)
  })

  it('should respond with null as json', async () => {
    app.use((request: Request, response: Response) => {
      response.statusCode(200).json(null)
    })

    await request(app.start())
    .post('/')
    .expect(200, '')
  })

  it('should not respond with invalid json', async () => {
    app.use((request: Request, response: Response) => {
      response.statusCode(200).json('created' as any)
    })

    await request(app.start())
    .post('/')
    // .expect('Content-Type', /text/)
    .expect(400, 'Bad Request')
  })
})