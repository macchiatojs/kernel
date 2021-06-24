# @macchiatojs/kernel

## `Installation`

```bash
# npm
$ npm install @macchiatojs/kernel
# yarn
$ yarn add @macchiatojs/kernel
```

## `Usage`

I'm working to add full documentations as soon as possible <3.

```typescript
// Express/Connect Style
import Macchiato, { Request, Response, Next } from "@macchiatojs/kernel";

const app = new Macchiato();

app.use((request: Request, response: Response, next?: Next) => {
  response.body = "Hello World !"; // also you can use .send(200, "Hello World !")
});

app.start(2222);

// Koa Style
import Macchiato, { Context, Next } from "@macchiatojs/kernel";

const app = new Macchiato({ expressify: false });

app.use((context: Context, next?: Next) => {
  context.response.body = "Hello World !"; // also you can use .send(200, "Hello World !")
});

app.start(2222);
```

## `Support`

If you have any problem or suggestion please open an issue.

#### License

---

[MIT](LICENSE) &copy; [Imed Jaberi](https://github.com/3imed-jaberi)
