import Vue from "vue";
import {
  configure,
  extend,
  localize,
  ValidationObserver,
  ValidationProvider
} from "vee-validate";
import { required, max, alpha, numeric, email } from "vee-validate/dist/rules";
import ja from "vee-validate/dist/locale/ja";

const config = { bails: false };
configure(config);
localize("ja", ja);
Vue.component("ValidationObserver", ValidationObserver);
Vue.component("ValidationProvider", ValidationProvider);
extend("numeric", numeric);
extend("alpha", alpha);
extend("required", required);
extend("max", max);
extend("email", email);
