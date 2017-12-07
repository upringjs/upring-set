# upring-set

[![Build Status](https://travis-ci.org/upringjs/upring-set.svg?branch=master)](https://travis-ci.org/upringjs/upring-set) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

Redis set api on top of Upring

## Install

```
npm i upring-set --save
```

## Usage

This library exposes the standard `upring` plugin interface.  
Once you register it, it adds a `set` name space with the API documented below.  
This plugin needs that [`upring-kv`](https://github.com/upringjs/upring-kv) is registered as well.
```js
const upring = require('upring')({
  logLevel: 'info',
  base: [],
  hashring: {
    joinTimeout: 200,
    replicaPoints: 10
  }
})

upring.use(require('upring-kv'))
upring.use(require('upring-set'))

upring.on('up', onReady)

async function onReady () {
  await upring.set.sadd('set', ['one', 'two', 'three'])
  const members = await upring.set.smembers('set')
  console.log(members) // ['one', 'two', 'three']
}
```

## API
The API is not yet completed, if you need an API that is not implemented please fire a [pull request](https://github.com/upringjs/upring-set/pulls)!

#### `sadd`
[Redis docs](https://redis.io/commands/sadd)
```js
await upring.set.sadd('set', ['one', 'two', 'three'])
await upring.set.sadd('key', 'value')
```

#### `zadd`
[Redis docs](https://redis.io/commands/zadd)
```js
await upring.set.zadd('key', 1, 'value')
```

#### `srem`
[Redis docs](https://redis.io/commands/srem)
```js
await upring.set.srem('key', 'value')
await upring.set.srem('set', ['one', 'two', 'three'])
```

#### `zrem`
[Redis docs](https://redis.io/commands/zrem)
```js
await upring.set.zrem('key', 'value')
await upring.set.zrem('set', ['one', 'two', 'three'])
```

#### `del`
[Redis docs](https://redis.io/commands/del)
```js
await upring.set.del('key')
```

#### `sinter`
[Redis docs](https://redis.io/commands/sinter)
```js
await upring.set.sinter(['set1', 'set2', 'set3'])
```

#### `sunion`
[Redis docs](https://redis.io/commands/sunion)
```js
await upring.set.sunion(['set1', 'set2', 'set3'])
```

#### `scard`
[Redis docs](https://redis.io/commands/scard)
```js
await upring.set.scard('set')
```

#### `zcard`
[Redis docs](https://redis.io/commands/zcard)
```js
await upring.set.zcard('set')
```

#### `smembers`
[Redis docs](https://redis.io/commands/smembers)
```js
await upring.set.smembers('set')
```

#### `sismembers`
[Redis docs](https://redis.io/commands/sismembers)
```js
await upring.set.sismembers('set', 'value')
```

#### `sunionstore`
[Redis docs](https://redis.io/commands/sunionstore)
```js
await upring.set.sunionstore('set', ['set1', 'set2', 'set3'])
```

#### `sdiff`
[Redis docs](https://redis.io/commands/sdiff)
```js
await upring.set.sdiff(['set1', 'set2', 'set3'])
```

#### `zrange`
[Redis docs](https://redis.io/commands/zrange)
```js
await upring.set.zrange('set', 0, -1)
```

#### `zrevrange`
[Redis docs](https://redis.io/commands/zrevrange)
```js
await upring.set.zrevrange('set', 0, -1)
```

#### `zscore`
[Redis docs](https://redis.io/commands/zscore)
```js
await upring.set.zscore('set', 'value')
```

#### `zincrby`
[Redis docs](https://redis.io/commands/zincrby)
```js
await upring.set.zincrby('set', 1, 'value')
```

## Acknowledgements

This project is kindly sponsored by [LetzDoIt](http://www.letzdoitapp.com/).

## License

Licensed under [MIT](./LICENSE).
