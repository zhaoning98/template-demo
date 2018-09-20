/** 参考网址：
 *  https://www.jianshu.com/p/4445595488e2
 *  https://segmentfault.com/a/1190000012332982
 */
import axios from 'axios'

const pending = []
const CancelToken = axios.CancelToken
const removePending = (_req) => {
  for (let p in pending) {
    if (pending[p].u === _req) {
      // 执行取消操作
      pending[p].f('取消重复请求')
      // 把这条记录从数组中移除
      pending.splice(p, 1)
      console.log(pending)
    }
  }
}

// 请求拦截器
axios.interceptors.request.use(config => {
  // 拦截重复请求(即当前正在进行的相同请求)
  let _u = config.baseURL + config.url.substring(1, config.url.length) + '&' + config.method + '&' + config.params.id
  removePending(_u)
  config.cancelToken = new CancelToken((c) => {
    pending.push({u: _u, f: c})
  })

  return config
}, error => {
  return Promise.reject(error)
})

// 异常处理
axios.interceptors.response.use(response => {
  let config = response.config
  let _req = config.url + '&' + config.method + '&' + config.params.id
  removePending(_req)

  console.log(pending)

  return {
    code: response.status,
    message: response.statusText,
    data: response.data
  }
}, error => {
  if (error) {}
  return Promise.reject(error)
})

axios.defaults.baseURL = 'http://localhost:3000/'

export default (instance) => {
  instance.prototype.axios = (data) => {
    var _params = {
      method: !data.method ? 'get' : data.method.toLowerCase(),
      url: data.url
    }
    if (_params.method === 'get') {
      _params.params = data.params
    } else {
      _params.data = data.params
    }

    return new Promise((resolve, reject) => {
      axios(_params).then(response => {
        resolve(response)
      })
    })
  }
}
