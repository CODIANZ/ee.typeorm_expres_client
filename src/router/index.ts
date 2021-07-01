import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    redirect: "/user"
  },
  {
    name: "list",
    path: "/:model",
    component: () => import("../views/List.vue")
  }
];

const router = new VueRouter({
  mode: "hash",
  routes
});

export default router;
