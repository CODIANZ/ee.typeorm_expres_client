<template>
  <List
    entity="Role"
    :editedItem="m.editedItem"
    :permissionRead.sync="m.permissionRead"
    :permissionWrite.sync="m.permissionWrite"
    @setItem="setItem"
  >
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
import vue from "vue";
import { AccountInfo } from "@azure/msal-browser";
import { defineComponent, reactive, watch } from "@vue/composition-api";
import * as listinfo from "../components/ListInfo";

type Item = { id?: string };

export default defineComponent({
  props: {
    account: {
      type: Object as () => AccountInfo
    }
  },
  setup(props, context) {
    const m = reactive({
      permissionRead: false,
      permissionWrite: false,
      editableColumn: [] as string[],
      editedRules: {} as any,
      editedItem: {} as Item
    });
    listinfo.ListDescriptions["Role"]
      .headers()
      .forEach((x: listinfo.ExtendedDataTableHeader) => {
        if (x.rules) m.editedRules[x.value] = x.rules;
      });
    const setItem = (item: Item) => {
      m.editedItem = item;
    };

    const checkpermission = () => {
      m.permissionRead = true;
      m.permissionWrite = true;
    };

    watch(
      () => [props.account],
      () => {
        vue.nextTick(() => {
          checkpermission();
        });
      }
    );
    checkpermission();
    return { m, setItem };
  },
  components: {
    List: () => import("../components/List.vue")
  }
});
</script>
