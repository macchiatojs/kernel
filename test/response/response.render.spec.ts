import request from 'supertest';

import Kernel from '../../src';
import type { Request, Response } from '../../src';

describe('response', () => {
  let app: Kernel;

  beforeEach(() => {
    app = new Kernel({
      viewEngineConfig: {
        root: 'test/response/views',
      },
    });
  });

  describe('.render(targetViewName, params)', () => {
    it('should render the static user content', async () => {
      app.use(async (request: Request, response: Response) => {
        await response.render('empty-user');
      });

      await request(app.start()).get('/').expect(200, '<h1>Hello World</h1>');
    });

    it('should render the dynamic user content', async () => {
      app.use(async (request: Request, response: Response) => {
        await response.render('user', { user: 'imed' });
      });

      await request(app.start()).get('/').expect(200, '<h1>imed</h1>');
    });

    it('should dispaly the error when faild to render the content', async () => {
      app.use(async (request: Request, response: Response) => {
        await response.render('user');
      });

      await request(app.start())
        .get('/')
        .expect(
          500,
          /Internal Server Error - ReferenceError: user is not defined/
        );
    });
  });
});
