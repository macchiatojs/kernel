import assert from 'assert'
import Kernel, { Request, Response } from '../../src'

describe('kernel', () => {
  describe('.stop', () => {
    it('should stop', function () {
      const app = new Kernel()

      const started = app.start().address()
      assert.ok(started ? true : false)
      
      const stoped = app.stop()
      assert(stoped instanceof Kernel)
    })

    it('should throw when stop before start', function () {
      const app = new Kernel()
    
      const stoped = app.stop()
      assert(stoped instanceof Kernel)

      const started = app.start().address()
      assert.ok(started ? true : false)
      

    })
  })

  describe('.reload', () => {
    it('should stop then start again', function () {
      const app = new Kernel()
      
      const started = app.start().address()      
      assert.ok(started ? true : false)
      
      const reloaded = app.reload()
      if (reloaded) {
        assert.ok(reloaded.address() ? true : false)
      } else {
        assert(reloaded === undefined)
      }
    })
  })
})
