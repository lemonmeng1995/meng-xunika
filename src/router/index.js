import Vue from "vue";
import VueRouter from "vue-router";
import V2 from './v2/index';
import V3 from './v3/index';

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter);

const V1 = [
  {
    path: "/login",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Index.vue")
  },
  {
    path: "/",
    alias: '/cardList',
    name: "CardList",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/cardList.vue")
  },
  {
    path: "/My",
    name: "My",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/My.vue")
  },
  {
    path: "/CardDetails",
    name: "CardDetails",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/cardDetails.vue")
  },
  {
    path: "/QRcode",
    name: "QRcode",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/QRcode.vue")
  },
  {
    path: "/ActivityAnnounc",
    name: "ActivityAnnounc",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/ActivityAnnounc.vue")
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import(/* webpackChunkName: "err" */ '../views/Result.vue')
  },
  {
    path: "/loading",
    name: "Loading",
    component: () =>
        import(/* webpackChunkName: "about" */ "../views/loading.vue")
  },
  {
    path: '/Err',
    name: 'Err',
    component: () => import(/* webpackChunkName: "err" */ '../views/Err.vue')
  }
];
const routes = [...V1, ...V2,...V3];
const router = new VueRouter({
  mode: "history",
  routes
});

export default router;
