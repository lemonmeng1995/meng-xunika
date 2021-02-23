import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import http from "./utils/http.js";
import {
  Popup,
  Button,
  Form,
  Field,
  Cell,
  CellGroup,
  Icon,
  List,
  Panel,
  Grid,
  GridItem,
  Dialog,
  CountDown,
  Toast,
  Loading,
  NumberKeyboard,
  Tag,
  Image as VanImage
} from "vant";
import "vant/lib/index.css";
import "./assets/css/common.scss";
import "./permission.js";
import VueClipboard from "vue-clipboard2";


Vue.directive('resetPage', {

  inserted: function () {

    // 监听键盘收起事件
    document.body.addEventListener('focusout', () => {

      if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {

        //软键盘收起的事件处理

        setTimeout(() => {

          const scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0

          window.scrollTo(0, Math.max(scrollHeight - 1, 0))

        }, 100)

      }

    })

  }

})

Vue.use(Icon);
Vue.use(Popup);
Vue.use(Button);
Vue.use(Form);
Vue.use(Field);
Vue.use(Cell);
Vue.use(CellGroup);
Vue.use(List);
Vue.use(Panel);
Vue.use(Grid);
Vue.use(GridItem);
Vue.use(Dialog);
Vue.use(CountDown);
Vue.use(Toast);
Vue.use(Loading);
Vue.use(Tag);
Vue.use(NumberKeyboard);
Vue.use(VueClipboard);
Vue.use(VanImage);

Vue.prototype.$http = http;
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
