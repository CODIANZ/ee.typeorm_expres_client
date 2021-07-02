<template>
  <List :entity="m.entity" />
</template>

<script lang="ts">
import { defineComponent, reactive } from "@vue/composition-api";

export default defineComponent({
  setup() {
    const m = reactive({
      entity: "User"
    });
    return { m };
  },
  components: {
    List: () => import("../components/List.vue")
  }
});
</script>
