import request from 'supertest'
import { contentType } from 'mime-types'

import Kernel  from '../../src'
import type { Request, Response } from '../../src'

describe('kernel', () => {
  describe('.getContentType', () => {
    it('should be use getContentType when is exist', async () => { 
      const app = new Kernel({ getContentType: contentType })

      app.use((request: Request, response: Response) => {
        response.send(200, typeof app.__getType !== 'undefined')
      })

      await request(app.start())
      .get('/')
      .expect(200, 'true')
    })

    it('should be use the default builded behave with itsn\'t exsit', async () => { 
      const app = new Kernel()

      app.use((request: Request, response: Response) => {        
        response.send(200, typeof app.__getType === 'undefined')
      })

      await request(app.start())
      .get('/')
      .expect(200, 'true')
    })
  })
})
