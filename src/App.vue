<template>
  <v-app>
    <List />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  setup() {},
  components: {
    List: () => import("./components/List.vue")
  }
});
</script>
