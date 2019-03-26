'use strict'
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
module.exports = function on (emitter, name, stop) {
  return {
    [Symbol.asyncIterator]() {
      var done = false
      var err = null
      if (!stop) throw Error('stop parameter is required')
      if (typeof stop.then !== 'function') {
        if (stop instanceof AsyncFunction) {
          stop = stop()
        } else {
          throw Error('stop parameter must be either a promise or an async function')
        }
      }
      stop.then(() => {
        done = true
      }, (e) => {
        done = true
        err = e
      })
      return {
        next() { 
          return new Promise((resolve, reject) => {
            const onError = name === 'error'
            const listener = (...value) => {
              if (done === true) {
                emitter.removeListener(name, listener)
                if (onError === false) {
                  emitter.removeListener('error', error)
                }
              }
              if (err) reject(err)
              else resolve({value, done})
            }
            emitter.on(name, listener)
            if (onError) return
            const error = (err) => {
              emitter.removeListener(name, listener)
              reject(err)
            }
            emitter.once('error', error)
          })
        }
      }
    }
  }
}
