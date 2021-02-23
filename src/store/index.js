import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    activeId: "",
    urlrq: "",
    num:""
  },
  mutations: {
    SET_ACTIVEID: (state, id) => {
      state.activeId = id;
    },
    SET_URLRQ: (state, url) => {
      state.urlrq = url;
    }
  },
  actions: {},
  modules: {}
});
