<template>
  <div>
    <v-app-bar app elevate-on-scroll>
      <v-app-bar-nav-icon @click="m.drawer = true"></v-app-bar-nav-icon>
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
        <v-list-group
          v-if="m.mode == 'secret'"
          active-class="deep-purple--text text--accent-4"
        >
          <v-list-item
            v-for="item in items_full"
            :key="item.model"
            @click="onItemClick(item)"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<style scoped>
.date-time {
  font-family: "Courier New", Courier, monospace;
  font-size: 18px;
  font-weight: 800;
  color: #888;
}
</style>

<script lang="ts">
import { defineComponent, onUnmounted, reactive } from "@vue/composition-api";
import router from "@/router";
import * as rx from "@codianz/rx";
import * as loglike from "@codianz/loglike";
import { map } from "rxjs/operators";
import { timer } from "rxjs";
const log = loglike.Null;
type Item = {
  icon: string;
  title: string;
  path: string;
};

const items: Item[] = [
  {
    icon: "mdi-book-open-variant",
    title: "本",
    path: "/book"
  },
  {
    icon: "mdi-account",
    title: "ユーザー",
    path: "/user"
  }
];

export default defineComponent({
  setup() {
    const m = reactive({
      drawer: false,
      title: "ダッシュボード",
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
