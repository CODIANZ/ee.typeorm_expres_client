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
        <v-list-item @click="onClickLogout()">
          <v-list-item-icon>
            <v-icon>{{ m.logout.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ m.logout.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import vue from "vue";
import {
  defineComponent,
  onMounted,
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
      logout: {} as Item,
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
    m.logout = {
      icon: "mdi-logout",
      title: "ログアウト",
      path: "/signout"
    };

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
    };

    watch(
      () => [props.permissions, props.account],
      () => {
        vue.nextTick(() => {
          updateItems();
        });
      }
    );

    onMounted(() => {
      updateItems();
    });

    return {
      m,
      onItemClick(item: Item) {
        m.title = item.title;
        m.path = item.path;
        m.drawer = false;
        if (router.currentRoute.path != item.path) router.replace(item.path);
      },
      onClickLogout() {
        Application.Instance.Auth.signOut();
        context.emit("signOut");
      }
    };
  }
});
</script>
