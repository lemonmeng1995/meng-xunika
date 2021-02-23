<template>
  <div class="qrcode">
    <div class="empty_img" v-if="show">
      <img src="../assets/tu.png" alt />
      <p>礼券发放中, 请稍侯</p>
    </div>
    <van-cell class="card_item ui-panel" v-if="content.code_exchange">
      <div class="img_text flex">
        <img :src="content.image" alt />
        <div class="text">
          <p class="title">{{ content.name }}</p>
          <p class="text-7f-color" v-if="!hasPassword">兑换码：{{ content.code_exchange }}</p>
          <div v-if="hasPassword">
            <p>卡号：{{ content.code_exchange.number }}</p>
            <p>卡密：{{ content.code_exchange.password }}</p>
          </div>
        </div>
      </div>
      <div class="btn-box">
        <van-button
          round
          type="info"
          class="btn-style1"
          id="copyBtn1"
          v-if="hasPassword"
          v-clipboard:copy="content.code_exchange.number"
          v-clipboard:success="success"
          v-clipboard:error="error"
        >复制卡号</van-button>
        <van-button
          round
          type="info"
          class="btn-style1"
          id="copyBtn2"
          v-if="hasPassword"
          v-clipboard:copy="content.code_exchange.password"
          v-clipboard:success="success"
          v-clipboard:error="error"
        >复制卡密</van-button>
        <van-button
          round
          type="info"
          class="btn-style1"
          id="copyBtn3"
          v-if="!hasPassword"
          v-clipboard:copy="content.code_exchange"
          v-clipboard:success="success"
          v-clipboard:error="error"
        >复制</van-button>
      </div>
    </van-cell>
    <div class="code-text" v-if="content.code_qr">
      <div>{{ content.name }}</div>
      <img :src="content.code_qr" alt />
      <p v-if="url!=''">
        <van-tag>1</van-tag>请识别图中二维码去使用
        <br />
        <van-tag>2</van-tag>
        <a :href="url" style="color:#2676E5">点击打开去使用</a>
      </p>
      <p v-else>请向收银员出示该二维码</p>
      <!-- <p class="color-666">2020.04.16到期</p> -->
    </div>
    <div class="text-wrap">
      <div>使用说明：</div>
      <p v-html="content.explain"></p>
      <!-- <p v-else style="text-align:center">暂无说明</p> -->
    </div>
    <common-text></common-text>
  </div>
</template>

<script>
import CommonText from "@/components/CommonText";
import { aes_encryptObject, aes_decrypt } from "@/api/encryption";
export default {
  name: "qrcode",
  components: {
    CommonText
  },
  data() {
    return {
      url: "",
      show: false,
      content: {},
      hasPassword: false,
      textData: {}
    };
  },
  mounted() {
    // this.textData = JSON.parse(sessionStorage.getItem("tel_info"));
    const myToast = this.$toast.loading({
      message: "加载中...",
      forbidClick: true,
      className: "ui-loading"
    });
   
    let rq = this.$route.query.rq;
     
    var arr_url = aes_decrypt(rq);
    rq = JSON.parse(arr_url);
     let cur_token = localStorage.getItem(
      "localStorageToken_" + rq.activity_id,
    );
    if (cur_token) {
      sessionStorage.setItem("token", cur_token);
    }
    let myData = aes_encryptObject({
      activity_id: rq.activity_id,
      out_trade_no: rq.out_trade_no
    });
    this.$http
      .get("/exchanges/order-detail", { params: myData })
      .then(res => {
        if (res.data.code == 0) {
          myToast.clear();
          if (res.data.data.code_exchange.match(/{/)) {
            this.hasPassword = true;
            res.data.data.code_exchange = JSON.parse(
              res.data.data.code_exchange
            );
          }
          this.url = res.data.data.code_link;
          this.content = res.data.data;
          if (!this.content.code_exchange && !this.content.code_qr) {
            this.show = true;
          }
        } else {
          myToast.clear();
          this.$toast(res.data.msg);
        }
      })
      .catch(e => {
        console.log(e);
      });
  },
  methods: {
    success() {
      this.$toast("复制成功");
    },
    error() {
      this.$toast("复制失败，请重新复制");
    }
  }
};
</script>

<style lang="scss" scoped>
.btn-style1+.btn-style1{
  margin-top: 32px;
}
.van-tag--default {
  border-radius: 50%;
  margin-right: 10px;
  background: #ccc;
  width: 35px;
  height: 35px;
  padding: 0;
  text-align: center;
  line-height: 35px;
  display: inline-block;
  font-size: 15px;
}
.qrcode {
  padding: 16px 20px 0 20px;
  height: 82vh;
  .img_text{
    width:76%;
    .text{
      width:100%;
      overflow: hidden;
    }
  }
  .text-wrap {
    height: 93%;
    overflow-y: scroll;
  }
  .empty_img {
    margin: 40px 0;
    img {
      width: 55%;
    }
    p {
      margin-top: 5px;
      font-size: 28px;
    }
  }
  .ui-panel {
    border-radius: 24px;
  }
  .code-text {
    p {
      margin: 10px 0;
    }
    div,
    p {
      font-size: 28px;
      font-weight: 500;
    }
    .color-666 {
      color: #666;
    }
    img {
      width: 175px;
      height: 175px;
      margin: 20px 0 0px 0;
    }
  }
}
</style>
