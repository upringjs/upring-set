'use strict'

require('make-promises-safe')

const assert = require('assert')
const deepEqual = require('fast-deep-equal')
const lodash = require('lodash')

async function setPlugin (upring, opts) {
  if (upring.kv === undefined) {
    throw new Error('Missig `upring-kv` plugin')
  }

  upring.set = new SetUtils(upring, opts)
}

function SetUtils (upring, opts) {
  this.opts = opts
  this.kv = upring.kv
}

SetUtils.prototype.sadd = async function sadd (key, value) {
  assert(typeof key === 'string', 'key should be a string')
  const set = await this.kv.get(key) || []

  if (Array.isArray(value)) {
    set.push.apply(set, value)
  } else {
    set.push(value)
  }

  await this.kv.put(key, set)
  return Array.isArray(value) ? value.length : 1
}

SetUtils.prototype.zadd = async function zadd (key, score, value) {
  assert(typeof key === 'string', 'key should be a string')
  const set = await this.kv.get(key) || []

  if (set.length > 0) {
    assert(set._scored, 'the set is not scored')
  }

  set.push({ value, score })
  const ordered = lodash.sortBy(set, 'score')
  ordered._scored = true
  await this.kv.put(key, ordered)
  return 1
}

SetUtils.prototype.srem = async function srem (key, value) {
  assert(typeof key === 'string', 'key should be a string')
  const set = await this.kv.get(key)
  if (!set) return 0

  if (Array.isArray(value)) {
    for (var i = 0, len = value.length; i < len; i++) {
      const isObj = typeof value[i] === 'object'
      lodash.remove(set, ele => {
        if (isObj) return deepEqual(ele, value[i])
        return ele === value[i]
      })
    }
  } else {
    const isObj = typeof value === 'object'
    lodash.remove(set, ele => {
      if (isObj) return deepEqual(ele, value)
      return ele === value
    })
  }

  await this.kv.put(key, set)
  return Array.isArray(value) ? (set.length - value.length) : (set.length - 1)
}

SetUtils.prototype.zrem = async function zrem (key, value) {
  assert(typeof key === 'string', 'key should be a string')
  const set = await this.kv.get(key)
  if (!set) return 0

  assert(set._scored, 'the set should be scored')
  if (Array.isArray(value)) {
    for (var i = 0, len = value.length; i < len; i++) {
      const isObj = typeof value[i] === 'object'
      lodash.remove(set, ele => {
        if (isObj) return deepEqual(ele.value, value[i])
        return ele.value === value[i]
      })
    }
  } else {
    const isObj = typeof value === 'object'
    lodash.remove(set, ele => {
      if (isObj) return deepEqual(ele.value, value)
      return ele.value === value
    })
  }

  await this.kv.put(key, set)
  return Array.isArray(value) ? (set.length - value.length) : (set.length - 1)
}

SetUtils.prototype.del = async function del (keys) {
  if (!Array.isArray(keys)) keys = [keys]
  for (var i = 0, len = keys.length; i < len; i++) {
    assert(typeof keys[i] === 'string', 'key should be a string')
    await this.kv.put(keys[i], undefined)
  }
  return keys.length
}

SetUtils.prototype.sinter = async function sinter (keys) {
  assert(Array.isArray(keys), 'keys should be an array of strings')

  const sets = []
  for (var i = 0, len = keys.length; i < len; i++) {
    const set = await this.kv.get(keys[i])
    if (set === undefined) continue
    sets.push(
      set._scored === true
      ? set.map(e => e.value)
      : set
    )
  }

  return lodash.intersection.apply(null, sets)
}

SetUtils.prototype.sunion = async function sunion (keys) {
  assert(Array.isArray(keys), 'keys should be an array of strings')

  const sets = []
  for (var i = 0, len = keys.length; i < len; i++) {
    const set = await this.kv.get(keys[i])
    if (set === undefined) continue
    sets.push(
      set._scored === true
      ? set.map(e => e.value)
      : set
    )
  }

  return lodash.union.apply(null, sets)
}

SetUtils.prototype.scard = async function scard (key) {
  assert(typeof key === 'string', 'key should be a string')
  const set = await this.kv.get(key)
  if (!set) return undefined
  return set.length
}

SetUtils.prototype.zcard = async function zcard (key) {
  assert(typeof key === 'string', 'key should be a string')
  const set = await this.kv.get(key)
  if (!set) return undefined
  assert(set._scored, 'the set should be scored')
  return set.length
}

SetUtils.prototype.smembers = async function smembers (key) {
  assert(typeof key === 'string', 'key should be a string')
  const set = await this.kv.get(key)
  if (!set) return undefined
  if (set._scored) {
    return set.map(e => e.value)
  }
  return set
}

SetUtils.prototype.sismembers = async function sismembers (key, ele) {
  assert(typeof key === 'string', 'key should be a string')
  const set = await this.kv.get(key)
  if (!set) return 0
  if (set._scored) {
    return set.map(e => e.value).indexOf(ele) > -1 ? 1 : 0
  }
  return set.indexOf(ele) > -1 ? 1 : 0
}

SetUtils.prototype.sunionstore = async function sunionstore (key, keys) {
  assert(typeof key === 'string', 'key should be a string')
  assert(Array.isArray(keys), 'keys should be an array of strings')

  const sets = []
  for (var i = 0, len = keys.length; i < len; i++) {
    const set = await this.kv.get(keys[i])
    if (set === undefined) continue
    sets.push(
      set._scored === true
      ? set.map(e => e.value)
      : set
    )
  }

  const unionSet = lodash.union.apply(null, sets)
  await this.kv.put(key, unionSet)
  return unionSet.length
}

SetUtils.prototype.sdiff = async function sdiff (keys) {
  assert(Array.isArray(keys), 'keys should be an array of strings')

  const sets = []
  for (var i = 0, len = keys.length; i < len; i++) {
    const set = await this.kv.get(keys[i])
    if (set === undefined) continue
    sets.push(
      set._scored === true
      ? set.map(e => e.value)
      : set
    )
  }

  return lodash.difference.apply(null, sets)
}

SetUtils.prototype.zrange = async function zrange (key, start, stop) {
  assert(typeof key === 'string', 'the key should be a string')
  assert(typeof start === 'number', 'start should be a number')
  assert(typeof stop === 'number', 'stop should be a number')

  const set = await this.kv.get(key)
  if (!set) return undefined
  assert(set._scored, 'the set should be scored')
  return set.map(e => e.value).slice(start, stop)
}

SetUtils.prototype.zrevrange = async function zrevrange (key, start, stop) {
  assert(typeof key === 'string', 'the key should be a string')
  assert(typeof start === 'number', 'start should be a number')
  assert(typeof stop === 'number', 'stop should be a number')

  const set = await this.kv.get(key)
  if (!set) return undefined
  assert(set._scored, 'the set should be scored')
  set.reverse()
  return set.map(e => e.value).slice(start, stop)
}

SetUtils.prototype.zscore = async function zscore (key, ele) {
  assert(typeof key === 'string', 'the key should be a string')

  const set = await this.kv.get(key)
  if (!set) return undefined
  assert(set._scored, 'the set should be scored')
  for (var i = 0, len = set.length; i < len; i++) {
    var scoredElement = set[i]
    if (typeof scoredElement.value === 'object') {
      if (deepEqual(scoredElement.value, ele)) {
        return scoredElement.score
      }
    } else {
      if (scoredElement.value === ele) {
        return scoredElement.score
      }
    }
  }
  return null
}

SetUtils.prototype.zincrby = async function zincrby (key, score, ele) {
  assert(typeof key === 'string', 'the key should be a string')
  assert(typeof score === 'number', 'the score should be a number')

  const set = await this.kv.get(key)
  if (set === undefined) {
    return this.zadd(key, score, ele)
  }
  assert(set._scored, 'the set should be scored')
  var scoredElement = {}
  for (var i = 0, len = set.length; i < len; i++) {
    scoredElement = set[i]
    if (typeof scoredElement.value === 'object') {
      if (deepEqual(scoredElement.value, ele)) {
        scoredElement.score += score
        break
      }
    } else {
      if (scoredElement.value === ele) {
        scoredElement.score += score
        break
      }
    }
  }

  const ordered = lodash.sortBy(set, 'score')
  ordered._scored = true
  await this.kv.put(key, ordered)
  return scoredElement.score
}

module.exports = setPlugin
