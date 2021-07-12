import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    redirect: "/signup"
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
  },
  {
    name: "signup",
    path: "/signup",
    component: () => import("../views/SignUp.vue"),
    props: true
  }
];

const router = new VueRouter({
  mode: "hash",
  routes
});

export default router;
