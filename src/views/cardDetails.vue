<template>
  <div class="cardDetails">
    <div class="main_wrap">
      <van-cell class="card_item ui-panel">
        <div class="img_text flex">
          <img :src="detailData.image" alt />
          <div class="text">
            <p class="title">{{ detailData.name }}</p>
            <p class="text-7f-color">已售{{ detailData.today_sold }}张</p>
          </div>
        </div>
      </van-cell>
      <div class="text-wrap">
        <div>使用说明：</div>
        <p v-html="detailData.explain" class="explain"></p>
      </div>
    </div>
    <div class="footer_fixed">
      <!-- <van-button
        :style="{ background: theme_color,color:'#fff' }"
        block
        round
        @click="openDialog"
        v-show="(detailData.dispense_limit_day > 0) && ( Number(detailData.today_total_sold) < Number(number))"
      >我要兑换</van-button>
      <van-button
        block
        round
        disabled
        v-show="(detailData.dispense_limit_day == 0) || ( Number(detailData.today_total_sold) >= Number(number))"
      >抢光了</van-button> -->
      <van-button
        :style="exchange_status==1 ? { background: theme_color } : { background: '#ccc' }"
        block
        round
        @click.stop="openDialog"
        :disabled="disabled"
      >
        <span>我要兑换</span>
        <van-count-down
          v-show="count_show"
          :time="time"
          @finish="finish"
          ref="countDown"
          :auto-start="false"
          format="HH:mm:ss"
        ></van-count-down>
      </van-button>
    </div>
    <van-dialog v-model="show" :showConfirmButton="false" class="ui-dialog">
      <div class>
        <van-icon name="cross" @click="show = false" />
        <van-field
          v-model="value"
          placeholder="请输入兑换码"
          maxlength="15"
          clearable
        />
        <van-button
          round
          block
          :style="{ background: theme_color, color: '#fff' }"
          @click.stop="payment"
          :loading="loading"
          >{{ pay_title }}</van-button
        >
      </div>
    </van-dialog>
    <common-text v-if="is_show"></common-text>
  </div>
</template>

<script>
import CommonText from "@/components/CommonText";
import { aes_encryptObject, aes_decrypt } from "@/api/encryption";
export default {
  components: {
    CommonText
  },
  data() {
    return {
      count_show: false,
      disabled: false,
      show: false,
      value: "",
      loading: false,
      data: {},
      pay_title: "",
      is_show: true,
      number: "",
      detailData: {},
      textData: {},
      time: '',
      exchange_status: true,
      theme_color: localStorage.getItem('theme_color')
    };
  },
  mounted() {
    this.number = localStorage.getItem("number");
    let rq = this.$route.query.rq;
    var arr_url = aes_decrypt(rq);
    rq = JSON.parse(arr_url);
    this.data = rq;
    this.pay_title = localStorage.getItem("pay_title");
     let cur_token = localStorage.getItem(
      "localStorageToken_" + this.data.activity_id
    );
    if (cur_token) {
      sessionStorage.setItem("token", cur_token);
    }
    this.getPackageDetail();
    this.pushHistory();
    let that = this;
    const u = navigator.userAgent;
    if (u.indexOf("Android") > -1) {
      var originalHeight =
        document.documentElement.clientHeight || document.body.clientHeight;
      window.onresize = function () {
        var resizeHeight =
          document.documentElement.clientHeight || document.body.clientHeight;
        if (resizeHeight - 0 < originalHeight - 0) {
          that.is_show = false; //键盘弹起
        } else {
          that.is_show = true; //键盘收起
        }
      };
    }
  },
  methods: {
    getPackageDetail() {
      const myToast = this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        className: "ui-loading"
      });
      let data = aes_encryptObject({
        package_id: this.data.package_id,
        activity_id: this.data.activity_id
      });
      this.$http
        .get("/exchanges/get-package-detail", { params: data })
        .then(res => {
          if (res.data.code == 0) {
            myToast.clear();
            let m_data = res.data.data
            this.detailData = m_data;
            this.exchange_status = m_data.exchange_status ==1 && (m_data.dispense_limit_day > 0) && (Number(m_data.today_total_sold) < Number(this.number))
            // m_data.exchange_status ==0 ->活动未开，置灰 手动--未开启 定时--倒计时  ==1-> 有库存主题色，我要兑换 无库存置灰 抢光了 
            if (!this.exchange_status) {
              this.disabled = true;
            }
            if (this.detailData.card_time && m_data.exchange_status == 0) {
              let card_time = this.detailData.card_time
              let itemArr = this.detailData.timing_week;
              let myD = new Date();
              let week = myD.getDay().toString();
              if (itemArr.indexOf(week) != -1) {
                let start_titem = new Date(`${myD.getFullYear()}/${myD.getMonth() + 1}/${myD.getDate()} ${card_time}`).getTime(); //设置活动开始时间
                let cur_time = this.detailData.now_time; //服务器当前时间
                if (cur_time < start_titem) {
                  this.time = Math.round(start_titem - cur_time);
                  this.count_show = true;
                  this.disabled = true;
                  setTimeout(() => {
                    this.$refs.countDown.start();
                  }, 500);
                }
              }
            }
          } else {
            myToast.clear();
          }
        })
        .catch(e => {
          console.log(e);
        });
    },
    finish() {
      this.count_show = false;
      this.disabled = false;
      this.exchange_status = true;
    },
    pushHistory() {
      var state1 = {
        title: "title",
        url: "#"
      };
      window.history.pushState(state1, "title", "#");
    },
    openDialog() {
      this.show = true;
      this.value = "";
    },
    payment() {
      if (!/^[A-Za-z0-9]{6,15}$/.test(this.value)) {
        this.$toast("请输入6~15数字字母组合兑换码");
      } else {
        this.loading = true;
        let myData = aes_encryptObject({
          package_id: this.data.package_id,
          exchange_code: this.value,
          activity_id: this.data.activity_id
        });
        this.$http
          .post("/exchanges/payment", myData)
          .then(res => {
            if (res.data.code == 0) {
              this.loading = false;
              window.location.href = res.data.data.pay_params.url;
            }else if(res.data.code == 220022){
            this.loading = false;
            this.finished = true;
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
.van-count-down {
  display: inline-block;
  margin-left: 10px;
  font-size: 4vw;
  color: #fff;
}
.cardDetails {
  .main_wrap {
    height: 90vh;
  }
  .text-wrap {
    height: 60%;
  }
  .explain {
    max-height: 93%;
    overflow-y: scroll;
  }
  padding: 30px 20px 0 20px;
  .footer_common_text {
    bottom: 100px;
  }
  .ui-panel {
    border-radius: 24px;
    .img_text {
      max-width: 100%;
      img{
        width: 88px;
        height: 88px;
      }
    }
  }
  .footer_fixed {
    background: #fff;
    display: flex;
    left: 0;
    align-items: center;
    justify-content: center;
    .van-button--block {
      width: 94%;
      color:#fff
    }
  }
}
</style>
