import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueCompositionApi from "@vue/composition-api";
import axios from "axios";
import VueAxios from "vue-axios";
import vuetify from "./plugins/vuetify";
import "@mdi/font/css/materialdesignicons.css";
import "@babel/polyfill";

Vue.use(VueCompositionApi, axios, VueAxios);
Vue.config.productionTip = false;
Vue.config.devtools = true;

new Vue({
  router,
  vuetify,
  render: (h) => h(App)
}).$mount("#app");
