<template>
  <div>
    <v-app-bar app elevate-on-scroll>
      <v-app-bar-nav-icon @click="m.drawer = !m.drawer"></v-app-bar-nav-icon>
      <v-toolbar-title> {{ m.title }} </v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="m.drawer" app>
      <v-list nav dense>
        <v-list-item
          v-for="item in m.items"
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
import vue from "vue";
import {
  defineComponent,
  onUnmounted,
  reactive,
  watch
} from "@vue/composition-api";
import { Application } from "../Application";
import router from "@/router";
import * as rx from "@codianz/rx";
import * as loglike from "@codianz/loglike";
import { AccountInfo } from "@azure/msal-browser";
import { AzureADPermissions } from "@/@types/azureADPermissions";
const log = loglike.Null;
type Item = {
  icon: string;
  title: string;
  path: string;
};

export default defineComponent({
  props: {
    account: {
      type: Object as () => AccountInfo
    },
    permissions: {
      type: Object as () => AzureADPermissions
    }
  },
  setup(props, context) {
    const m = reactive({
      items: [] as Item[],
      drawer: false,
      title: "ユーザー",
      dateTime: "",
      path: ""
    });

    const sg = new rx.SubscriptionGroup(log);
    onUnmounted(() => {
      sg.unsubscribeAll();
    });
    m.items = [
      {
        icon: "mdi-account",
        title: "ユーザー",
        path: "/user"
      },
      {
        icon: "mdi-account-check",
        title: "権限",
        path: "/role"
      }
    ];

    const updateItems = () => {
      if (props.permissions!.ReadBook) {
        m.items.push({
          icon: "mdi-book-open-variant",
          title: "本",
          path: "/book"
        });
      }
      if (props.permissions!.ReadAccount) {
        m.items.push({
          icon: "mdi-account-multiple-plus",
          title: "登録",
          path: "/signup"
        });
      }
      m.items.push({
        icon: "mdi-logout",
        title: "ログアウト",
        path: "/signout"
      });
    };

    watch(
      () => [props.permissions, props.account],
      () => {
        vue.nextTick(() => {
          updateItems();
        });
      }
    );

    return {
      m,
      onItemClick(item: Item) {
        if (item.path == "/signout") {
          Application.Instance.Auth.signOut();
          context.emit("signOut");
        } else {
          m.title = item.title;
          m.path = item.path;
          m.drawer = false;
          if (router.currentRoute.path != item.path) router.replace(item.path);
        }
      }
    };
  }
});
</script>
