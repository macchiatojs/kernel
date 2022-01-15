# CHANGE LOG

### v0.22.0 (15 Jan 2022)

- fix types.

### v0.21.0 (29 Dec 2021)

- add `sendFile` method to 'response'.
- add `code` method to 'response' with same behave as `statusCode`.
- add description for `render` method on 'response'.
- fix eslint.
- upgrade all deps and devDeps.

### v0.20.2 (15 Nov 2021)

- go back to the old error listner style.

### v0.20.1 (15 Nov 2021)

- recreate the error listner.

### v0.20.0 (15 Nov 2021)

- fix getContentType option behave.
- add render method to response.

### v0.19.0 (6 Nov 2021)

- fix getMimeType to use the correct handler.

### v0.18.0 (5 Nov 2021)

- move @macchiatojs/wrap-koa-compose from devDep. to dep. to avoid the build
  error in some other @macchiatojs project.
- remove mime-types from dep.
- build internal mime-types module with the same behave.
- adapte to use external module over the internal mime-types.
- fix, lint and write tests.
- ensure the same level of coverage percent.

### v0.17.1 (1 Nov 2021)

- adapte MiddlewareEngine type for the router module.

### v0.17.0 (1 Nov 2021)

- fix middleware engine type.
- fix the picker of middleware engine.
- ignore some linter warn related to any.
- improve coverage 98%~99%.
- update mime-types deps from v2.1.32 to v2.1.33.
- update typescript devDeps from v4.3.5 to v4.4.4.

### v0.16.0 (31 Oct 2021)

- improve ts types and js-doc comments.

### v0.15.0 (26 Oct 2021)

- use custom behave using `ee-first` over `on-finished`.

### v0.14.0 (07 Sep 2021)

- use MiddlewareEngine interface to handle multi-middlewares.
- update @macchiatojs/middleware to v0.2.0.
- update @macchiatojs/koaify-middleware to v0.2.0.
- remove WrapKoaCompose and move it to external (@macchiatojs/wrap-koa-compose) [break].
- adapte with the new WrapKoaCompose behave.

### v0.13.0 (28 Aug 2021)

- add missing accessor `public`.
- add Error as accepted type ins `on-error`.
- remove unused line.

### v0.12.0 (26 Aug 2021)

- remove types from `.is()`.

### v0.11.0 (26 Aug 2021)

- remove access to '.rawRequest' and add access with '.raw' [break].
- remove access to '.rawResponse' and add access with '.raw' [break].

### v0.10.0 (16 Aug 2021)

- add sendStatus method --expressify.
- remove unused lines.

### v0.9.0 (16 Aug 2021)

- add statusCode method --expressify.
- add json method --expressify.

### v0.8.0 (15 Aug 2021)

- use only HttpError (remove Error).
- remove any from on-error.

### v0.7.0 (15 Aug 2021)

- lint code by remove ; and use ' over " ...etc.

### v0.6.0 (14 Aug 2021)

- use async/await over callbacks in tests.

### v0.5.0 (14 Aug 2021)

- add cookies support `cookies@0.8.0`.
- update `mime-types@2.1.32`.
- update devDeps.
- improve code.

### v0.4.0 (14 Aug 2021)

- imporv covreage 99%.
- fix typo's.

### v0.3.0 (14 Aug 2021)

- add generic to exported types.
- import with more clean way.
- extract the koa-compose wrapper from the kernel.
- use onErrorHandler as type.

### v0.2.0 (07 Aug 2021)

- imporve the code.
- separate all utils to more than one file.
- use private # over symbol.
- improve perf.

### v0.1.0 (24 Jun 2021)

- initial release.
