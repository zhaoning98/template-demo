一直想封装一下 axios， 可以方便项目中使用，今天有时间，就好好研究了一下。

----------

## 源码：
```
// util/axios.js
import axios from 'axios'

const pending = {}
const CancelToken = axios.CancelToken
const removePending = (key, isRequest = false) => {
  if (pending[key] && isRequest) {
    pending[key]('取消重复请求')
  }
  delete pending[key]
}
const getRequestIdentify = (config, isReuest = false) => {
  let url = config.url
  if (isReuest) {
    url = config.baseURL + config.url.substring(1, config.url.length)
  }
  return config.method === 'get' ? encodeURIComponent(url + JSON.stringify(config.params)) : encodeURIComponent(config.url + JSON.stringify(config.data))
}

// 请求拦截器
axios.interceptors.request.use(config => {
  // 拦截重复请求(即当前正在进行的相同请求)
  let requestData = getRequestIdentify(config, true)
  removePending(requestData, true)

  config.cancelToken = new CancelToken((c) => {
    pending[requestData] = c
  })

  return config
}, error => {
  return Promise.reject(error)
})

// 异常处理
axios.interceptors.response.use(response => {
  // 把已经完成的请求从 pending 中移除
  let requestData = getRequestIdentify(response.config)
  removePending(requestData)

  return {
    code: response.status,
    message: response.statusText,
    data: response.data
  }
}, err => {
  if (err && err.response) {
    switch (err.response.status) {
      case 400:
        err.message = '错误请求'
        break
      case 401:
        err.message = '未授权，请重新登录'
        break
      case 403:
        err.message = '拒绝访问'
        break
      case 404:
        err.message = '请求错误,未找到该资源'
        break
      case 405:
        err.message = '请求方法未允许'
        break
      case 408:
        err.message = '请求超时'
        break
      case 500:
        err.message = '服务器端出错'
        break
      case 501:
        err.message = '网络未实现'
        break
      case 502:
        err.message = '网络错误'
        break
      case 503:
        err.message = '服务不可用'
        break
      case 504:
        err.message = '网络超时'
        break
      case 505:
        err.message = 'http版本不支持该请求'
        break
      default:
        err.message = `连接错误${err.response.status}`
    }
    let errData = {
      code: err.response.status,
      message: err.message
    }
    // 统一错误处理可以放这，例如页面提示错误...
    console.log('统一错误处理: ', errData)
  }

  return Promise.reject(err)
})

axios.defaults.baseURL = 'http://localhost:3000/'

export default (instance) => {
  instance.prototype.axios = (data) => {
    var _params = {
      method: !data.method ? 'get' : data.method.toLowerCase(),
      url: data.url
    }
    if (_params.method === 'get') {
      _params.params = data.params || {}
    } else {
      _params.data = data.params || {}
    }

    return new Promise((resolve, reject) => {
      axios(_params).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

```

## 调用：

```
// main.js
import axios from './util/axios'

Vue.use(axios)
```

```
// HelloWorld.vue
  methods: {
    getUserInfo (_id) {
      this.axios({
        url: '/users',
        method: 'get',
        params: { 'id': _id }
      }).then(response => {
        console.log(response)
      })
    }
  }
```
---
## 说明：
### 全局的 axios 默认值

本人使用 json-server 搭建 mock 服务（这个，有必要的话，之后会写一下），服务器地址为`http://localhost:3000/`，所以设置 axios 的 基础URL路径设置为`http://localhost:3000/`。

另外，大家有需要的话，也可以对 `axios.defaults.headers` 默认的请求头、`axios.defaults.timeout`请求超时时间 进行设置。这里就不设置了。
```
axios.defaults.baseURL = 'http://localhost:3000/'
```
### get、post请求的封装
这里，get、post 请求具体调用的时候，都通过 `this.axios(requestData)`来调用，其中 `requestData`有统一的格式，如下
```
const requestData = {
  url: '/users', // 必填
  method: 'get', // 选填，默认 'get'
  params: {} // 选填，默认 {}
}
```
这部分通过 `requestData.method`处理 axios发送请求时，`requestData.params` 是赋值给 `_params.params`（get 请求传递参数） 还是赋值给 `_params.data`（post 请求传递参数）。
```
export default (instance) => {
  instance.prototype.axios = (data) => {
    var _params = {
      method: !data.method ? 'get' : data.method.toLowerCase(),
      url: data.url
    }
    if (_params.method === 'get') {
      _params.params = data.params || {}
    } else {
      _params.data = data.params || {}
    }

    return new Promise((resolve, reject) => {
      axios(_params).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  }
}
```

### 拦截重复请求
#### 如何标识每个请求
下面函数，通过一个请求参数中的 `url`, `params`（get 请求传递参数）或 `data`（post 请求传递参数）来表示每一个请求。

使用请求路径加请求参数的标识方式，避免了相同请求路径，不同请求参数的情况下的错误拦截。

其中需要注意的地方是，请求拦截器中 `config.url = '/users'`, 响应拦截器中 `config.url = 'http://localhost:3000/users'`，所以加上一个标识`isReuest`来计算请求的全路径
```
/**
 * config: 请求数据
 * isReuest: 请求拦截器中 config.url = '/users', 响应拦截器中 config.url = 'http://localhost:3000/users'，所以加上一个标识来计算请求的全路径
 */
const getRequestIdentify = (config, isReuest = false) => {
  let url = config.url
  if (isReuest) {
    url = config.baseURL + config.url.substring(1, config.url.length)
  }
  return config.method === 'get' ? encodeURIComponent(url + JSON.stringify(config.params)) : encodeURIComponent(config.url + JSON.stringify(config.data))
}
```

#### 请求拦截器
使用 `cancel token` 取消请求。

这里每个请求通过传递一个 `executor` 函数到 `CancelToken` 的构造函数来创建 `cancel token`。
```
// 添加请求拦截器
axios.interceptors.request.use(config => {
  // 发送请求之前，拦截重复请求(即当前正在进行的相同请求)
  let requestData = getRequestIdentify(config, true)
  removePending(requestData, true)

  config.cancelToken = new CancelToken((c) => {
    pending[requestData] = c
  })

  return config
}, error => {
  return Promise.reject(error)
})
```

### 取消请求
这一步是结合上面的请求拦截器执行的，取消重复请求的同时删除记录，并且在下面的响应拦截器也会调用该函数，即完成请求后删除请求记录。
```
// key: 请求标识；isRequest 完成请求后也需要执行删除记录，所以添加此参数避免执行无用操作
const removePending = (key, isRequest = false) => {
  if (pending[key] && isRequest) {
    pending[key]('取消重复请求')
  }
  delete pending[key] // 把这条记录从 pending 中移除
}
```
#### 请求异常处理
可以使用响应拦截器来统一处理请求异常，例如，统一返回的数据的格式、统一处理异常报错...
```
// 异常处理
axios.interceptors.response.use(response => {
  // 把已经完成的请求从 pending 中移除
  let requestData = getRequestIdentify(response.config)
  removePending(requestData)

  return {
    code: response.status,
    message: response.statusText,
    data: response.data
  }
}, err => {
  if (err && err.response) {
    switch (err.response.status) {
      case 400:
        err.message = '错误请求'
        break
      case 401:
        err.message = '未授权，请重新登录'
        break
      case 403:
        err.message = '拒绝访问'
        break
      case 404:
        err.message = '请求错误,未找到该资源'
        break
      case 405:
        err.message = '请求方法未允许'
        break
      case 408:
        err.message = '请求超时'
        break
      case 500:
        err.message = '服务器端出错'
        break
      case 501:
        err.message = '网络未实现'
        break
      case 502:
        err.message = '网络错误'
        break
      case 503:
        err.message = '服务不可用'
        break
      case 504:
        err.message = '网络超时'
        break
      case 505:
        err.message = 'http版本不支持该请求'
        break
      default:
        err.message = `连接错误${err.response.status}`
    }
    let errData = {
      code: err.response.status,
      message: err.message
    }
    // 统一错误处理可以放这，例如页面提示错误...
    console.log('统一错误处理: ', errData)
  }

  return Promise.reject(err)
})
```

---
## 疑问：
CancelToken 这一部分，小女子还不是很清楚原理，希望大家指导一下~~~

---
## 参考地址：
[axios 的 github 地址][1]
https://segmentfault.com/a/1190000012332982
https://www.jianshu.com/p/4445595488e2


  [1]: https://github.com/axios/axios
