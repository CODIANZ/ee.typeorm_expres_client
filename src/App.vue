<template>
  <div>
    <v-data-table
      :entity="m.entity"
      :headers="m.headers"
      :items="m.items"
      :sort-by.sync="m.sortBy"
      :sort-desc.sync="m.sortDesc"
      :server-items-length="m.itemsLength"
      :items-per-page="10"
      :page.sync="m.page"
      class="elevation-1"
    />
    <v-container>
      <template>
        <v-container fluid>
          <v-radio-group v-model="m.entity" mandatory>
            <v-radio label="User" value="User"></v-radio>
            <v-radio label="Book" value="Book"></v-radio>
          </v-radio-group>
        </v-container>
      </template>
    </v-container>
    <hr />
    <span>{{ m.response }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from "@vue/composition-api";
import { AxiosResponse } from "axios";
import * as helper from "./Helper";
import * as entity from "./entity";
import { DataTableHeader } from "vuetify";

type orderdesc_t = "ASC" | "DESC" | 1 | -1 | undefined;
type opt_t = {
  entityName: entity.entity_name_t;
  order?: {};
  orderby: string;
  orderdesc: orderdesc_t;
  skip: number;
  take?: number;
};
export default defineComponent({
  setup() {
    const m = reactive({
      headers: undefined as DataTableHeader[] | undefined,
      items: [] as any[],
      entity: undefined as entity.entity_name_t | undefined,
      page: 1,
      pageCount: 0,
      itemsLength: 0,
      response: undefined as AxiosResponse | undefined,
      sortBy: "",
      prevSortBy: "",
      sortDesc: true
    });

    const updateEntity = (e: unknown) => {
      if (entity.isEntity(e)) {
        m.entity = e;
        m.page = 1;
        buildHeaders();
      }
    };
    const buildHeaders = () => {
      m.headers = helper.ListDescriptions[m.entity!].headers();
    };

    async function updateList() {
      const opt: opt_t = {
        entityName: m.entity!,
        orderby: m.sortBy,
        orderdesc: m.sortDesc ? "DESC" : "ASC",
        skip: (m.page - 1) * 10
      };
      m.response = await helper.getList(opt);
      m.items = m.response!.data.body;
      m.itemsLength = m.response!.data.length;
      m.pageCount = Math.ceil(m.itemsLength / 10);
      console.log(m.items);
    }

    watch(
      () => [m.sortBy, m.sortDesc],
      () => {
        if (m.sortBy === undefined) m.sortBy = m.prevSortBy;
        if (m.sortDesc === undefined) m.sortDesc = true;
        m.prevSortBy = m.sortBy;
        m.page = 1;
        updateList();
      }
    );
    watch(
      () => m.page,
      () => updateList()
    );
    watch(
      () => m.entity,
      () => {
        updateEntity(m.entity);
        updateList();
      }
    );

    // init
    updateEntity("User");
    updateList();

    return { m, updateEntity };
  }
});
</script>
