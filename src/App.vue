<template>
  <v-app v-show="m.signedIn">
    <AppBar />
    <router-view :account="m.account" />
  </v-app>
</template>

<script lang="ts">
import { AccountInfo } from "@azure/msal-browser";
import { defineComponent, reactive, watch } from "@vue/composition-api";
import { Application } from "./AzureClientAuth";

export default defineComponent({
  setup() {
    const m = reactive({
      signedIn: false,
      account: undefined as AccountInfo | undefined
    });
    const signOut = () => {
      m.signedIn = false;
    };
    const signIn = Application.Instance.Auth.signIn().then((resp) => {
      if (resp) {
        m.signedIn = true;
        m.account = resp;
      }
    });
    watch(
      () => m.signedIn,
      () => {
        if (!m.signedIn) signIn;
      }
    );
    return { m };
  },
  components: { AppBar: () => import("./components/AppBar.vue") }
});
</script>
