<template>
  <List entity="User" :editedItem="m.editedItem" @setItem="setItem">
    <template v-slot:editor>
      <v-col cols="12" sm="6" md="4">
        <ValidationProvider
          v-slot="{ errors }"
          name="firstName"
          :rules="m.editedRules.firstName"
        >
          <v-text-field
            v-model="m.editedItem.firstName"
            label="firstName"
            :error-messages="errors"
          >
          </v-text-field>
        </ValidationProvider>
        <ValidationProvider
          v-slot="{ errors }"
          name="lastName"
          :rules="m.editedRules.lastName"
        >
          <v-text-field
            v-model="m.editedItem.lastName"
            label="lastName"
            :error-messages="errors"
          >
          </v-text-field>
        </ValidationProvider>
        <ValidationProvider
          v-slot="{ errors }"
          name="age"
          :rules="m.editedRules.age"
        >
          <v-text-field
            v-model="m.editedItem.age"
            label="age"
            :error-messages="errors"
          >
          </v-text-field>
        </ValidationProvider>
        <ValidationProvider
          v-slot="{ errors }"
          name="role"
          :rules="m.editedRules.role"
        >
          <v-select
            @blur="onBlur"
            v-model="m.editedItem.role"
            :items="m.roleSelecter"
            label="role"
            :error-messages="errors"
            return-object
            single-line
            clearable
          />
        </ValidationProvider>
      </v-col>
    </template>
  </List>
</template>

<script lang="ts">
import { FindRequestOptions } from "@/@types/request";
import { defineComponent, reactive } from "@vue/composition-api";
import { AxiosResponse } from "axios";
import * as helper from "../DBHelper";
import * as entity from "../entity";

type Item = { id?: string };
type SelecterItem = { text: string; value: number };

export default defineComponent({
  setup() {
    const m = reactive({
      editedRules: {} as any,
      editedItem: {} as Item,
      roleSelecter: [] as SelecterItem[],
      response: undefined as AxiosResponse | undefined
    });
    entity.ListDescriptions["User"]
      .headers()
      .forEach((x: entity.ExtendedDataTableHeader) => {
        if (x.rules) m.editedRules[x.value] = x.rules;
      });
    const setRoleSelecter = async () => {
      m.response = await helper.getList({ entityName: "Role" });
      const items = m.response!.data.body;
      items.forEach((item: { role: string; id: number }) => {
        const role = { text: item.role, value: item.id };
        m.roleSelecter.push(role);
      });
    };
    const onBlur = () => {
      m.editedItem.roles = [{ id: m.editedItem.role.value }];
      console.log("aaa");
    };

    const setItem = (item: Item) => {
      m.editedItem = item;
    };
    setRoleSelecter();
    return { m, setItem, onBlur };
  },
  components: {
    List: () => import("../components/List.vue")
  }
});
</script>
