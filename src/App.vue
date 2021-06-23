<template>
  <div>
    <v-data-table
      :entity="m.entity"
      :headers="m.headers"
      :items="m.items"
      :sort-by.sync="m.sortBy"
      :sort-desc.sync="m.sortDesc"
      :page.sync="m.page"
      class="elevation-1"
      hide-default-footer
      @page-count="pageCount = $event"
    />
    <div class="text-center pt-2">
      <v-pagination v-model="m.page" :length="m.pageCount" :total-visible="7" />
    </div>
    <v-container>
      <template>
        <v-container fluid>
          <v-radio-group v-model="m.entity" mandatory>
            <v-radio label="User" value="User"></v-radio>
            <v-radio label="Book" value="Book"></v-radio>
          </v-radio-group>
        </v-container>
      </template>
      <v-row no-gutters class="my-3">
        <v-btn type="button" @click="getAlldata"> getAlldata </v-btn>
      </v-row>
    </v-container>
    <hr />
    <span>{{ m.jsonData }}</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  watch
} from "@vue/composition-api";
import axios, { AxiosResponse } from "axios";
import * as helper from "./Helper";
import * as entity from "./entity";
import { FindManyOptions } from "typeorm";
import { DataTableHeader } from "vuetify";
import { Observable, Subject } from "rxjs";
import { map, tap } from "rxjs/operators";
const entitySub = new Subject<string>();

export default defineComponent({
  setup() {
    const m = reactive({
      headers: undefined as DataTableHeader[] | undefined,
      items: [] as any[],
      entity: undefined as entity.entity_name_t | undefined,
      page: 1,
      pageCount: 0,
      itemsLength: 0,
      jsondata: null as AxiosResponse | null,
      sortBy: "age",
      oldSortBy: "age",
      sortDesc: true
    });

    const updateEntity = (e: unknown) => {
      if (entity.isEntity(e)) {
        m.entity = e;
      }
    };
    const buildHeaders = () => {
      m.headers = helper.ListDescriptions[m.entity!].headers();
    };
    type orderdesc_t = "ASC" | "DESC" | 1 | -1 | undefined;
    type opt_t = {
      entityName: entity.entity_name_t;
      order?: {};
      orderby: string;
      orderdesc: orderdesc_t;
      skip: number;
      take?: number;
    };

    const updateList = () => {
      const opt: opt_t = {
        entityName: m.entity!,
        orderby: m.sortBy,
        orderdesc: m.sortDesc ? "DESC" : "ASC",
        skip: (m.page - 1) * 10
      };
      m.jsondata = helper.getList(opt);
      m.items = m.jsondata!.data;
    };

    function getAlldata() {
      buildHeaders();
      updateList();
    }

    watch(
      () => [m.sortBy, m.sortDesc],
      () => {
        if (m.sortBy === undefined) m.sortBy = m.oldSortBy;
        if (m.sortDesc === undefined) m.sortDesc = true;
        m.oldSortBy = m.sortBy;
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
        buildHeaders();
        updateList();
      }
    );

    // init
    updateEntity("User");
    buildHeaders();
    updateList();
    entitySub.asObservable().pipe(
      map((e) => {
        updateEntity(e);
      })
    ).subscribe;

    return { m, getAlldata, updateEntity };
  }
});
</script>
