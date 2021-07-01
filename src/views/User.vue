<template>
  <List :entity="user" />
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  setup() {},
  components: {
    List: () => import("./List.vue")
  }
});
</script>
