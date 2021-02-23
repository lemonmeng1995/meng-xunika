<template>
  <div
    class="index"
    :style="
      bgImg
        ? { 'background-image': 'url(' + bgImg + ')' }
        : { backgroundColor: '#fff' }
    "
  >
    <div style="height:100%">
      <div class="img-box">
        <img :src="logoUrl" alt v-if="!bgImg" />
      </div>
      <van-form>
        <van-cell-group class="cell-style">
          <van-field
            v-model="phone"
            clearable
            placeholder="输入手机号码"
            icon-prefix="dhicon"
            left-icon="dhicon dhicon-phone"
            type="digit"
            maxlength="11"
            v-reset-page
            :style="{ color: theme_color }"
          />
          <van-field
            type="digit"
            v-model="sms_code"
            center
            clearable
            icon-prefix="dhicon"
            left-icon="dhicon dhicon-yanzhengma"
            placeholder="输入短信验证码"
            maxlength="6"
            v-reset-page
            :style="{ color: theme_color }"
          >
            <template #button>
              <van-button
                plain
                hairline
                round
                :disabled="disabled"
                @click="getCode"
                :style="{ color: theme_color, borderColor: theme_color }"
              >
                <span v-show="!disabled">获取验证码</span>
                <van-count-down
                  :time="time"
                  v-show="disabled"
                  @finish="finish"
                  ref="countDown"
                  :auto-start="false"
                >
                  <template v-slot="timeData">
                    <span style="color:#fff"
                      >{{ timeData.seconds }}秒后重发</span
                    >
                  </template>
                </van-count-down>
              </van-button>
            </template>
          </van-field>
        </van-cell-group>
        <van-button
          round
          block
          :style="{ background: theme_color }"
          @click="onSubmit"
          :loading="loading"
          class="ui-theme-btn"
          >登录</van-button
        >
      </van-form>
      <!-- <van-number-keyboard v-model="phone" :show="show" :maxlength="11" @blur="show = false" /> -->
      <common-text v-show="show"></common-text>
    </div>
  </div>
</template>
<script>
import CommonText from "@/components/CommonText.vue";
import { aes_encryptObject, getrq } from "@/api/encryption";
export default {
  name: "Index",
  components: {
    CommonText
  },
  data() {
    return {
      show: true,
      loading: false,
      disabled: false,
      phone: "",
      sms_code: "",
      activeId: "",
      logoUrl: localStorage.getItem("logoUrl"),
      bgImg: localStorage.getItem("bgImg"),
      tel_url1: require("../../assets/phone.png"),
      tel_url2: require("../../assets/v2_img/phone.png"),
      code_url1: require("../../assets/code.png"),
      code_url2: require("../../assets/v2_img/code.png"),
      time: 60 * 1000,
      is_end: false,
      sms_key: "0",
      textData: {},
      flag: "",
      version: "",
      theme_color: localStorage.getItem('theme_color')
    };
  },
  created() {
    let rq = getrq(this.$route.query.rq);
    this.activeId = this.$store.state.activeId
      ? this.$store.state.activeId
      : rq.activity_id;
    this.flag = rq.flag;
    this.version = rq.version;
    // this.textData = JSON.parse(sessionStorage.getItem("tel_info"));
    // const myToast = this.$toast.loading({
    //   message: "加载中...",
    //   forbidClick: true,
    //   className: "ui-loading",
    //   duration: 0
    // });
    // let myData = aes_encryptObject({ activity_id: this.activeId });
    // this.$http
    //   .get("/exchanges/get-activity", { params: myData })
    //   .then(res => {
    //     if (res.data.code == 0) {
    //       this.logoUrl = res.data.data.logo;
    //       document.title = res.data.data.page_title;
    //       sessionStorage.setItem("pay_title", res.data.data.pay_title);
    //       sessionStorage.setItem("pageTitle", res.data.data.page_title);
    //       sessionStorage.setItem("logoUrl", res.data.data.logo);
    //       this.bgImg = res.data.data.background_image;
    //       sessionStorage.setItem("number", res.data.data.exchange_limit_day);
    //       sessionStorage.setItem(
    //         "card_error_tips",
    //         res.data.data.card_error_tips
    //       );
    //       this.textData = {
    //         is_customer_service: res.data.data.is_customer_service,
    //         customer_title: res.data.data.customer_title,
    //         customer_service_url: res.data.data.customer_service_url,
    //         is_tel_consultation: res.data.data.is_tel_consultation,
    //         tel_title: res.data.data.tel_title,
    //         tel_consultation_info: res.data.data.tel_consultation_info,
    //         is_technol_explain: res.data.data.is_technol_explain,
    //         technol_logo: res.data.data.technol_logo,
    //         technol_title: res.data.data.technol_title
    //       };
    //       sessionStorage.setItem("tel_info", JSON.stringify(this.textData));
    //       let endtime = Math.round(new Date().getTime() / 1000);
    //       if (endtime > res.data.data.end_time || res.data.data.status == 0) {
    //         this.is_end = true;
    //       } else {
    //         //判断是否自动登录
    //         let urlrq = this.$route.query.rq;
    //         let currToken = localStorage.getItem(urlrq);
    //         if (currToken) {
    //           sessionStorage.setItem("token", currToken);
    //           let myData1 = aes_encryptObject({
    //             token: currToken
    //           });
    //           this.$http
    //             .post("/users/login", myData1)
    //             .then(res => {
    //               if (res.data.code == 0) {
    //                 this.loading = false;
    //                 sessionStorage.setItem("token", res.data.data.token);
    //                 localStorage.setItem(urlrq, res.data.data.token);
    //                 let that = this;
    //                 setTimeout(function() {
    //                   that.$router.replace({
    //                     path: "/cardList"
    //                   });
    //                 }, 500);
    //               } else {
    //                 this.isShow = true;
    //               }
    //             })
    //             .catch(e => {
    //               this.isShow = true;
    //               console.log(e);
    //             });
    //         } else {
    //           this.isShow = true;
    //         }
    //       }
    //     }
    //     myToast.clear();
    //   })
    //   .catch(e => {
    //     this.isShow = true;
    //     console.log(e);
    //   });
  },
  mounted() {
    this.pushHistory();
    window.addEventListener("popstate", this.popstateEvent, false);
    let that = this;
    const u = navigator.userAgent;
    if (u.indexOf("Android") > -1) {
      var originalHeight =
        document.documentElement.clientHeight || document.body.clientHeight;
      window.onresize = function () {
        var resizeHeight =
          document.documentElement.clientHeight || document.body.clientHeight;
        if (resizeHeight - 0 < originalHeight - 0) {
          that.show = false; //键盘弹起
        } else {
          that.show = true; //键盘收起
        }
      };
    }
  },
  destroyed() {
    window.removeEventListener("popstate", this.popstateEvent, false);
  },
  methods: {
    popstateEvent() {
      if (localStorage.getItem('is_front_page') == 1)
        this.$router.replace({
          path: "/v3/explain"
        })
      else
        this.$router.replace({
          path: "/v3/index"
        })
    },
    pushHistory() {
      var state1 = {
        title: "title",
        url: "#"
      };
      window.history.pushState(state1, "title", "#");
    },
    getCode() {
      let phone = this.phone;
      if (phone == "") {
        this.$toast("手机号码不能为空");
      } else if (!/^1[3456789]\d{9}$/.test(phone)) {
        this.$toast("请输入正确的手机号！");
      } else {
        let myData = { mobile: this.phone, activity_id: this.activeId, };
        myData = aes_encryptObject(myData);
        this.$http
          .post("v3/users/send-sms", myData)
          .then(res => {
            if (res.data.code == 0) {
              this.disabled = true;
              this.$refs.countDown.start();
              this.sms_key = res.data.data.sms_key;
              this.$toast(res.data.msg);
            } else {
              this.disabled = false;
              this.$toast(res.data.msg);
            }
          })
          .catch(e => {
            console.log(e);
          });
      }
    },
    finish() {
      this.disabled = false;
      this.$refs.countDown.reset();
    },
    onSubmit() {
      let sms_code = this.sms_code;
      let phone = this.phone;
      let apiUrl = "/v3/users/login";
      // if (this.disabled == false) {
      //   this.$toast("请先获取验证码！");
      // } else
      if (phone == "") {
        this.$toast("手机号码不能为空");
      } else if (!/^1[3456789]\d{9}$/.test(phone)) {
        this.$toast("请输入正确的手机号！");
      } else if (sms_code == "") {
        this.$toast("验证码不能为空");
      } else {
        this.loading = true;
        let myData = aes_encryptObject({
          mobile: this.phone,
          activity_id: this.activeId,
          sms_code: this.sms_code,
          sms_key: this.sms_key
        });
        this.$http
          .post(apiUrl, myData)
          .then(res => {
            if (res.data.code == 0) {
              this.loading = false;
              sessionStorage.setItem("token", res.data.data.token);
              //永久存储token
              localStorage.setItem(
                "localStorageToken_" + this.activeId,
                res.data.data.token
              );
              this.$toast(res.data.msg);
              let that = this;
              setTimeout(function () {
                if (that.flag == "my") {
                  that.$router.replace({
                    path: "/v3/My"
                  });
                } else {
                  that.$router.replace({
                    path: "/v3/CardDetails"
                  });
                }
              }, 500);
            }else if(res.data.code == 220022){
            this.loading = false;
          } else {
              this.loading = false;
              this.$toast(res.data.msg);
            }
          })
          .catch(e => {
            this.loading = false;
            console.log(e);
          });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.index {
  box-sizing: border-box;
  background-repeat: no-repeat;
  background-size: 100%;
  height: 100vh;
  padding: 0 40px;
  .img-box {
    height: 40%;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      width: 240px;
    }
  }
  .van-cell {
    padding: 30px 3px;
    align-items: center;
  }
  .van-hairline--top-bottom::after {
    border-top: 0;
  }
  .van-button.van-button--info,
  .van-button.van-button--danger,
  .ui-theme-btn {
    margin-top: 50px;
    height: 92px !important;
    line-height: 92px !important;
    color: #fff;
    span {
      font-size: 32px !important;
    }
  }
}
</style>
