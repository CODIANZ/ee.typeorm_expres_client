<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  setup() {},
  components: { AppBar: () => import("./components/AppBar.vue") }
});
</script>
