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
      <van-button
        type="danger"
        block
        round
        @click.stop="payment"
        :loading="loading"
        v-show="detailData.exchange_status == 1 && (detailData.dispense_limit_day > 0) && ( Number(detailData.today_total_sold) < Number(number))"
      >{{ pay_title }}</van-button>
      <van-button
        block
        round
        disabled
        v-show="detailData.exchange_status == 0 || (detailData.dispense_limit_day == 0) || ( Number(detailData.today_total_sold) >= Number(number))"
      >抢光了</van-button>
    </div>
    <!-- <van-dialog v-model="show" :showConfirmButton="false" class="ui-dialog">
      <div class>
        <van-icon name="cross" @click="show=false" />
        <van-field v-model="value" placeholder="请输入兑换码" maxlength="15" clearable />
        <van-button
          round
          block
          type="danger"
          @click.stop="payment"
          :loading="loading"
        >{{ pay_title }}</van-button>
      </div>
    </van-dialog>-->
    <common-text v-if="is_show"></common-text>
  </div>
</template>

<script>
import CommonText from "@/components/CommonText";
import { aes_encryptObject, getrq } from "@/api/encryption";
export default {
  components: {
    CommonText
  },
  data() {
    return {
      show: false,
      value: "",
      loading: false,
      data: {},
      pay_title: "",
      is_show: true,
      number: "",
      detailData: {},
      textData: {}
    };
  },
  mounted() {
    this.number = sessionStorage.getItem("number");
    let rq = getrq(this.$route.query.rq);
    this.data = rq;
    this.pay_title = sessionStorage.getItem("pay_title");
    this.getPackageDetail();
    this.pushHistory();
    let that = this;
    const u = navigator.userAgent;
    if (u.indexOf("Android") > -1) {
      var originalHeight =
        document.documentElement.clientHeight || document.body.clientHeight;
      window.onresize = function() {
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
        .get("/v2/exchanges/get-package-detail", { params: data })
        .then(res => {
          if (res.data.code == 0) {
            myToast.clear();
            this.detailData = res.data.data;
          } else {
            this.$toast(res.data.msg);
          }
        })
        .catch(e => {
          console.log(e);
        });
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
      // if (!/^[A-Za-z0-9]{6,15}$/.test(this.value)) {
      //   this.$toast("请输入6~15数字字母组合兑换码");
      // } else {
      this.loading = true;
      let myData = aes_encryptObject({
        package_id: this.data.package_id,
        // exchange_code: this.value,
        activity_id: this.data.activity_id
      });
      this.$http
        .post("/v2/payments/payment", myData)
        .then(res => {
          if (res.data.code == 0) {
            this.loading = false;
            window.location.href = res.data.data.pay_params.url;
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
    // }
  }
};
</script>

<style lang="scss" scoped>
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
    }
  }
}
</style>
