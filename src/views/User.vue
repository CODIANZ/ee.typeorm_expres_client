<template>
  <List entity="User" />
</template>

<script lang="ts">
import { defineComponent, reactive } from "@vue/composition-api";

export default defineComponent({
  setup() {},
  components: {
    List: () => import("../components/List.vue")
  }
});
</script>
