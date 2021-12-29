import path from 'path';
import request from 'supertest';

import Kernel from '../../src';
import type { Request, Response } from '../../src';

describe('response', () => {
  let app: Kernel;

  beforeEach(() => {
    app = new Kernel();
  });

  describe('.sendFile(locatedFilePath)', () => {
    it('should respond with file content', async () => {
      app.use(async (request: Request, response: Response) => {
        const helloTxtFilePath = path.resolve(
          process.cwd(),
          'test',
          'response',
          'files',
          'hello.txt'
        )

        await response.sendFile(helloTxtFilePath);
      });

      await request(app.start()).get('/').expect(200, 'Hello Macchiato.js');
    });

    it('should respond with 404 when the file don\'t exist', async () => {
      app.use(async (request: Request, response: Response) => {
        const helloTxtFilePath = path.resolve(
          process.cwd(),
          'test',
          'response',
          'files',
          'hello2.txt'
        )

        await response.sendFile(helloTxtFilePath);
      });

      await request(app.start()).get('/').expect(404, 'File Not Found');
    });

    // otherwise, if we have an internal error because `sendFile` method will break the file.
  });
});
