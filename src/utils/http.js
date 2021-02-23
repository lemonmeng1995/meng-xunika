import axios from "axios";
import qs from "qs";
import router from '../router';
import { getrq } from "@/api/encryption";
import {
  Toast
} from 'vant';

const http = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 8000
});

http.interceptors.request.use(
  function (config) {
    if (config.method == "post") {
      config.headers["content-type"] = "application/x-www-form-urlencoded";
      config.data = qs.stringify(config.data);
    }
    var token
    if (config.url == "/v2/exchanges/package-list") {
      let activeId = getrq(config.params.rq).activity_id
      token = localStorage.getItem("localStorageToken_" + activeId)
    } else {
      token = sessionStorage.getItem("token");
    }
    if (token) {
      config.headers.common["Authorization"] = token;
    }
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
http.interceptors.response.use(
  function (response) {
    // // 对响应数据做点什么
    const version = getrq(router.currentRoute.query.rq).version;
    if (response.data.code == '220022') {
      if (version) {
        router.push('/v3/activityAnnounc')
      }else{
        router.push('/activityAnnounc')
      }
    }
    if (response.data.code == "200004") {
      if (version) {
        router.push('/'+version+'/login')
      } else {
        router.push('/login')
      }
      Toast('请先登录');
    }
    // if (response.data.code == "220018" && version) {
    //   router.push('/v2/index')
    //   Toast('活动已关闭');
    // } 
    if (response.data.code == '220019') {
      router.push('/v2/activation')
      Toast('请先激活');
    }
  
    return response;
  },
  function (error) {
    // 对响应错误做点什么
    if (error.message && error.message.indexOf("timeout") > -1) {
      Toast('接口超时,请重新刷新页面');
    }
    return Promise.reject(error);
  }
);

export default http;
