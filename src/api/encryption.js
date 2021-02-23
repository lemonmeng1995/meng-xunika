/* eslint-disable */
import hex_md5 from 'js-md5'
import cryptoJs from 'crypto-js'
let Base64 = require('js-base64').Base64;

const apis = {
  api_key: 't@0A0KGCNaoEZ&wYjn0hbLRwmDj2IgUa',
  aes_key: 'l49ij@Dz0z3X$Gza',
  aes_iv: 'FdO!$8M4bbpTmzxw'
}
//get方法 rq参数加密
/**
 * 
 * 加密用法
 * let ss = urlTo({code: 'abc', page: 5, page_num: 6});
 * 
 * @param {*} string 
 * @param {*} type 
 * @param {*} status 
 */
export function urlTo(string, type, status) {

  if (typeof type !== 'boolean') {
    type = true
  }
  if (typeof status !== 'boolean') {
    status = false
  }
  if (typeof string === 'object') {
    var str = '',
      s = 0;
    for (var i in string) {
      if (s === 0) {
        str += i + '=' + string[i];
      } else {
        str += '&' + i + '=' + string[i];
      }
      s++;
    }
    string = str;
  }
  var key = hex_md5(apis.api_key);
  var key_length = key.length;
  var string = (type == false) ? window.atob(decodeURIComponent(string)) : hex_md5(string + key).substring(0, 8) + string;
  var string_length = string.length;
  var rndkey = new Array(),
    box = new Array();
  var result = '';
  for (var i = 0; i <= 255; i++) {
    rndkey[i] = key[i % key_length].charCodeAt();
    box[i] = i;
  }
  for (var j = i = 0; i < 256; i++) {
    j = (j + box[i] + rndkey[i]) % 256;
    var tmp = box[i];
    box[i] = box[j];
    box[j] = tmp;
  }
  for (var a = j = i = 0; i < string_length; i++) {
    a = (a + 1) % 256;
    j = (j + box[a]) % 256;
    var tmp = box[a];
    box[a] = box[j];
    box[j] = tmp;
    result += String.fromCharCode(string[i].charCodeAt() ^ (box[(box[a] + box[j]) % 256]));
  }
  if (type == false) {
    if (result.substring(0, 8) == hex_md5(result.substring(8) + key).substring(0, 8)) {
      return result.substring(8);
    } else {
      return '';
    }
  } else {
    if (status == false) {
      return encodeURIComponent(window.btoa(result).replace(/=/g, ''));
    } else {
      return window.btoa(result).replace(/=/g, '');
    }
  }
}
/**
 * 加密
 * @param {*} obj 数据对象
 * @param {*} jsMd5 
 * @param {*} method 
 */
// function ObjectSignature(obj, jsMd5, method = 'post') {
//   //密钥
//   var api_key = 't@0A0KGCNaoEZ&wYjn0hbLRwmDj2IgUa';

//   delete obj.sign;

//   var exceptArr = [];
//   if (typeof (obj.except_field) !== 'undefined') {
//     //框架请求会自带v,所以屏蔽v
//     exceptArr = obj.except_field.split(',');
//     if (!(exceptArr.includes('v'))) {
//       obj.except_field = obj.except_field + ",v";
//     }
//     if (!(exceptArr.includes('limit'))) {
//       obj.except_field = obj.except_field + ",limit";
//     }
//     if (!(exceptArr.includes('page'))) {
//       obj.except_field = obj.except_field + ",page";
//     }
//   } else {
//     let ex = 'v,limit,page';
//     obj.except_field = ex;
//     exceptArr = ex.split(',');
//   }

//   var signStr = '';
//   var objKey;
//   var obj_sort = Object.keys(obj).sort();
//   for (var index in obj_sort) {
//     objKey = obj_sort[index];
//     if (obj[objKey] + '' == '' && typeof (obj[objKey]) == 'undefined') continue;
//     if (objKey == 'except_field') continue;
//     if (String(exceptArr.indexOf((objKey))) != '-1') continue;
//     if (typeof (obj[objKey]) == 'undefined' || String(obj[objKey]) == '') continue;
//     if (signStr != '') { signStr += "&"; }
//     signStr += obj[objKey];
//   }
//   log(signStr);
//   signStr += "&" + api_key;
//   obj.sign = hex_md5.md5(signStr);

//   //如果是GET，则返回querystring
//   if (method.toUpperCase() == 'GET') {
//     var params = Object.keys(obj).map(function (key) {
//       return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
//     }).join("&");
//     console.log(params);
//     return params;
//   } else {
//     return obj;
//   }

// }
//   // 键值对排序，用于签名算法
// function sorting(data) {
//     const arr = []
//     for (var key in data) {
//         arr.push(key)
//     }
//     arr.sort()
//     let str = ''
//     for (var i in arr) {
//         str += data[arr[i]] + '&'
//         // str +=arr[i]+"="+data[arr[i]]+"&"
//     }
//     return str.substr(0, str.length - 1)
//     }
//     // 加密
//     function encrypt(data) {
//     return hex_md5(sorting(data) + '&' + apis.api_key)
//     }

//     // 验签
export function ObjectSignature(a) {
  if (typeof (a) == 'undefined') {
    return
  }
  var f = apis.api_key
  var d = Object.keys(a).sort()
  var e = []
  typeof a.except_field !== 'undefined' && (e = a.except_field.split(','))
  var b = ''
  for (const index in d) {
    var c = d[index]
    // console.log(a[c],1212)
    if (a[c] + '' != '') {
      c != 'except_field' && String(e.indexOf(c)) == '-1' && (b != '' && (b += '&'), b += a[c])
    }
  }
  b += '&' + f
  console.log(b)
  a.sign = hex_md5(b);
  return a
}

/**
 * 加密对象
 */
export function aes_encryptObject(obj) {
  var encryptStr = JSON.stringify(obj);
  encryptStr = aes_encrypt(encryptStr);
  return {
    rq: encryptStr
  };
}

// 加密
export function aes_encrypt(str) {
  var key = cryptoJs.enc.Utf8.parse(apis.aes_key);
  var iv = cryptoJs.enc.Utf8.parse(apis.aes_iv);
  var encrypted = cryptoJs.AES.encrypt(str, key, { iv: iv, mode: cryptoJs.mode.CBC, padding: cryptoJs.pad.Pkcs7 });

  return encodeURIComponent(encrypted.toString());
}

// 解密
export function aes_decrypt(str) {
  str = decodeURIComponent(str);
  var key = cryptoJs.enc.Utf8.parse(apis.aes_key);
  var iv = cryptoJs.enc.Utf8.parse(apis.aes_iv);
  var decrypted = cryptoJs.AES.decrypt(str, key, { iv: iv, padding: cryptoJs.pad.Pkcs7 });
  return decrypted.toString(cryptoJs.enc.Utf8);
}


/**
 * 获取RQ并解析
 */
export function getrq(rq) {
  let obj = {};
  rq = decodeURIComponent(rq);
  var arr_url = aes_decrypt(rq);
  // if(arr_url.indexOf('&')  == -1  && arr_url.indexOf('=')  == -1){
  if(isJsonString(arr_url)){
    // {"a":"1","b":"2"}
    obj = JSON.parse(arr_url);
    return obj
  }else{
    //a=1&b=2
    var arr2 = arr_url.split('&');
    for (var i = 0; i < arr2.length; i++) {
      var arr3 = arr2[i].split('=');
      obj[arr3[0]] = arr3[1];
    }
    return obj;
  }
}

/**
 * 
 * @param {*} str 
 */
export function isJsonString(str) {
  try {
      if (typeof JSON.parse(str) == "object") {
          return true;
      }
  } catch(e) {
  }
  return false;
}


// export function getMyRq(rq) {
//   let arr_url = aes_decrypt(rq);
//   let myrq = JSON.parse(arr_url);
//   return myrq
// }


export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return timeStr
}

/**
 * 缩略图
 * @param {*} imgUrl 
 * @param {*} width 
 */
export function imageResize(imgUrl, width = 750) {
  return imgUrl + '?x-oss-process=image/resize,w_' + width
}
