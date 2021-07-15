<template>
  <v-app v-show="m.signedIn">
    <AppBar :permissions.sync="m.permissions" :account.sync="m.account" />
    <router-view :permissions.sync="m.permissions" :account.sync="m.account" />
  </v-app>
</template>

<script lang="ts">
import { AccountInfo } from "@azure/msal-browser";
import { defineComponent, reactive, watch } from "@vue/composition-api";
import { Application } from "./Application";
import { AzureADPermissions } from "./@types/azureADPermissions";

export default defineComponent({
  setup() {
    const m = reactive({
      signedIn: false,
      account: undefined as AccountInfo | undefined,
      permissions: {} as AzureADPermissions
    });
    const signOut = () => {
      m.signedIn = false;
    };
    const signIn = Application.Instance.Auth.signIn().then((resp) => {
      if (resp) {
        m.signedIn = true;
        m.account = resp;
        const idToken: any = m.account.idTokenClaims;
        m.permissions.ReadAccount = idToken.extension_ReadAccount;
        m.permissions.WriteAccount = idToken.extension_WriteAccount;
        m.permissions.ReadBook = idToken.extension_ReadBook;
        m.permissions.WriteBook = idToken.extension_WriteBook;
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
