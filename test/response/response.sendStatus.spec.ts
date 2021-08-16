import request from 'supertest'
import Kernel, { Request, Response } from '../../src'

describe('request.sendStatus()', function () {
  let app: Kernel

  beforeEach(() => {
    app = new Kernel()
  })

  it('should respond msg: 200 - Ok', async () => {
    app.use((request: Request, response: Response) => {
      response.sendStatus(200)
    })

    await request(app.start())
    .get('/')
    .expect('Content-Type', /text/)
    .expect(200, /OK/)
  })

  it('should respond msg: 201 - Created', async () => {
    app.use((request: Request, response: Response) => {
      response.sendStatus(201)
    })

    await request(app.start())
    .get('/')
    .expect('Content-Type', /text/)
    .expect(201, /Created/)
  })

  it('should respond msg: 400 - Bad Request', async () => {
    app.use((request: Request, response: Response) => {
      response.sendStatus(400)
    })

    await request(app.start())
    .get('/')
    .expect('Content-Type', /text/)
    .expect(400, /Bad Request/)
  })

  it('should respond msg: 999 - 900', async () => {
    app.use((request: Request, response: Response) => {
      response.sendStatus(900)
    })

    await request(app.start())
    .get('/')
    .expect('Content-Type', /text/)
    .expect(900, /900/)
  })
})
