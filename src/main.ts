import Vue from "vue";
import App from "./App.vue";
import VueCompositionApi from "@vue/composition-api";
import axios from "axios";
import VueAxios from "vue-axios";
import vuetify from "./plugins/vuetify";
import "@babel/polyfill";

Vue.use(VueCompositionApi, axios, VueAxios);
Vue.config.productionTip = false;
Vue.config.devtools = true;

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
