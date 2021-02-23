<template>
  <div class="result">
    <div class="img_text">
      <img
        v-if="rq.return_code == 0 || rq.return_code == 220015 || rq.status == 1 " 
        :src="url2"
        alt
      />
      <img v-else :src="url1" alt />
      <div>
        <span
          v-if="rq.return_code == 0 || rq.return_code == 220015 || rq.status == 1" 
          style="color:#48CB20"
          >下单成功</span
        >
        <span v-else style="color:#707070">下单失败</span>
      </div>
    </div>
    <div class="field-box">
      <van-field v-model="rq.out_trade_no" label="订单号" readonly />
      <van-field label="金额" v-model="rq.amount" readonly />
      <div class="pay_msg" v-if="rq.return_code != 0 || rq.status != 1">
        <p>温馨提示</p>
        <img src="../../assets/sanjiao.png" alt />
        <div>{{ rq.return_msg }}</div>
      </div>
    </div>
    <van-button
      v-if="rq.status != 1"
      :style="{
        background: theme_color,
        color: '#fff',
        borderColor: theme_color
      }"
      round
      @click="payment"
      block
      class="text-color"
      >重新支付</van-button
    >
    <van-button type="default" round block @click="goIndex"
      >返回首页</van-button
    >
  </div>
</template>

<script>
import { aes_encryptObject, getrq } from "@/api/encryption";
export default {
  data() {
    return {
      rq: "",
      url1: require("../../assets/wx1.png"),
      url2: require("../../assets/wx2.png"),
      data: "",
      theme_color: localStorage.getItem('theme_color'),
    };
  },
  created() {
    this.rq = getrq(this.$route.query.rq);
    console.log("333,",this.rq,decodeURIComponent(this.$route.query.rq))
    let cur_token = localStorage.getItem(
      "localStorageToken_" + this.rq.activity_id
    );
    if (cur_token) {
      sessionStorage.setItem("token", cur_token);
    }
    this.data = aes_encryptObject({
      activity_id: this.rq.activity_id,
      version: 'v3'
    });
    this.rq.return_msg = decodeURIComponent(this.rq.return_msg);
    this.rq.amount = "￥" + this.rq.amount;
  },
  mounted() {
    this.pushHistory();
    window.addEventListener("popstate", this.popstateEvent, false);
  },
  destroyed() {
    window.removeEventListener("popstate", this.popstateEvent, false);
  },
  methods: {
    popstateEvent() {
      let data = aes_encryptObject({
        activity_id: this.rq.activity_id,
        version:'v3'
      });
      this.$router.replace({
        path: "/v3/index",
        query: data
      });
    },
    pushHistory() {
      var state1 = {
        title: "title",
        url: "#"
      };
      window.history.pushState(state1, "title", "#");
    }, // order_type 为1 激活支付，为2 套餐支付
    payment() {
      //套餐支付
      let myData = aes_encryptObject({
        package_id: this.rq.package_id,
        activity_id: this.rq.activity_id
      });
      this.$http
        .post("/v3/payments/payment", myData)
        .then(res => {
          if (res.data.code == 0) {
            window.location.href = res.data.data.pay_params.url;
          } else {
            this.loading = false;
            this.$toast(res.data.msg);
          }
        })
        .catch(e => {
          console.log(e);
        });
    },
 
    goIndex() {
      this.$router.replace({
        path: "/v3/index",
        query: this.data
      });
    }
  }
};
</script>

<style lang="scss" scope>
.result {
  height: 100vh;
  background: #f6f6f6;
  box-sizing: border-box;
  padding: 13% 10% 10% 10%;
  .van-button + .van-button {
    margin-top: 30px;
  }
  .van-button--default {
    background-color: #f6f6f6;
    border-color: #707070;
  }
  .pay_msg {
    position: relative;
    p {
      text-align: left;
    }
    & > div {
      background: #fff;
      align-items: center;
      justify-content: space-between;
      margin-top: 5px;
      text-align: left;
      padding: 20px;
      color: #707070;
      border-radius: 6px;
      overflow: auto;
    }
    img {
      position: absolute;
      top: 50px;
      left: 40px;
    }
    // .van-icon {
    //   font-size: 0.48rem;
    // }
  }
  .img_text {
    img {
      width: 10.27vw;
      height: 9.47vw;
    }
    span {
      font-size: 32px;
      font-weight: 600;
    }
  }
}
</style>
