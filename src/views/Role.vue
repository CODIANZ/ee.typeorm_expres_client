<template>
  <List entity="Role" />
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
