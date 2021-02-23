<template>
  <div v-if="!is_end" style="background: #fb0b12;">
    <div class="bg_box" :style="{ 'background-image': 'url(' + bgUrl + ')' }">
      <div class="card_wrap act_card">
        <div class="c_title">
          <img src="../../assets/v2_img/v2-5.png" alt />
          <p>10元专区三选一</p>
          <img src="../../assets/v2_img/v2-5.png" alt />
        </div>
        <!-- :finished-text="finishedText" -->
        <van-list
          v-model="loading"
          :finished="finished"
          @load="onLoad"
          class="van_card_list"
        >
          <div v-for="item in cardlist" :key="item.id">
            <van-cell
              :style="{ 'background-image': 'url(' + tu1 + ')' }"
              class="ui-panel"
              v-if="
                exchange_status == 1 &&
                  item.dispense_limit_day > 0 &&
                  Number(item.today_total_sold) < Number(number)
              "
              @click="goListDetails(item)"
            >
              <div class="img_text flex">
                <div class="img">
                  <img :src="item.image" alt />
                </div>
                <div class="text">{{ item.name }}</div>
              </div>
            </van-cell>
            <van-cell
              :style="{ 'background-image': 'url(' + tu2 + ')' }"
              class="ui-panel"
              v-if="
                exchange_status == 0 ||
                  item.dispense_limit_day == 0 ||
                  Number(item.today_total_sold) >= Number(number)
              "
              @click="$toast('您已参与，不可重复参与')"
            >
              <div class="img_text flex">
                <div class="img">
                  <img :src="item.image" alt />
                </div>
                <div class="text">{{ item.name }}</div>
              </div>
            </van-cell>
          </div>
        </van-list>
      </div>
      <div class="card_wrap" v-for="items in quanyiList" :key="items.id">
        <div class="c_title">
          <img src="../../assets/v2_img/v2-5.png" alt />
          <p>{{ items.title }}</p>
          <img src="../../assets/v2_img/v2-5.png" alt />
        </div>
        <div class="quanyi_box">
          <!-- :href="item.link_url"  -->
          <a
            class="qy_item"
            v-for="item in items.quanyi"
            :key="item.id"
            @click="quanyiJump(item.id)"
          >
            <img :src="item.pic" alt />
            <p>{{ item.title.slice(0, 5) }}</p>
            <span>{{ item.discount.slice(0, 6) }}</span>
          </a>
        </div>
      </div>
    </div>
    <van-grid clickable :column-num="2" class="footer_fixed">
      <van-grid-item
        :icon="url1"
        text="本期兑换"
        to="/v2/index"
        class="v2_active_icon"
      />
      <van-grid-item :icon="url2" text="我的" @click="linkMy" />
    </van-grid>
  </div>
  <div class="end_text" v-else>活动已结束</div>
</template>

<script>
import { aes_encryptObject } from "@/api/encryption";
export default {
  name: "cardList",
  data() {
    return {
      activeId: "",
      url1: require("../../assets/v2_img/v2-3.png"),
      url2: require("../../assets/my.png"),
      bgUrl: "",
      tu1: "",
      tu2: "",
      cardlist: [],
      exchange_status: "",
      page: 1,
      finishedText: "",
      loading: false,
      finished: false,
      number: "",
      is_end: false,
      is_package_background: "",
      quanyiList: ""
    };
  },
  created() {
    this.activeId = this.$store.state.activeId;
    let activityData = aes_encryptObject({ activity_id: this.activeId });
    this.$http
      .get("/exchanges/get-activity", { params: activityData })
      .then(res => {
        if (res.data.code == 0) {
          document.title = res.data.data.page_title;
          this.is_package_background = res.data.data.is_package_background;
          this.bgUrl = res.data.data.package_background_image1;
          this.tu1 = res.data.data.package_background_image2;
          this.tu2 = res.data.data.package_background_image3;
          sessionStorage.setItem("pay_title", res.data.data.pay_title);
          sessionStorage.setItem("pageTitle", res.data.data.page_title);
          sessionStorage.setItem("logoUrl", res.data.data.logo);
          sessionStorage.setItem("bgImg", res.data.data.background_image);
          this.number = res.data.data.exchange_limit_day;
          sessionStorage.setItem("number", this.number);
          sessionStorage.setItem(
            "card_error_tips",
            res.data.data.card_error_tips
          );
          let textData = {
            is_customer_service: res.data.data.is_customer_service,
            customer_title: res.data.data.customer_title,
            customer_service_url: res.data.data.customer_service_url,
            is_tel_consultation: res.data.data.is_tel_consultation,
            tel_title: res.data.data.tel_title,
            tel_consultation_info: res.data.data.tel_consultation_info,
            is_technol_explain: res.data.data.is_technol_explain,
            technol_logo: res.data.data.technol_logo,
            technol_title: res.data.data.technol_title
          };
          sessionStorage.setItem("tel_info", JSON.stringify(textData));
          let endtime = Math.round(new Date().getTime() / 1000);
          if (endtime > res.data.data.end_time || res.data.data.status == 0) {
            this.is_end = true;
          } else {
            //判断是否自动登录
            let currToken = localStorage.getItem(
              "localStorageToken_" + this.activeId
            );
            if (currToken) {
              sessionStorage.setItem("token", currToken);
              let myData1 = aes_encryptObject({
                activity_id: this.activeId,
                token: currToken
              });
              this.$http
                .post("/v2/users/login", myData1)
                .then(res => {
                  if (res.data.code == 0) {
                    this.loading = false;
                    sessionStorage.setItem("token", res.data.data.token);
                    localStorage.setItem(
                      "localStorageToken_" + this.activeId,
                      res.data.data.token
                    );
                    let that = this;
                    setTimeout(function () {
                      that.$router.replace({
                        path: "/v2/index"
                      });
                    }, 500);
                  } else {
                    if (res.data.code == 220018) this.is_end = true;
                    else this.$toast(res.data.msg);
                  }
                })
                .catch(e => {
                  console.log(e);
                });
            }
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
    this.getQuanYi();
  },
  methods: {
    getQuanYi() {
      let data = aes_encryptObject({
        activity_id: this.activeId
      });
      this.$http
        .get("/v2/exchanges/quanyi-list", { params: data })
        .then(res => {
          if (res.data.code == 0) {
            this.quanyiList = res.data.data;
          } else {
            this.$toast(res.data.msg);
          }
        })
        .catch(e => {
          console.log(e);
        });
    },
    quanyiJump(qyId) {
      let data = aes_encryptObject({
        activity_id: this.activeId,
        id: qyId,
        version: "v2"
      });
      this.$http
        .get("/v2/exchanges/quanyi-jump", { params: data })
        .then(res => {
          if (res.data.code == 0) {
            window.location.href = res.data.data.url;
          } else {
            this.$toast(res.data.msg);
          }
        })
        .catch(e => {
          console.log(e);
        });
    },
    linkMy() {
      let data = aes_encryptObject({
        activity_id: this.activeId,
        flag: "my",
        version: "v2"
      });
      this.$router.push({ path: "/My", query: data });
    },
    goListDetails(data) {
      let myData = aes_encryptObject({
        activity_id: this.activeId,
        package_id: data.id,
        version: "v2"
      });
      this.$http
        .post("/v2/users/get-activity-status", myData)
        .then(res => {
          if (res.data.code == 0) {
            if (res.data.data.is_activity == 0) {
              this.$router.push({
                path: "/v2/activation"
              });
            } else {
              this.$router.push({
                path: "/v2/cardDetails",
                query: myData
              });
            }
          } else {
            if (res.data.code == "200004") {
              this.$router.push({
                path:'/v2/login',
                query: myData
              });
            }
            this.$toast(res.data.msg);
          }
        })
        .catch(e => {
          console.log(e);
        });
    },
    onLoad() {
      this.loading = true;
      let myData = aes_encryptObject({
        activity_id: this.activeId,
        page: this.page,
        limit: 3
      });
      this.$http
        .get("/v2/exchanges/package-list", { params: myData })
        .then(res => {
          if (res.data.code == 0) {
            this.exchange_status = res.data.exchange_status; //是否可以兑换状态 0：不可兑换 1：可兑换
            let that = this;
            // setTimeout(function() {
            if (that.cardlist.length > 0 && res.data.page == 1) {
              return false;
            }
            that.cardlist = [...that.cardlist, ...res.data.data];
            // 如果总页数大于当前页码，页码+1
            if (res.data.pageCount > that.page) {
              that.page++;
            } else {
              that.finished = true;
              that.finishedText = "没有更多了";
            }
            if (that.cardlist.length == 0) {
              that.finishedText = "暂无数据";
            }
            that.loading = false;
            // }, 500);
          } else {
            this.loading = false;
            this.finished = true;
            this.$toast(res.data.msg);
          }
        })
        .catch(e => {
          this.loading = false;
          this.finished = true;
          console.log(e);
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.end_text {
  padding-top: 50%;
  font-size: 40px;
  color: red;
}
.quanyi_box {
  text-align: left;
  .qy_item {
    display: inline-block;
    width: 25%;
    text-align: center;
    margin-bottom: 16px;
    img {
      width: 84px;
      height: 84px;
      border-radius: 50%;
    }
    p {
      font-weight: 600;
      margin: 0;
      color: #333;
    }
    span {
      font-size: 22px;
      color: #a0a0a0;
    }
  }
}
.bg_box {
  width: 100%;
  background-size: 100%;
  background-repeat: no-repeat;
  padding-top: 34%;
  min-height: 100vh;
  padding-bottom: 20vw;
  box-sizing: border-box;
  .act_card {
    max-height: 77.47vw;
    overflow-y: auto;
  }
  .card_wrap {
    background: #ffffff;
    border-radius: 10px;
    padding: 30px 20px;
    margin: 0 20px 10px 20px;
    .c_title {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 30px;
      p {
        margin: 0 10px;
        font-weight: 600;
        font-size: 32px;
      }
      img {
        width: 64px;
        height: 24px;
      }
    }
  }
  .van_card_list {
    & > div + div {
      margin-top: 10px;
    }
    .van-cell:not(:last-child)::after {
      border: 0px;
    }
    .ui-panel {
      width: 90%;
      margin: 0 auto;
      background-color: transparent;
      background-size: 100%;
      background-repeat: no-repeat;
      padding: 0;
      width: 100%;
      height: 166px;
      .img_text .text {
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 30px;
        color: #fff;
        margin-left: 80px;
        font-size: 30px;
        font-weight: 600;
        width: 62%;
      }
      .img_text {
        margin-left: 52px;
        .img {
          width: 86px;
          height: 86px;
        }
        img {
          width: 86px;
          height: 86px;
          border-radius: 50%;
        }
      }
    }
  }
}
.cardList.ui-cardlist {
  .ui-panel {
    .img_text {
      width: 75%;
    }
  }
}
</style>
