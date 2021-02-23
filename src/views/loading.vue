<template>
  <div class="loading">
    <img :src="url" alt v-show="is_show" />
  </div>
</template>

<script>
import { getrq, aes_encryptObject, } from "@/api/encryption";
export default {
  data() {
    return {
      is_show: false,
      rq: "",
      card_type: '',
      url: '',
      url1: require('../assets/loading1.gif'),
      url2: require('../assets/loading2.gif')
    };
  },
  created() {
    this.url = this.url1;
    let cur_token = localStorage.getItem(
      "localStorageToken_" + this.rq.activity_id
    );
    if (cur_token) {
      sessionStorage.setItem("token", cur_token);
    }
  },
  mounted() {
    this.getCoupontInfo();
    this.pushHistory();
    window.addEventListener(
      "popstate",
      this.popstateEvent,
      false
    );
  },
  destroyed() {
    window.removeEventListener("popstate", this.popstateEvent, false);
  },
  methods: {
    popstateEvent() {
      var query_rq = typeof this.$route.query.rq == "undefined" ? "" : this.$route.query.rq;
      var rq = getrq(query_rq);
      var version = rq.version
      let data = aes_encryptObject({
        activity_id: this.$store.state.activeId ||  rq.activity_id,
      });
      if(version == 'v1'){
           this.$router.replace({
            path: "/",
            query: data
        });
      }else{
        let datavt = aes_encryptObject({
            activity_id: this.rq.activity_id ||  rq.activity_id,
            version:'v3'
        });
        this.$router.replace({
            path: "/v3/index",
            query: datavt
        });
      }
    },
    pushHistory() {
      var state1 = {
        title: "title",
        url: "#"
      };
      window.history.pushState(state1, "title", "#");
    },
    getCoupontInfo() {
      var query_rq = typeof this.$route.query.rq == "undefined" ? "" : this.$route.query.rq;
      var rq = getrq(query_rq);
      this.rq = rq;
      //如果是支付结果则显示相应的提示
          //在此轮询处理，每隔3少处理一次，超过2秒钟，定时自动销毁，提示“”
          this.is_show = true;
          let data = aes_encryptObject({
            activity_id: rq.activity_id,
            out_trade_no: rq.out_trade_no
          });
          let _this = this
          let dadafail = null 
          _this.getPaymentResult(data).then(res => {
                console.log("回调,",res)
              let code = res.code;
              let pay_msg = res.pay_msg;
              // this.paycode = res.data.pay_code;
              if (Number(res.status) > 0) {
                _this.rq.code = code;
                _this.url = _this.url2;
                 _this.rq.version = res.version
                // clearInterval(orede_time);
                let query_data = aes_encryptObject({
                  activity_id: rq.activity_id,
                  pay_code: res.code,
                  pay_msg: pay_msg,
                  return_msg:res.return_msg,
                  amount:res.amount,
                  package_id:res.package_id,
                  out_trade_no:res.out_trade_no,
                  status:res.status
                });
                _this.linkPage(_this.rq.version,query_data);
              }else{
                  let orede_time = setInterval(() => {
                    _this.getPaymentResult(data).then(res => {
                        console.log("回调2,",res)
                    let code = res.code;
                    let pay_msg = res.pay_msg;
                    // this.paycode = res.data.pay_code;
                    if (Number(res.status) > 0) {
                        _this.rq.code = code;
                        _this.url = _this.url2;
                        _this.rq.version = res.version
                        clearInterval(orede_time);
                        let query_data = aes_encryptObject({
                        activity_id: rq.activity_id,
                        pay_code: res.code,
                        pay_msg: pay_msg,
                        return_msg:res.return_msg,
                        amount:res.amount,
                        package_id:res.package_id,
                        out_trade_no:res.out_trade_no,
                        status:res.status
                        });
                        _this.linkPage(_this.rq.version,query_data);
                    }else{
                        dadafail = aes_encryptObject({
                                activity_id: rq.activity_id,
                                pay_code: res.code,
                                return_msg:res.return_msg,
                                package_id:res.package_id,
                                amount:res.amount,
                                out_trade_no:res.out_trade_no,
                                status:res.status
                            });
                    }
                    });
                }, 3000);
                   setTimeout(() => {
                        clearInterval(orede_time);
                        _this.linkPage(_this.rq.version,dadafail);
                    }, 30 * 1000);
              }
            });
          
       
    },
    getPaymentResult(data){
        return new Promise((resolve, reject) => {
            this.$http.get("/exchanges/get-payment-result", { params: data })
            .then(res => {
                if(res.data.statusCode == 200 && res.data.code == 0){
                    resolve(res.data.data)
                }else{
                    reject({
                        code: res.data.code,
                        msg: res.data.message || res.data.msg,
					});
                }
            })
        })
    },
    linkPage(type, data = this.$route.query) {
        console.log("跳转：，",data)
      if (type != "" && typeof type != "undefined") {
          if(type == "v1"){
               window.location.href = location.protocol + '//' + location.host + '/result?rq=' + encodeURIComponent(data.rq);
          }else{
               window.location.href = location.protocol + '//' + location.host + '/v3/result?rq=' + encodeURIComponent(data.rq);
          }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.loading {
  text-align: center;
  img {
    width: 30vw;
    height:30vw;
    margin: 50% auto 0 auto;
  }
}
</style>
