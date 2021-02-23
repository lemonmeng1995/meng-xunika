<template>
  <div class="my_card ui-cardlist">
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
            <p class="text-7f-color">{{ item.created_at }}</p>
          </div>
        </div>
        <div class="btn-box">
          <van-button
            v-show="item.status == 1"
            round
            :type="version == 'v2' ? 'danger' : 'info'"
            class="btn-style1"
            >去使用</van-button
          >
          <van-button
            v-show="item.status == 2"
            round
            class="btn-style1"
            disabled
            >已退款</van-button
          >
          <van-button
            v-show="item.status == 3"
            round
            class="btn-style1"
            disabled
            >已失效</van-button
          >
        </div>
      </van-cell>
    </van-list>
    <van-grid clickable :column-num="2" class="footer_fixed">
      <van-grid-item :icon="url1" text="本期兑换" @click="linkList" />
      <van-grid-item
        :icon="v2Url2"
        text="我的"
        to="/My"
        class="v2_active_icon"
      />
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
      finished: false,
      page: 1,
      limit: 5,
      myCardList: [],
      activeId: "",
      finishedText: "",
      link_cardList: "",
      version: ""
    };
  },
  mounted() {
    this.pushHistory();
    window.addEventListener("popstate", this.popstateEvent, false);
    this.activeId = this.$store.state.activeId;
    this.$toast.setDefaultOptions({ duration: 3500 });
    this.version = getrq(this.$route.query.rq).version;
    let return_code = getrq(this.$route.query.rq).return_code;
    if (return_code == 220009) {
      this.$toast("此订单已经处理成功");
    } else if (return_code == 220010) {
      let msg = sessionStorage.getItem("card_error_tips");
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
  destroyed() {
    window.removeEventListener("popstate", this.popstateEvent, false);
  },
  methods: {
    popstateEvent() {
      let data = aes_encryptObject({
        activity_id: this.activeId,
        version: 'v2'
      })
      this.$router.replace({
        path: "/v2/index",
        query: data
      });
    },
    pushHistory() {
      var state1 = {
        title: "title",
        url: "#"
      };
      window.history.pushState(state1, "title", "#");
    },
    linkList() {
      let data = aes_encryptObject({
        activity_id: this.activeId
      });
      this.$router.push({ path: "/v2/index", query: data });
    },
    getOrderDetails(item) {
      if (item.status == 1) {
        let data = aes_encryptObject({
          activity_id: this.activeId,
          out_trade_no: item.out_trade_no
        });
        if (item.code_link != "" && item.code_link != null) {
          window.location.href = item.code_link;
        } else {
          this.$router.push({ path: "/QRcode", query: data });
        }
      } else if (item.status == 2) {
        this.$dialog
          .alert({
            className: "text-dialog",
            message: "您的兑换礼品兑换失败，支付金额已原路退还，请重新兑换"
          })
          .then(() => { });
      } else {
        this.$toast({
          duration: 1000,
          message: "券码已失效"
        });
      }
    },
    onLoad() {
      this.loading = true;
      let myData = aes_encryptObject({
        activity_id: this.activeId,
        page: this.page,
        limit: this.limit
      });
      this.$http
        .get("/exchanges/order-list", { params: myData })
        .then(res => {
          if (res.data.code == 0) {
            res.data.data.forEach(e => {
              e.created_at = parseTime(e.created_at);
            });
            let that = this;
            setTimeout(function () {
              that.myCardList = [...that.myCardList, ...res.data.data];
              // 如果总页数大于当前页码，页码+1
              if (res.data.pageCount > that.page) {
                that.page++;
              } else {
                that.finished = true;
                that.finishedText = "没有更多了";
              }
              if (that.myCardList.length == 0) {
                that.finishedText = "暂无数据";
              }
              that.loading = false;
            }, 500);
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
.my_card.ui-cardlist {
  .ui-panel {
    .img_text {
      width: 75%;
    }
  }
}
</style>
