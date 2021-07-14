<template>
  <List
    entity="Book"
    :editedItem="m.editedItem"
    :permissionRead.sync="m.permissionRead"
    :permissionWrite.sync="m.permissionWrite"
    @setItem="setItem"
  >
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
import vue from "vue";
import { AzureADPermissions } from "@/@types/azureADPermissions";
import { AccountInfo } from "@azure/msal-browser";
import { defineComponent, reactive, watch } from "@vue/composition-api";
import * as listinfo from "../components/ListInfo";

type Item = { id?: string; publish_at: string };

export default defineComponent({
  props: {
    account: {
      type: Object as () => AccountInfo
    },
    permissions: {
      type: Object as () => AzureADPermissions
    }
  },
  setup(props, context) {
    const m = reactive({
      editedRules: {} as any,
      editedItem: {} as Item,
      permissionRead: false,
      permissionWrite: false,
      permissions: {} as AzureADPermissions
    });
    listinfo.ListDescriptions["Book"]
      .headers()
      .forEach((x: listinfo.ExtendedDataTableHeader) => {
        if (x.rules) m.editedRules[x.value] = x.rules;
      });
    const setItem = (item: Item) => {
      m.editedItem = item;
    };

    const checkpermission = () => {
      m.permissions = props.permissions!;
      m.permissionRead = m.permissions.ReadBook;
      m.permissionWrite = m.permissions.WriteBook;
    };

    watch(
      () => [props.permissions, props.account],
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
