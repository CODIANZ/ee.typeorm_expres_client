<template>
  <List entity="Book" />
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  setup() {},
  components: {
    List: () => import("../components/List.vue")
  }
});
</script>
