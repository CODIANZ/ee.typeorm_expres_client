<template>
  <v-container fluid>
    <v-row>
      <v-col cols="4">
        {{ m.entity }}
      </v-col>
      <v-col cols="3">
        <v-select
          v-model="m.searchColumn"
          :items="m.selectersItems"
          label="Select"
          return-object
          single-line
          clearable="true"
        ></v-select>
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="m.inTyped"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          @blur="onBlur"
        ></v-text-field>
      </v-col>
      <v-col cols="1">
        <v-btn dark fab x-small color="green" @click="onButonNew()">
          <v-icon color="white">mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-data-table
      :entity="m.entity"
      :headers="m.headers"
      :items="m.items"
      :search.sync="m.search"
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
        {{ m.response.config.params }}
      </span>
      <hr />
      <span>
        レスポンスデータ：
        {{ m.response.data }}
      </span>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from "@vue/composition-api";
import { AxiosResponse } from "axios";
import * as helper from "../Helper";
import * as entity from "../entity";
import { DataTableHeader } from "vuetify";
import { FindConditions } from "typeorm";

type OrderDesc = "ASC" | "DESC" | 1 | -1 | undefined;
type Options = {
  entityName: entity.EntityName;
  order?: {};
  orderby: string;
  orderdesc: OrderDesc;
  where?: FindConditions<entity.EntityMap>;
  searchColumn: entity.EntityName;
  searchText: string;
  skip: number;
  take: number;
};
export default defineComponent({
  props: {
    entity: {
      type: String as () => entity.EntityName,
      required: true
    }
  },
  setup(props) {
    const m = reactive({
      headers: undefined as DataTableHeader[] | undefined,
      selectersItems: [],
      items: [] as any[],
      entity: undefined as entity.EntityName | undefined,
      searchColumn: undefined as entity.EntityName | undefined,
      inTyped: "",
      searchText: "",
      page: 1,
      pageCount: 0,
      itemsLength: 0,
      itemsPerPage: 10,
      response: undefined as AxiosResponse | undefined,
      sortBy: "",
      prevSortBy: "",
      sortDesc: true
    });

    const onBlur = () => {
      m.searchText = m.inTyped;
    };
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
      //prettier-ignore
      m.selectersItems = (entity.ListDescriptions[m.entity!].headers() as any).map((x: DataTableHeader) => x.value);
    };

    async function updateList() {
      const opt: Options = {
        entityName: m.entity!,
        orderby: m.sortBy,
        orderdesc: m.sortDesc ? "DESC" : "ASC",
        searchColumn: m.searchColumn!,
        searchText: m.searchText,
        skip: (m.page - 1) * 10,
        take: m.itemsPerPage !== -1 ? m.itemsPerPage : m.itemsLength
      };
      m.response = await helper.getList(opt);
      m.items = m.response!.data.body;
      m.itemsLength = m.response!.data.length;
      m.pageCount = Math.ceil(m.itemsLength / 10);
    }

    watch(
      () => [m.searchColumn, m.searchText],
      () => {
        if (m.searchColumn || m.searchText) updateList();
      }
    );

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
    updateEntity(props.entity);
    updateList();

    return { props, m, updateEntity, onBlur };
  }
});
</script>
