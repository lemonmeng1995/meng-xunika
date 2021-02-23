<template>
  <div>
    <div v-if="!is_end">
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
               <p class="text-7f-color">剩余：{{ item.dispense_limit_day }}张</p>
              </div>
            </div>
            <div class="btn-box">
              <van-button
                round
                disabled
                class="btn-style1"
                v-if="exchange_status==0">未开始</van-button>
              <div v-else>
                <van-button
                round
                :style="{ background: theme_color, color: '#fff' }"
                class="btn-style1"
                v-if="item.dispense_limit_day > 0 &&Number(item.today_total_sold) < Number(number)">领取</van-button>
                <van-button
                round
                class="btn-style1"
                disabled
                v-if="item.dispense_limit_day == 0 || Number(item.today_total_sold) >= Number(number)">已售磬</van-button>
              </div>
            </div>
          </van-cell>
        </van-list>
      </div>
      <div class="bg_box" v-if="is_package_background == 1">
        <van-list
          v-model="loading"
          :finished="finished"
          :finished-text="finishedText"
          @load="onLoad"
          :style="{ 'background-image': 'url(' + bgUrl + ')' }"
          class="van_card_list"
        >
        
          <div v-for="item in cardlist" :key="item.id">
            <div v-if="exchange_status==0">
              <van-cell
                class="card_item ui-panel"
                :style="{ 'background-image': 'url(' + tu2 + ')' }"
                @click="goListDetails(item)"
              >
              <div class="img_text flex" style="width:100%;max-width:100%">
                <div style="width: 33.33vw;">
                  <img :src="item.image" alt />
                </div>
                <div class="text"  style="width:70%">
                  <p class="title">{{ item.name }}</p>
                  <p class="text-7f-color">剩余：{{ item.dispense_limit_day }}张</p>
                </div>
                <div class="r_status" style="width:27vw">未开始</div>
              </div>
            </van-cell>
            </div>
            <div v-else>
              <van-cell
                class="card_item ui-panel"
                @click="goListDetails(item)"
                v-if="item.dispense_limit_day > 0 && Number(item.today_total_sold) < Number(number)" :style="{ 'background-image': 'url(' + tu1 + ')' }"
              >
                <div class="img_text flex" style="max-width:95%;width:95%">
                  <div style="width: 33.33vw;">
                    <img :src="item.image" alt />
                  </div>
                  <div class="text" style="width:65%">
                    <p class="title">{{ item.name }}</p>
                  <p class="text-7f-color">剩余：{{ item.dispense_limit_day }}张</p>
                  </div>
                  <div class="r_status" style="width:16.53vw">立即<br />领取</div>
                  <!-- 每日剩余可兑换数量 > 0 && 今日所有套餐总销量 < 每日兑换数量限制 -->
                </div>
              </van-cell>
              <van-cell
                class="card_item ui-panel"
                v-if=" item.dispense_limit_day == 0 || Number(item.today_total_sold) >= Number(number)"
                :style="{ 'background-image': 'url(' + tu2 + ')' }"
                @click="goListDetails(item)"
              >
                <div class="img_text flex" style="width:100%;max-width:100%">
                  <div style="width: 33.33vw;">
                    <img :src="item.image" alt />
                  </div>
                  <div class="text"  style="width:70%">
                    <p class="title">{{ item.name }}</p>
                    <p class="text-7f-color">剩余：{{ item.dispense_limit_day }}张</p>
                    <!-- 每日剩余可兑换数量 == 0 || 今日所有套餐总销量 >= 每日兑换数量限制 -->
                  </div>
                  <div class="r_status" style="width:27vw">已售罄</div>
                </div>
              </van-cell>
            </div>
          </div>
        </van-list>
      </div>
      <van-grid clickable :column-num="2" class="footer_fixed">
        <van-grid-item to="/cardList" :style="{ color: theme_color }">
          <i class="dhicon dhicon-cardlist"></i>
          <span>本期兑换</span>
        </van-grid-item>
        <van-grid-item icon="dhicon dhicon-my" @click="linkMy">
          <i class="dhicon dhicon-my"></i>
          <span>我的</span>
        </van-grid-item>
      </van-grid>
    </div>
    <van-count-down
      v-show="show"
      :time="time"
      @finish="finish"
      ref="countDown"
      :auto-start="false"
      format="HH:mm:ss"
    ></van-count-down>
    <div class="end_text" v-if="is_end">活动已结束</div>
  </div>
</template>

<script>
import { aes_encryptObject } from "@/api/encryption";
export default {
  name: "cardList",
  data() {
    return {
      activeId: "",
      url1: require("../assets/list_cur.png"),
      url2: require("../assets/my.png"),
      bgUrl: "",
      tu1: "",
      tu2: "",
      cardlist: [],
      page: 1,
      loading: false,
      finished: true,
      finishedText: "",
      number: "", //每日兑换数量限制
      is_end: false,
      is_package_background: "",
      theme_color: '',
      exchange_status:'',    //活动开启状态 0未开启 1-已开启
      enable_mode:'',   //启用方式：1为手动，2为定时
      show:false,
      time:''
    };
  },
  created() {
    this.activeId = this.$store.state.activeId
    let activityData = aes_encryptObject({ activity_id: this.activeId });
    this.$http
      .get("/exchanges/get-activity", { params: activityData })
      .then(res => {
        if (res.data.code == 0) {
          const listData = res.data.data
          document.title = listData.page_title;
          this.is_package_background = listData.is_package_background;
          this.enable_mode = listData.enable_mode;
          this.exchange_status = listData.exchange_status;
          this.bgUrl = listData.package_background_image1;
          this.tu1 = listData.package_background_image2;
          this.tu2 = listData.package_background_image3;
          localStorage.setItem("pay_title", listData.pay_title);
          localStorage.setItem("pageTitle_" + this.activeId, listData.page_title);
          localStorage.setItem("logoUrl", listData.logo);
          localStorage.setItem("bgImg", listData.background_image);
          localStorage.setItem("theme_color", listData.color);
          localStorage.setItem("is_notice", listData.is_notice);
          this.theme_color = listData.color
          this.number = listData.exchange_limit_day;
          localStorage.setItem("number", this.number);
          localStorage.setItem(
            "card_error_tips",
            listData.card_error_tips
          );
          let textData = {
            is_customer_service: listData.is_customer_service,
            customer_title: listData.customer_title,
            customer_service_url: listData.customer_service_url,
            is_tel_consultation: listData.is_tel_consultation,
            tel_title: listData.tel_title,
            tel_consultation_info: listData.tel_consultation_info,
            is_technol_explain: listData.is_technol_explain,
            technol_logo: listData.technol_logo,
            technol_title: listData.technol_title
          };
          localStorage.setItem("tel_info", JSON.stringify(textData));
          let endtime = Math.round(new Date().getTime() / 1000);
          if(this.exchange_status == 0 && this.enable_mode == 2){
              let card_time = listData.flash_start
              let itemArr = listData.timing_week.split(',');
              let myD = new Date();
              let week = myD.getDay().toString();
              if (itemArr.indexOf(week) != -1) {
                let start_titem = new Date(`${myD.getFullYear()}/${myD.getMonth() + 1}/${myD.getDate()} ${card_time}`).getTime(); //设置活动开始时间
                let cur_time = listData.activity_start_now_time*1000; //服务器当前时间
                if (cur_time < start_titem) {
                  this.time = Math.round(start_titem - cur_time);
                  setTimeout(()=> {
                    this.$refs.countDown.start();
                  }, 500);
                }
              }
          }
          if (endtime > Number(listData.end_time) || listData.status == 0) {
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
                .post("/users/login", myData1)
                .then(res => {
                  this.finished = false;
                  if (res.data.code == 0) {
                    sessionStorage.setItem("token", res.data.data.token);
                    localStorage.setItem(
                      "localStorageToken_" + this.activeId,
                      res.data.data.token
                    );
                    setTimeout(()=> {
                      this.$router.replace({
                        path: "/"
                      });
                    }, 500);
                  }else if(res.data.code == 220022){
                    this.is_end = false;
                  } else {
                    if (res.data.code == 220018) this.is_end = true;
                    else this.$toast(res.data.msg);
                  }
                })
                .catch(e => {
                  console.log(e);
                });
            } else {
              this.finished = false;
            }
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  },
  methods: {
    finish() {
      this.exchange_status = 1;
      this.page = 1;
      this.cardlist = [];
       this.loading = true;
      this.finished = false;
      this.onLoad()
      // window.location.replace(location.protocol + '//' + location.host + '/' + this.$store.state.urlrq) 
    },
    linkMy() {
      let data = aes_encryptObject({
        activity_id: this.activeId,
        flag: "my"
      });
      this.$router.push({ path: "/My", query: data });
    },
    goListDetails(data) {
      let myData = aes_encryptObject({
        activity_id: data.activity_id,
        package_id: data.id
      });
      let cur_token = localStorage.getItem(
        "localStorageToken_" + this.activeId
      );
      let isNotice = localStorage.getItem("is_notice");
      if (isNotice == 1) {
        this.$router.push({ path: "/ActivityAnnounc", });
      }else if (cur_token) {
        this.$router.push({ path: "/CardDetails", query: myData });
      } else {
        this.$router.push({ path: "/login", query: myData });
        //注释注释原因：当开启公告，跳转到公告页面会先谈，不符合页面逻辑场景，顾不给提示
        // this.$toast("请先登录");
      }
    },
    onLoad() {
      let myData = aes_encryptObject({
        activity_id: this.activeId,
        page: this.page,
        limit: 5
      });
      this.$http
        .get("/exchanges/list", { params: myData })
        .then(res => {
          if (res.data.code == 0) {
            // setTimeout(()=> {
              this.cardlist = [...this.cardlist, ...res.data.data];
              // 如果总页数大于当前页码，页码+1
              if (res.data.pageCount > this.page) {
                this.page++;
              } else {
                this.finished = true;
                this.finishedText = "没有更多了";
              }
              if (this.cardlist.length == 0) {
                this.finishedText = "暂无数据";
              }
              this.loading = false;
            // }, 500);
          }else if(res.data.code == 220022){
            this.loading = false;
            this.finished = true;
          }else {
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
.bg_box {
  height: 100%;
  background: #1c44cf;
  box-sizing: border-box;
  .van_card_list {
    width: 100%;
    background-size: 100%;
    background-repeat: no-repeat;
    padding-top: 90.13vw;
    min-height: 100vh;
    padding-bottom: 20vw;
    box-sizing: border-box;
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
      padding: 3.4vw 2.67vw;
      .img_text {
        .r_status {
          font-size: 36px;
          line-height: 42px;
          color: #fff;
        }
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
          width: 90%;
        }
        .text-7f-color {
          margin-top: 10px;
        }
      }
      .img_text img {
        width: 140px;
        height: 140px;
        margin-left: 30px;
        margin-right: 80px;
      }
    }
  }
}
</style>
