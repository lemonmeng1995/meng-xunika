<template>
  <div class="my_card ui-cardlist">
    <ul class="tab_box">
      <li
        :class="cur == i ? 'active' : ''"
        v-for="(item, i) in statusList"
        :key="item.id"
        @click="cliclk_li(i, item.id)"
      >
        <a>{{ item.name }}</a>
      </li>
    </ul>
    <div style="max-height:88vh;overflow: auto;">
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="finishedText"
      @load="onLoad"
    >
      <van-cell
        class="card_item ui-panel"
        v-for="item in myCardList"
        :key="item.out_trade_no"
        @click="getOrderDetails(item)"
      >
        <div class="img_text flex">
          <img :src="item.image" alt />
          <div class="text">
            <p class="title">{{ item.name }}</p>
            <p class="text-7f-color">{{ item.status == 3 ? item.expiry_time:item.created_at }}</p>
          </div>
        </div>
        <div class="r_box">
          <img src="../../assets/tuikuan.png" alt="" v-show="item.status == 2" />
          <img src="../../assets/guoqi.png" alt="" v-show="item.status == 3" />
        </div>
      </van-cell>
    </van-list>
    </div>
   
     <div class="ui-empty" v-show="show">
      <img src="../../assets/zwsj.png" alt="" />
      <p>暂无数据</p>
    </div>
    <van-grid clickable :column-num="2" class="footer_fixed">
      <van-grid-item @click="linkList">
        <i class="dhicon dhicon-cardlist"></i>
        <span>本期兑换</span>
      </van-grid-item>
      <van-grid-item to="/v3/My" :style="{ color: theme_color }">
        <i class="dhicon dhicon-my"></i>
        <span>我的</span>
      </van-grid-item>
    </van-grid>
  </div>
</template>

<script>
import { aes_encryptObject, parseTime, getrq } from "@/api/encryption";
export default {
  data() {
    return {
      url1: require("../../assets/list.png"),
      url2: require("../../assets/cur_my.png"),
      v2Url2: require("../../assets/v2_img/v2-4.png"),
      loading: false,
      finished: true,
      page: 1,
      limit: 5,
      myCardList: [],
      activeId: "",
      link_cardList: "",
      version: "",
      theme_color: localStorage.getItem('theme_color'),
      cur: 0,
      id: 1,
      statusList: [{ id: 1, name: '未过期' }, { id: 3, name: '已过期' }, { id: 2, name: '已退款' }],
      show: false,
      finishedText: '没有更多了'
    };
  },
  created() {
    this.activeId = this.$store.state.activeId;
    let cur_token = localStorage.getItem(
      "localStorageToken_" + this.activeId
    );
    if (cur_token) {
      sessionStorage.setItem("token", cur_token);
    }
    this.finished = false;
  },
  mounted() {
    this.$toast.setDefaultOptions({ duration: 3500 });
    this.version = getrq(this.$route.query.rq).version;
    let return_code = getrq(this.$route.query.rq).return_code;
    if (return_code == 220009) {
      this.$toast("此订单已经处理成功");
    } else if (return_code == 220010) {
      let msg = localStorage.getItem("card_error_tips");
      this.$toast(msg);
    } else if (return_code == 220011) {
      this.$toast("此订单已退款");
    } else if (return_code == 220012) {
      this.$toast("已退款");
    } else if (return_code == 220013) {
      this.$toast("付款失败");
    } else if (return_code == 220014) {
      this.$toast("订单超时或已关闭");
    } else {
      return;
    }
  },
  methods: {
    linkList() {
      let data = aes_encryptObject({
        activity_id: this.activeId,
        version: 'v3'
      });
      this.$router.push({ path: "/v3/index", query: data });
    },
    getOrderDetails(item) {
      if (item.status == 1) {
        let data = aes_encryptObject({
          activity_id: this.activeId,
          out_trade_no: item.out_trade_no,
          version:'v3'
        });
        if (item.code_link != "" && item.code_link != null) {
          window.location.href = item.code_link;
        } else {
          this.$router.push({ path: "/v3/QRcode", query: data });
        }
      } else if (item.status == 2) {
        this.$dialog
          .alert({
            className: "text-dialog",
            message: "下单失败，支付金额已原路退还，请重试"
          })
          .then(() => { });
      } else {
        this.$toast({
          duration: 1000,
          message: "券码已过期"
        });
      }
    },
    onLoad() {
      let myData = aes_encryptObject({
        activity_id: this.activeId,
        status: this.id,
        page: this.page,
        limit: this.limit
      });
      this.$http
        .get("/exchanges/order-list", { params: myData })
        .then(res => {
          if (res.data.code == 0) {
            res.data.data.forEach(e => {
              if(e.status == 1){
                e.created_at = `兑换日期：${parseTime(e.created_at,'{y}-{m}-{d}')}`;
              }else if(e.status == 3){
                e.expiry_time = `已过期：${parseTime(e.expiry_time,'{y}-{m}-{d}')}`;
              }else{
                e.created_at = `已退款：${parseTime(e.created_at)}`;
              }
            });
            // setTimeout(() => {
              this.myCardList = [...this.myCardList, ...res.data.data];
              // 如果总页数大于当前页码，页码+1
              if (res.data.pageCount > this.page) {
                this.page++;
              } else {
                this.finished = true;
                this.finishedText = "没有更多了"
                if (this.myCardList.length == 0) {
                  this.show = true;
                  this.finishedText = ""
                }
              }
              this.loading = false;
            // },0);
          }else if(res.data.code ==220022){
              this.loading = false;
              this.finished = true;
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
    },
    cliclk_li(i, id) {
      this.myCardList = [];
      this.id = id;
      this.page = 1
      this.show = false;
      this.cur = i
      this.loading = true;
      this.finished = false;
      this.onLoad()
    }
  }
};
</script>

<style lang="scss" scoped>
.ui-empty {
  margin-top: 30%;
  img {
    width: 220px;
    height: 180px;
  }
  p {
    color: #999;
    font-size: 30px;
  }
}
.my_card.ui-cardlist {
  .van-list{
    margin-top:104px;
  }
    .tab_box {
    position: fixed;
    width: 94.5%;
    top: 28px;
    left: 22px;
    z-index: 100;
    height: 104px;
    display: flex;
    border-radius: 3.2vw 3.2vw 0px 0px;
    background: #fff;
    border-bottom: 1px solid #f4f4f4;
    li.active {
      a {
        border-bottom: 4px solid #333;
        color: #333;
      }
    }
    li {
      flex: 1;
      text-align: center;
      height: 100%;
      a {
        font-size: 28px;
        color: #999;
        font-weight: bold;
        display: inline-block;
        height: 96%;
        line-height: 104px;
      }
    }
  }
  .card_item:first-child {
    border-radius: 0;
  }
  .text-fff {
    color: #fff;
  }
  .ui-panel {
    .img_text {
      // width: 85%;
      // max-width: 88%;
      img{
        width:88px;
        height:88px
      }
    }
  }
}
</style>
