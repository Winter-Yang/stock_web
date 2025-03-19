// 引入 axios
import axios from 'axios'

var http = {

  /** get 请求
   * @param  {接口地址} url
   * @param  {请求参数} params
   */
  get: function(url, params){
    const config = {
      // 跨域请求不携带凭证，避免预检请求
      withCredentials: false,
      // 添加请求参数
      params: params,
      // 设置请求头
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      axios.get(url, config)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
    })
  },
  /** post 请求
   * @param  {接口地址} url
   * @param  {请求参数} params
   */
  post: function(url,params){
    const cookies = {

    }
    const config = {
      withCredentials: true
    };
    
    // 如果提供了自定义cookie，添加到请求头
    if (cookies) {
      config.headers = {
        'platform': '3',
        // 'pragma': 'no-cache',
        // 'priority': 'u=1, i',
        'timestamp': Date.now().toString(),
        'token': 'd05fead4baf3fea35f38c0503ec0685c',
        "Access-Control-Allow-Origin":"*",
      };
    }

    return new Promise((resolve,reject) => {
      axios.post(url,params,config)
      .then((response) => {
        resolve( response.data );
      })
      .catch((error) => {
        reject( error );
      });
    })
  },
   /** 格式化cookie对象为字符串
   * @param  {cookie对象} cookies
   * @return {cookie字符串}
   */
   formatCookies: function(cookies) {
    if (typeof cookies === 'string') {
      return cookies;
    }
    
    return Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }
}
export default http
