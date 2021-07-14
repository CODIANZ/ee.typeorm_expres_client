<template>
  <List entity="Book" :editedItem="m.editedItem" @setItem="setItem">
    <template v-slot:editor>
      <v-col cols="12" sm="6" md="4">
        <ValidationProvider
          v-slot="{ errors }"
          name="title"
          :rules="m.editedRules.title"
        >
          <v-text-field
            v-model="m.editedItem.title"
            label="title"
            :error-messages="errors"
          >
          </v-text-field>
        </ValidationProvider>
        <ValidationProvider
          v-slot="{ errors }"
          name="author"
          :rules="m.editedRules.author"
        >
          <v-text-field
            v-model="m.editedItem.author"
            label="author"
            :error-messages="errors"
          >
          </v-text-field>
        </ValidationProvider>
        <ValidationProvider
          v-slot="{ errors }"
          name="publish_at"
          :rules="m.editedRules.publish_at"
        >
          <v-date-picker
            v-model="m.editedItem.publish_at"
            :error="errors"
          ></v-date-picker>
        </ValidationProvider>
      </v-col>
    </template>
  </List>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from "@vue/composition-api";
import * as listinfo from "../components/ListInfo";

type Item = { id?: string; publish_at: string };

export default defineComponent({
  setup(props, context) {
    const m = reactive({
      editedRules: {} as any,
      editedItem: {} as Item
    });
    listinfo.ListDescriptions["Book"]
      .headers()
      .forEach((x: listinfo.ExtendedDataTableHeader) => {
        if (x.rules) m.editedRules[x.value] = x.rules;
      });
    const setItem = (item: Item) => {
      m.editedItem = item;
      m.editedItem.publish_at! = m.editedItem.publish_at.substr(0, 10);
    };
    return { m, setItem };
  },
  components: {
    List: () => import("../components/List.vue")
  }
});
</script>
