import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    redirect: "/user"
  },
  {
    name: "user",
    path: "/user",
    component: () => import("../views/User.vue"),
    props: true
  },
  {
    name: "book",
    path: "/book",
    component: () => import("../views/Book.vue"),
    props: true
  },
  {
    name: "role",
    path: "/role",
    component: () => import("../views/Role.vue"),
    props: true
  }
];

const router = new VueRouter({
  mode: "hash",
  routes
});

export default router;
