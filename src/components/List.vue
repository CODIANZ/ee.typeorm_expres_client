<template>
  <div>
    <v-data-table
      :entity="m.entity"
      :headers="m.headers"
      :items="m.items"
      :sort-by.sync="m.sortBy"
      :sort-desc.sync="m.sortDesc"
      :server-items-length="m.itemsLength"
      :page.sync="m.page"
      :items-per-page.sync="m.itemsPerPage"
      class="elevation-1"
    >
    </v-data-table>
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
    <div v-if="m.response">
      <span>
        レスポンス全文：
        {{ m.response }}
      </span>
      <hr />
      <span>
        リクエストクエリー：
        {{ m.response.config.data }}
      </span>
      <hr />
      <span>
        レスポンスデータ：
        {{ m.response.data }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from "@vue/composition-api";
import { AxiosResponse } from "axios";
import * as helper from "../Helper";
import * as entity from "../entity";
import { DataTableHeader } from "vuetify";

type OrderDesc = "ASC" | "DESC" | 1 | -1 | undefined;
type Options = {
  entityName: entity.EntityName;
  order?: {};
  orderby: string;
  orderdesc: OrderDesc;
  skip: number;
  take: number;
};
export default defineComponent({
  setup() {
    const m = reactive({
      headers: undefined as DataTableHeader[] | undefined,
      items: [] as any[],
      entity: undefined as entity.EntityName | undefined,
      page: 1,
      pageCount: 0,
      itemsLength: 0,
      itemsPerPage: 10,
      response: undefined as AxiosResponse | undefined,
      sortBy: "",
      prevSortBy: "",
      sortDesc: true
    });

    const updateEntity = (entityName: entity.EntityName) => {
      if (entity.isEntity(entityName)) {
        m.entity = entityName;
        m.page = 1;
        m.sortBy = "";
        m.sortDesc = true;
        m.prevSortBy = "";
        buildHeaders();
      }
    };

    const buildHeaders = () => {
      m.headers = entity.ListDescriptions[m.entity!].headers();
    };

    async function updateList() {
      const opt: Options = {
        entityName: m.entity!,
        orderby: m.sortBy,
        orderdesc: m.sortDesc ? "DESC" : "ASC",
        skip: (m.page - 1) * 10,
        take: m.itemsPerPage !== -1 ? m.itemsPerPage : m.itemsLength
      };
      m.response = await helper.getList(opt);
      m.items = m.response!.data.body;
      m.itemsLength = m.response!.data.length;
      m.pageCount = Math.ceil(m.itemsLength / 10);
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
      () => [m.page, m.itemsPerPage],
      () => updateList()
    );
    watch(
      () => m.entity,
      () => {
        updateEntity(m.entity!);
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
