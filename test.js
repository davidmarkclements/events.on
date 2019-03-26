'use strict'

const { test } = require('tap')
const { promisify } = require('util')
const EventEmitter = require('events')
const on = require('.')
const immediate = promisify(setTimeout)

const collect = async (asyncIterator) => {
  const result = []
  for await (let element of asyncIterator) {
    result.push(element)
  }
  return result
}

// test('polyfil', async ( { is } ) => {
//   require('./polyfill')
//   is(on, EventEmitter.on)
// })

test('on an event', async ( { is } ) => {
  const ee = new EventEmitter()
  const st = immediate(100, () => {
    ee.emit('myevent', 42)
  })
  await st
  // for await (let [n] of on(ee, 'myevent', st)) {
  //   is(n, 42)
  // }
})
return
test('on an event with two args', async ( { same } ) => {
  const ee = new EventEmitter()

  process.nextTick(() => {
    ee.emit('myevent', 42, 24)
  })

  const value = await on(ee, 'myevent')
  same(value, [42, 24])
})

test('catches errors', async ( { is } ) => {
  const ee = new EventEmitter()

  const err = new Error('kaboom')
  process.nextTick(() => {
    ee.emit('error', err)
  })

  try {
    await on(ee, 'myevent')
  } catch (_e) {
    is(_e, err)
  }
})

test('stop listening after catching error', async ( { is, fail } ) => {
  const ee = new EventEmitter()

  const err = new Error('kaboom')
  process.nextTick(() => {
    ee.emit('error', err)
    ee.emit('myevent', 42, 24)
  })

  process.on('multipleResolves', () => fail('resolve multiple times'))

  try {
    await on(ee, 'myevent')
  } catch (e) {
    is(e, err)
  }
  process.removeAllListeners('multipleResolves')
})

test('on error', async ( { is } ) => {
  const ee = new EventEmitter()

  const err = new Error('kaboom')
  process.nextTick(() => {
    ee.emit('error', err)
  })

  try {
    await on(ee, 'error')
  } catch (_e) {
    is(_e, err)
  }
})

