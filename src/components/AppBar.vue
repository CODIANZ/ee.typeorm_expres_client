<template>
  <div>
    <v-app-bar app elevate-on-scroll>
      <v-app-bar-nav-icon @click="m.drawer = !m.drawer"></v-app-bar-nav-icon>
      <v-toolbar-title> {{ m.title }} </v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="m.drawer" app>
      <v-list nav dense>
        <v-list-item
          v-for="item in items"
          :key="item.model"
          @click="onItemClick(item)"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, reactive } from "@vue/composition-api";
import router from "@/router";
import * as rx from "@codianz/rx";
import * as loglike from "@codianz/loglike";
const log = loglike.Null;
type Item = {
  icon: string;
  title: string;
  path: string;
};

const items: Item[] = [
  {
    icon: "mdi-account",
    title: "ユーザー",
    path: "/user"
  },
  {
    icon: "mdi-account-check",
    title: "権限",
    path: "/role"
  },
  {
    icon: "mdi-book-open-variant",
    title: "本",
    path: "/book"
  },
  {
    icon: "mdi-account-multiple-plus",
    title: "登録",
    path: "/signup"
  }
];

export default defineComponent({
  setup() {
    const m = reactive({
      drawer: false,
      title: "ユーザー",
      dateTime: "",
      path: ""
    });

    const sg = new rx.SubscriptionGroup(log);
    onUnmounted(() => {
      sg.unsubscribeAll();
    });

    return {
      m,
      items,
      onItemClick(item: Item) {
        m.title = item.title;
        m.path = item.path;
        m.drawer = false;
        if (router.currentRoute.path != item.path) router.replace(item.path);
      }
    };
  }
});
</script>
