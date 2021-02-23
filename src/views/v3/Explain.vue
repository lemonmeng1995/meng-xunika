<template>
  <div class="v3_explain">
    <!-- <div class="panel" >
      <van-image src="img1">
        <template v-slot:loading>
          <van-loading type="spinner" size="20" />
        </template>
      </van-image>
    </div> -->
    <div
      class="panel position_panel"
      v-for="(item, index) in img_arr"
      :key="index"
    >
      <van-image :src="item.image">
        <template v-slot:loading>
          <van-loading type="spinner" size="20" />
        </template>
      </van-image>
      <div class="btn-box" v-show="item.image_type == 2">
        <div class="btn_text" v-show="show" @click="$toast('活动尚未开启')">
          <img src="../../assets/djs.png" alt="" />
          <van-count-down
            :time="time"
            @finish="finish"
            ref="countDown"
            :auto-start="true"
            format="DD天HH时mm分ss秒"
          ></van-count-down>
        </div>
        <p class="btn_text" v-show="!show" @click="btn_link">
          {{ front_page_btn_text }}
        </p>
        <div class="text" @click="alink_link">{{ front_page_alink_text }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { aes_encryptObject } from "@/api/encryption";
export default {
  data() {
    return {
      img_arr: [],
      activeId: '',
      time: '',
      status: true,
      show: false,
      front_page_btn_text: '',
      front_page_btn_link: '',
      front_page_alink_text: '',
      front_page_alink_link: ''
    }
  },
  created() {
    const myToast = this.$toast.loading({
      message: "加载中...",
      forbidClick: true,
      className: "ui-loading",
      duration: 0
    });
    this.activeId = this.$store.state.activeId
    let activityData = aes_encryptObject({ activity_id: this.activeId });
    this.$http
      .get("/exchanges/get-activity", { params: activityData })
      .then(res => {
        if (res.data.code == 0) {
           let data = res.data.data
          document.title = data.page_title;
          let endtime = Math.round(new Date().getTime() / 1000);
          if ((endtime > data.end_time || data.status == 0) && data.is_front_page==1) {
            myToast.clear();
            this.front_page_alink_text = data.front_page_alink_text;
            this.img_arr = data.front_background_images
            this.front_page_alink_link = data.front_page_alink_link
            this.show = false;
            this.status = false;
            this.front_page_btn_text = "活动已结束"
            return false;
          }
          localStorage.setItem("pay_title", data.pay_title);
          localStorage.setItem("logoUrl", data.logo);
          localStorage.setItem("theme_color", data.color);
          localStorage.setItem("card_error_tips", data.card_error_tips);
          localStorage.setItem("is_notice", data.is_notice);
          let textData = {
            is_customer_service: data.is_customer_service,
            customer_title: data.customer_title,
            customer_service_url: data.customer_service_url,
            is_tel_consultation: data.is_tel_consultation,
            tel_title: data.tel_title,
            tel_consultation_info: data.tel_consultation_info,
            is_technol_explain: data.is_technol_explain,
            technol_logo: data.technol_logo,
            technol_title: data.technol_title
          };
          localStorage.setItem("tel_info", JSON.stringify(textData));
          myToast.clear();
          if(data.is_notice == 1){
             this.$router.replace('/v3/activityAnnounc')
            return false
          }else if (data.is_front_page == 0) {
            this.$router.replace('/v3/index')
            return false
          }
          let start_time = data.activity_start_time * 1000;
          let cur_time = data.activity_start_now_time * 1000
          if (data.front_page_btn_type == 1) {
            if (start_time > cur_time) {
              this.show = true
              this.time = Math.round(start_time - cur_time);
            } else {
              this.show = false
            }
          }
          this.img_arr = data.front_background_images
          this.front_page_alink_link = data.front_page_alink_link
          this.front_page_btn_text = data.front_page_btn_text;
          this.front_page_btn_link = data.front_page_btn_link
          this.front_page_alink_text = data.front_page_alink_text;
        } else {
          myToast.clear();
        }
      }).catch(()=> {
        myToast.clear();
      })
  },
  methods: {
    btn_link() {
      if (this.status) {
        if (this.front_page_btn_link == 1) {
          this.$router.push('/v3/index')
        } else {
          this.$router.push('/v3/my')
        }
      }
    },
    alink_link() {
      let cur_token = localStorage.getItem(
        "localStorageToken_" + this.activeId
      );
      let isNotice = localStorage.getItem("is_notice");
      let query_data = aes_encryptObject({
        activity_id: this.activeId,
        flag: 'my',
        version: 'v3'
      })
      if (isNotice == 1) {
        this.$router.push({ path: "/v3/activityAnnounc", });
      }else if (cur_token) {
        if (this.front_page_alink_link == 1) {
          this.$router.push('/v3/index')
        } else {
          this.$router.push('/v3/My')
        }
      } else {
        // this.$toast("请先登录");
        this.$router.push({ path: "/v3/login", query: query_data });
      }

    },
    finish() {
      this.show = false;
      this.time = 0
    },
  }
}
</script>

<style lang="scss" scoped>
.v3_explain {
  .panel.position_panel {
    position: relative;
  }
  .panel {
    width: 100%;
    // background-repeat: no-repeat;
    // background-size: 100% 100%;
    .van-image {
      vertical-align: bottom;
    }
    .btn-box {
      position: absolute;
      width: 100%;
      left: 0%;
      top: 0;
      .btn_text {
        width: 75%;
        height: 11vw;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 2.8vw auto 0 auto;
        color: #f93623;
        font-weight: 700;
        .van-count-down {
          color: #f93623;
          font-size: 30px;
          font-weight: 700;
        }
        font-size: 30px;
        img {
          width: 136px;
          margin-right: 10px;
        }
      }
      .text {
        margin-top: 24px;
        color: #fff;
        text-decoration: underline;
        font-size: 28px;
        font-weight: 700;
      }
    }
  }
}
</style>
