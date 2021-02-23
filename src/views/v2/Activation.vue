<template>
  <div class="v2-activation">
    <img src="../../assets/v2_img/jh.png" alt />
    <p>您还没有激活，赶紧支付11元去激活吧…</p>
    <van-button round block class="v2-bg-theme-color" @click="PaymentActivity">去激活</van-button>
  </div>
</template>

<script>
import { aes_encryptObject } from "@/api/encryption";
export default {
  data() {
    return {};
  },
  methods: {
    PaymentActivity() {
      let data = aes_encryptObject({ activity_id: this.$store.state.activeId });
      this.$http
        .post("/v2/payments/payment-activity", data)
        .then(res => {
          if (res.data.code == 0) {
            window.location.replace(res.data.data.pay_params.url) 
          } else {
            this.$toast(res.data.msg);
          }
        })
        .catch(e => {
          console.log(e);
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.v2-activation {
  padding: 15% 12% 0 12%;
  img {
    width: 100%;
    margin-bottom: 50px;
  }
  p {
    margin-bottom: 50px;
  }
}
</style>
