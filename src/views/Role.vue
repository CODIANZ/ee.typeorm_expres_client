<template>
  <List entity="Role" :editedItem="m.editedItem" @setItem="setItem">
    <template v-slot:editor>
      <v-col cols="12" sm="6" md="4">
        <ValidationProvider
          v-slot="{ errors }"
          name="role"
          :rules="m.editedRules.role"
        >
          <v-text-field
            v-model="m.editedItem.role"
            label="role"
            :error-messages="errors"
          >
          </v-text-field>
        </ValidationProvider>
      </v-col>
    </template>
  </List>
</template>

<script lang="ts">
import { defineComponent, reactive } from "@vue/composition-api";
import * as entity from "../entity";

type Item = { id?: string };

export default defineComponent({
  setup() {
    const m = reactive({
      editableColumn: [] as string[],
      editedRules: {} as any,
      editedItem: {} as Item
    });
    m.editableColumn = entity.ListDescriptions["Role"]
      .headers()
      .filter((x: entity.ExtendedDataTableHeader) => x.editable == true)
      .map((x: entity.ExtendedDataTableHeader) => x.value);
    entity.ListDescriptions["Role"]
      .headers()
      .forEach((x: entity.ExtendedDataTableHeader) => {
        if (x.default) m.editedRules[x.value] = x.rules;
      });
    const setItem = (item: Item) => {
      m.editedItem = item;
      console.log(item);
    };

    return { m, setItem };
  },
  components: {
    List: () => import("../components/List.vue")
  }
});
</script>
