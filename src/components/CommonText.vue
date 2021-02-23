<template>
  <div class="footer_common_text">
    <div v-if="info.is_customer_service == 1" class="flex_s">
      <van-icon name="service-o" />
      <a :href="info.customer_service_url" target="_brank" class="a_color">{{info.customer_title }}</a>
    </div>
    <div v-if="info.is_tel_consultation == 1" class="flex_s">
      <p>
        <van-icon name="phone-o" />
        <span>{{info.tel_title}}</span>
      </p>
      <a
        class="text-7f-color"
        :href="'tel:'+ info.tel_consultation_info"
      >{{ info.tel_consultation_info }}</a>
    </div>
    <p v-if="info.is_technol_explain ==1">
      <img :src="info.technol_logo" alt style="width:24px;margin-right:6px" />
      <span style="font-size:14px">{{ info.technol_title }}</span>
    </p>
  </div>
</template>

<script>
export default {
  // props: {
  //   info: {
  //     type: Object
  //   }
  // },
  data() {
    return {
      info: ""
    };
  },
  created() {
    this.info = JSON.parse(localStorage.getItem("tel_info"));
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.flex_s {
  a.a_color {
    color: #2676e5;
    font-size: 28px;
    margin-left: 5px;
  }
  .van-icon-service-o {
    font-size: 36px;
  }
}
</style>
