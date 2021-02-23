<template>
  <div>
    <div v-if="!is_end" :style="is_package_background == 1 ? { background: '#4862f2' } : { background: 'none' }" class="v3_tel">
      <div class="cardList ui-cardlist" v-if="is_package_background == 0">
        <van-list
          v-model="loading"
          :finished="finished"
          :finished-text="finishedText"
          @load="onLoad"
        >
          <van-cell
            class="card_item ui-panel"
            v-for="item in cardlist"
            :key="item.id"
            @click="goListDetails(item)"
          >
            <div class="img_text flex">
              <img :src="item.image" alt />
              <div class="text">
                <p class="title">{{ item.name }}</p>
                <p class="text-7f-color">
                  剩余：{{ item.dispense_limit_day }}张
                </p>
              </div>
            </div>
            <div class="btn-box">
              <van-button
                round
                :style="{ background: theme_color, color: '#fff' }"
                class="btn-style1"
                v-if="
                  exchange_status == 1 &&
                    item.dispense_limit_day > 0 &&
                    Number(item.today_total_sold) < Number(number)
                "
                >领取</van-button
              >
              <van-button
                round
                class="btn-style1"
                disabled
                v-if="
                  exchange_status == 0 ||
                    item.dispense_limit_day == 0 ||
                    Number(item.today_total_sold) >= Number(number)
                "
                >已售磬</van-button
              >
            </div>
          </van-cell>
        </van-list>
        <div class="a_link" v-if="apply_card_status == 1">
          <a :href="apply_card_url">{{ apply_card_text }}</a>
        </div>
      </div>
      <div class="bg_box" :style="{ 'background-image': 'url(' + bgUrl + ')' }" v-if="is_package_background == 1">
        <van-list
          v-model="loading"
          :finished="finished"
          :finished-text="finishedText"
          @load="onLoad"
          class="van_card_list"
        >
          <div v-for="item in cardlist" :key="item.id">
            <van-cell
              class="card_item ui-panel"
              @click="goListDetails(item)"
              v-if="
                exchange_status == 1 &&
                  item.dispense_limit_day > 0 &&
                  Number(item.today_total_sold) < Number(number)
              "
              :style="{ 'background-image': 'url(' + tu1 + ')' }"
            >
              <div class="img_text flex">
                <div>
                  <img :src="item.image" alt />
                </div>
                <div class="text">
                  <p class="title">{{ item.name }}</p>
                  <p class="text-7f-color">
                    剩余：{{ item.dispense_limit_day }}张
                  </p>
                </div>
              </div>
            </van-cell>
            <van-cell
              class="card_item ui-panel"
              v-if="
                exchange_status == 0 ||
                  item.dispense_limit_day == 0 ||
                  Number(item.today_total_sold) >= Number(number)
              "
              :style="{ 'background-image': 'url(' + tu2 + ')' }"
              @click="goListDetails(item)"
            >
              <div class="img_text flex">
                <div>
                  <img :src="item.image" alt />
                </div>
                <div class="text">
                  <p class="title">{{ item.name }}</p>
                  <p class="text-7f-color">
                    剩余：{{ item.dispense_limit_day }}张
                  </p>
                </div>
              </div>
            </van-cell>
          </div>
        </van-list>
        <div class="a_link" v-if="apply_card_status == 1">
          <a :href="apply_card_url">{{ apply_card_text }}</a>
        </div>
      </div>
      <div
        class="fixed-box"
        @click="showPopup"
        v-if="activity_rules_status == 1"
      >
        活动规则
      </div>
      <van-popup
        v-model="show"
        closeable
        close-icon-position="top-right"
        class="ui-popup"
      >
        <div>活动规则</div>
        <p v-html="activity_rules_text" class="p_rules_text"></p>
      </van-popup>
      <van-grid clickable :column-num="2" class="footer_fixed">
        <van-grid-item to="/v3/index" :style="{ color: theme_color }">
          <i class="dhicon dhicon-cardlist"></i>
          <span>本期兑换</span>
        </van-grid-item>
        <van-grid-item icon="dhicon dhicon-my" @click="linkMy">
          <i class="dhicon dhicon-my"></i>
          <span>我的</span>
        </van-grid-item>
      </van-grid>
    </div>
    <div class="end_text" v-if="is_end">{{end_text}}</div>
  </div>
</template>

<script>
import { aes_encryptObject } from "@/api/encryption";
export default {
  name: "cardList",
  data() {
    return {
      activeId: "",
      url1: require("../../assets/list_cur.png"),
      url2: require("../../assets/my.png"),
      bgUrl: "",
      tu1: "",
      tu2: "",
      cardlist: [],
      page: 1,
      loading: false,
      finished: true,
      finishedText: "",
      number: "",   //每日兑换数量限制
      is_end: false,
      is_package_background: "",
      show: false,
      activity_rules_text: '',
      activity_rules_status: '',
      apply_card_url: ' ',
      apply_card_status: '',
      theme_color: "",
      exchange_status: '',
      end_text:'活动已结束'
    };
  },
  created() {
    this.activeId = this.$store.state.activeId
    let activityData = aes_encryptObject({ activity_id: this.activeId });
    this.$http
      .get("/exchanges/get-activity", { params: activityData })
      .then(res => {
        if (res.data.code == 0) {
          let activity_info =  res.data.data;
          document.title = activity_info.page_title;
          this.activity_rules_status = activity_info.activity_rules_status;
          this.activity_rules_text = activity_info.activity_rules_text;
          this.apply_card_status = activity_info.apply_card_status;
          this.apply_card_url = activity_info.apply_card_url;
          this.is_package_background =  activity_info.is_package_background;
          this.bgUrl = activity_info.package_background_image1;
          this.tu1 =activity_info.package_background_image2;
          this.tu2 =activity_info.package_background_image3;
          this.number = activity_info.exchange_limit_day;
          this.theme_color = activity_info.color;
          localStorage.setItem("pageTitle_" + this.activeId, activity_info.page_title);
          localStorage.setItem("number",this.number);
          localStorage.setItem("theme_color", activity_info.color);
          localStorage.setItem("bgImg", activity_info.background_image);
          this.apply_card_text = activity_info.apply_card_text;
          let endtime = Math.round(new Date().getTime() / 1000);
          if (endtime > activity_info.end_time || activity_info.status == 0) {
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
                .post("/v3/users/login", myData1)
                .then(res => {
                  this.finished = false
                  if (res.data.code == 0) {
                    sessionStorage.setItem("token", res.data.data.token);
                    localStorage.setItem(
                      "localStorageToken_" + this.activeId,
                      res.data.data.token
                    );
                    setTimeout(()=> {
                      this.$router.replace({
                        path: "/v3/index"
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
            } else {
              this.finished = false
            }
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  },
  methods: {
    linkMy() {
      let data = aes_encryptObject({
        activity_id: this.activeId,
        flag: "my",
        version: 'v3'
      });
      this.$router.push({ path: "/v3/My", query: data });
    },
    showPopup() {
      this.show = true;
    },
    goListDetails(data) {
      let myData = aes_encryptObject({
        activity_id: data.activity_id,
        package_id: data.id,
        version: 'v3'
      });
      let cur_token = localStorage.getItem(
        "localStorageToken_" + this.activeId
      );
      if (cur_token) {
        this.$router.push({ path: "/v3/CardDetails", query: myData });
      } else {
        // this.$toast("请先登录");
        this.$router.push({ path: "/v3/login", query: myData });
      }
    },
    onLoad() {
      let myData = aes_encryptObject({
        activity_id: this.activeId,
        page: this.page,
        limit: 5
      });
      this.$http
        .get("/v3/exchanges/package-list", { params: myData })
        .then(res => {
          if (res.data.code == 0) {
            this.exchange_status = res.data.exchange_status; //是否可以兑换状态 0：不可兑换 1：可兑换
            // setTimeout(function () {
            this.cardlist = [...this.cardlist, ...res.data.data];
            // 如果总页数大于当前页码，页码+1
            if (res.data.pageCount > this.page) {
              this.page++;
            } else {
              this.finished = true;
            }
            if (this.cardlist.length == 0) {
              this.finishedText = "暂无数据";
            }
            this.loading = false;
            // }, 500);
          }else if(res.data.code == 220022){
            this.loading = false;
            this.finished = true;
          } else {
            this.loading = false;
            this.finished = true;
            if (res.data.code == 220018) this.end_text = res.data.msg;this.is_end = true;
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
.a_link {
  padding: 0 10px;
  a {
    color: #ffd05d;
    text-decoration: underline;
    font-size: 28px;
  }
}
.ui-popup {
  width: 80%;
  padding: 30px 40px;
  box-sizing: border-box;
  border-radius: 10px;
  height: 60%;
  overflow: hidden;
  div {
    font-size: 32px;
  }
  p.p_rules_text {
    font-size: 28px;
    text-align: left;
    margin-top: 40px;
    height: 88%;
    overflow-y: auto;
  }
}
.fixed-box {
  position: fixed;
  width: 159px;
  height: 55px;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  border-radius: 28px 0 0 28px;
  right: -10px;
  top: 50px;
  line-height: 55px;
}
.end_text {
  padding-top: 50%;
  font-size: 40px;
  color: red;
}
.bg_box {
  height: 100%;
  background-size: 100%;
  background-repeat: no-repeat;
  box-sizing: border-box;
  min-height: 100vh;
  padding-bottom: 20vw;
  .van_card_list {
    width: 100%;
    padding-top: 82%;
    padding-bottom: 5vw;
    box-sizing: border-box;
    height: 100%;
    & > div + div {
      margin-top: 10px;
    }
    .van-cell:not(:last-child)::after {
      border: 0px;
    }
    .ui-panel {
      width: 100%;
      margin: 0 auto;
      background-color: transparent;
      background-size: 100%;
      background-repeat: no-repeat;
      // padding: 3.4vw 2.67vw;
      height: 194px;
      box-sizing: border-box;
      .van-cell__value {
        height: 100%;
        box-sizing: border-box;
      }
      .img_text .text {
        p {
          margin: 0;
        }
        .title {
          text-overflow: -o-ellipsis-lastline;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 40px;
          font-size: 28px;
          color: #fff;
          font-weight: 700;
        }
        .text-7f-color {
          margin-top: 20px;
          color: #aab4ff;
          font-size: 0.64rem;
        }
      }
      .img_text img {
        width: 88px;
        height: 88px;
        background: #ffffff;
        border: 3px solid #b8c2ff;
        border-radius: 10px;
        box-shadow: 4px 6px 16px 0px rgba(23, 33, 110, 0.81);
      }
    }
  }
}
.bg_box {
  .ui-panel {
    .img_text {
      max-width: 58%;
      margin-left: 50px;
      img {
        margin-right: 50px;
      }
    }
  }
}

.cardList.ui-cardlist {
  padding-bottom: 20vw;
  .van-list {
    margin-bottom: 5vw;
  }
  .ui-panel {
    .img_text {
      width: 75%;
    }
  }
}
</style>
