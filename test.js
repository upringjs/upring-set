'use strict'

const { test } = require('tap')
const upring = require('upring')
const kvPlugin = require('upring-kv')
const setPlugin = require('./index')

test('sadd store a set of data', t => {
  t.plan(3)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    try {
      await instance.set.sadd('set1', [1, 2, 3])
      t.ok('correct')
    } catch (err) {
      t.fail(err)
    }
    try {
      await instance.set.sadd('set1', 'hello')
      t.ok('correct')
    } catch (err) {
      t.fail(err)
    }
    t.deepEqual(
      await instance.set.smembers('set1'),
      [1, 2, 3, 'hello']
    )
    instance.close()
  })
})

test('sinter should return the intersection of multiple sets', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.sadd('set1', [1, 2, 3])
    await instance.set.sadd('set2', [2, 4, 6])
    await instance.set.sadd('set3', [1, 5, 2])
    await instance.set.sadd('set4', [2, 5, 6])
    t.deepEqual(
      await instance.set.sinter(['set1', 'set2', 'set3', 'set4']),
      [2]
    )
    instance.close()
  })
})

test('sunion should return the union of multiple sets', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.sadd('set1', [1, 2, 3])
    await instance.set.sadd('set2', [2, 4, 6])
    await instance.set.sadd('set3', [1, 5, 2])
    await instance.set.sadd('set4', [2, 5, 6])
    t.deepEqual(
      await instance.set.sunion(['set1', 'set2', 'set3', 'set4']),
      [1, 2, 3, 4, 6, 5]
    )
    instance.close()
  })
})

test('scard should check the cardinality of a set', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.sadd('set', [1, 2, 3])
    t.strictEqual(
      await instance.set.scard('set'),
      3
    )
    instance.close()
  })
})

test('smembers should return the members of a set', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.sadd('set', [1, 2, 3])
    t.deepEqual(
      await instance.set.smembers('set'),
      [1, 2, 3]
    )
    instance.close()
  })
})

test('sismembers should return define if an element is part of a set', t => {
  t.plan(2)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.sadd('set', [1, 2, 3])
    t.true(
      await instance.set.sismembers('set', 1)
    )
    t.false(
      await instance.set.sismembers('set', 4)
    )
    instance.close()
  })
})

test('sunionstore should save the sunion in a new set', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.sadd('set1', [1, 2, 3])
    await instance.set.sadd('set2', [2, 4, 6])
    await instance.set.sadd('set3', [1, 5, 2])
    await instance.set.sadd('set4', [2, 5, 6])
    await instance.set.sunionstore('set', ['set1', 'set2', 'set3', 'set4'])
    t.deepEqual(
      await instance.set.smembers('set'),
      [1, 2, 3, 4, 6, 5]
    )
    instance.close()
  })
})

test('sdiff should return the difference between the first set and the others', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.sadd('set1', [1, 2, 3])
    await instance.set.sadd('set2', [2, 4, 6])
    await instance.set.sadd('set3', [1, 5, 2])
    t.deepEqual(
      await instance.set.sdiff(['set1', 'set2', 'set3']),
      [3]
    )
    instance.close()
  })
})

test('zadd should store a weighted set of data', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.zadd('set', 2, 'two')
    await instance.set.zadd('set', 1, 'one')
    t.deepEqual(
      await instance.set.smembers('set'),
      ['one', 'two']
    )
    instance.close()
  })
})

test('sinter should return the intersection of multiple weighted sets', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.zadd('set1', 1, 'one')
    await instance.set.zadd('set1', 2, 'two')
    await instance.set.zadd('set1', 3, 'three')

    await instance.set.zadd('set2', 3, 'two')
    await instance.set.zadd('set2', 2, 'four')
    await instance.set.zadd('set2', 1, 'six')

    await instance.set.zadd('set3', 2, 'one')
    await instance.set.zadd('set3', 3, 'five')
    await instance.set.zadd('set3', 1, 'two')

    await instance.set.zadd('set4', 3, 'two')
    await instance.set.zadd('set4', 2, 'five')
    await instance.set.zadd('set4', 1, 'six')

    t.deepEqual(
      await instance.set.sinter(['set1', 'set2', 'set3', 'set4']),
      ['two']
    )
    instance.close()
  })
})

test('sunion should return the union of multiple weighted sets', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.zadd('set1', 1, 'one')
    await instance.set.zadd('set1', 2, 'two')
    await instance.set.zadd('set1', 3, 'three')

    await instance.set.zadd('set2', 3, 'two')
    await instance.set.zadd('set2', 2, 'four')
    await instance.set.zadd('set2', 1, 'six')

    await instance.set.zadd('set3', 2, 'one')
    await instance.set.zadd('set3', 3, 'five')
    await instance.set.zadd('set3', 1, 'two')

    await instance.set.zadd('set4', 3, 'two')
    await instance.set.zadd('set4', 2, 'five')
    await instance.set.zadd('set4', 1, 'six')

    t.deepEqual(
      await instance.set.sunion(['set1', 'set2', 'set3', 'set4']),
      ['one', 'two', 'three', 'six', 'four', 'five']
    )
    instance.close()
  })
})

test('zcard should check the cardinality of a weighted set', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.zadd('set', 1, 'one')
    await instance.set.zadd('set', 2, 'two')
    t.strictEqual(
      await instance.set.zcard('set'),
      2
    )
    instance.close()
  })
})

test('zrange should get the given range of a weighted set', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.zadd('set', 1, 'one')
    await instance.set.zadd('set', 2, 'two')
    await instance.set.zadd('set', 3, 'three')
    await instance.set.zadd('set', 4, 'four')

    t.deepEqual(
      await instance.set.zrange('set', -3, -1),
      ['two', 'three']
    )
    instance.close()
  })
})

test('zrevrange should get the given range of a weighted set', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.zadd('set', 1, 'one')
    await instance.set.zadd('set', 2, 'two')
    await instance.set.zadd('set', 3, 'three')
    await instance.set.zadd('set', 4, 'four')

    t.deepEqual(
      await instance.set.zrevrange('set', -3, -1),
      ['three', 'two']
    )
    instance.close()
  })
})

test('zscore should get the weight of the given element', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.zadd('set', 1, 'one')
    await instance.set.zadd('set', 2, 'two')
    await instance.set.zadd('set', 3, 'three')
    await instance.set.zadd('set', 4, 'four')

    t.strictEqual(
      await instance.set.zscore('set', 'three'),
      3
    )
    instance.close()
  })
})

test('zincrby should increase the weight of an element in a set', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.zadd('set', 1, 'one')
    await instance.set.zincrby('set', 1, 'one')
    t.strictEqual(
      await instance.set.zscore('set', 'one'),
      2
    )
    instance.close()
  })
})

test('zincrby should create a new set if the given one is not existing', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.zincrby('set', 1, 'one')
    t.strictEqual(
      await instance.set.zscore('set', 'one'),
      1
    )
    instance.close()
  })
})

test('srem should remove the given element from the set', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.sadd('set', ['one'])
    await instance.set.srem('set', 'one')
    t.deepEqual(
      await instance.set.smembers('set'),
      []
    )
    instance.close()
  })
})

test('zrem should remove the given element from the weighted set', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.zadd('set', 1, 'one')
    await instance.set.zrem('set', 'one')
    t.deepEqual(
      await instance.set.smembers('set'),
      []
    )
    instance.close()
  })
})

test('del should destroy a set', t => {
  t.plan(1)

  const instance = upring({
    logLevel: 'silent',
    base: [],
    hashring: {
      joinTimeout: 200,
      replicaPoints: 10
    }
  })

  instance.use(kvPlugin)
  instance.use(setPlugin)

  instance.on('up', async () => {
    await instance.set.zadd('set', 1, 'one')
    await instance.set.del('set')
    t.deepEqual(
      await instance.set.smembers('set'),
      undefined
    )
    instance.close()
  })
})
