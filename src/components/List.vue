<template>
  <v-container fluid>
    <v-spacer class="mt-16"></v-spacer>
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
      :loading="m.isLoad"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-row>
            <v-toolbar-title class="mx-4">{{ m.entity }}</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-select
              v-model="m.searchColumn"
              :items="m.selectersItems"
              label="Select"
              return-object
              single-line
              clearable
            ></v-select>
            <v-text-field
              v-model="m.inTyped"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
              @blur="onBlur"
            ></v-text-field>
          </v-row>
          <v-spacer></v-spacer>
          <v-dialog v-model="m.dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                New Item
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <template v-for="(column, index) in m.selectersItems">
                      <v-col
                        v-if="!index == 0"
                        cols="12"
                        sm="6"
                        md="4"
                        :key="index"
                      >
                        <v-text-field
                          v-model="m.editedItem[index]"
                          :label="column"
                        >
                        </v-text-field>
                      </v-col>
                    </template>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="m.dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5"
                >この操作は取り消せません<br />本当に削除しますか？</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete"
                  >Cancel</v-btn
                >
                <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                  >OK</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
      </template>
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
import {
  defineComponent,
  reactive,
  watch,
  computed
} from "@vue/composition-api";
import { AxiosResponse } from "axios";
import * as helper from "../DBHelper";
import * as entity from "../entity";
import { DataTableHeader } from "vuetify";

type OrderDesc = "ASC" | "DESC" | undefined;
type FindRequestOptions = {
  entityName: entity.EntityName;
  orderby: string;
  orderdesc: OrderDesc;
  searchColumn: entity.EntityName;
  searchText: string;
  skip: number;
  take: number;
};
type Item = {
  id?: number;
};

export default defineComponent({
  props: {
    entity: {
      type: String as () => entity.EntityName,
      required: true
    }
  },
  setup(props, { root }) {
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
      sortDesc: true,
      isLoad: true,
      dialog: false,
      dialogDelete: false,
      editedIndex: -1,
      editedItem: [] as any[],
      defaultItem: []
    });
    const formTitle = computed(() => (m.editedIndex === -1 ? "追加" : "編集"));

    const onBlur = () => {
      m.searchText = m.inTyped;
    };
    const updateEntity = (propsEntity: entity.EntityName) => {
      if (entity.isEntity(propsEntity)) {
        m.entity = propsEntity;
        m.page = 1;
        m.sortBy = "";
        m.sortDesc = true;
        m.prevSortBy = "";
        buildHeaders();
      }
    };

    const buildHeaders = () => {
      m.headers = entity.ListDescriptions[m.entity!].headers();
      m.headers.push({ text: "Actions", value: "actions", sortable: false });
      //prettier-ignore
      m.selectersItems = (entity.ListDescriptions[m.entity!].headers() as any).map((x: DataTableHeader) => x.value);
    };

    async function updateList() {
      const opt: FindRequestOptions = {
        entityName: m.entity!,
        orderby: m.sortBy,
        orderdesc: m.sortDesc ? "DESC" : "ASC",
        searchColumn: m.searchColumn!,
        searchText: m.searchText,
        skip: (m.page - 1) * 10,
        take: m.itemsPerPage !== -1 ? m.itemsPerPage : m.itemsLength
      };
      m.isLoad = true;
      m.response = await helper.getList(opt);
      m.items = m.response!.data.body;
      m.itemsLength = m.response!.data.length;
      m.pageCount = Math.ceil(m.itemsLength / 10);
      m.isLoad = false;
    }

    const deleteItem = (item: Object) => {
      m.editedIndex = m.items.indexOf(item);
      m.editedItem = Object.values(item).map((value) => value);
      m.dialogDelete = true;
    };

    async function deleteItemConfirm() {
      // TODO:optの型つけ
      const opt = { entityName: m.entity, deleteItem: m.editedItem[0] };
      await helper.deleteItem(opt);
      await updateList();
      closeDelete();
    }

    const closeDelete = () => {
      m.dialogDelete = false;
      root.$nextTick(() => {
        m.editedItem = m.defaultItem;
        m.editedIndex = -1;
      });
    };

    const editItem = (item: Object) => {
      m.editedIndex = m.items.indexOf(item);
      m.editedItem = Object.values(item).map((value) => value);
      m.dialog = true;
    };

    const close = () => {
      m.dialog = false;
      root.$nextTick(() => {
        m.editedItem = m.defaultItem;
        m.editedIndex = -1;
      });
    };

    const save = () => {
      if (m.editedIndex != -1) {
        // update
        let data = {};

        const opt = { entityName: m.entity, data: data };
      } else {
        // create
      }
    };

    watch(
      () => [m.searchColumn, m.searchText],
      () => {
        if (m.searchColumn || m.searchText) updateList();
        if (!m.searchColumn || !m.searchText) {
          m.page = 1;
          updateList();
        }
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
      () => props.entity,
      () => {
        updateEntity(props.entity!);
        updateList();
      }
    );

    // init
    updateEntity(props.entity!);
    updateList();

    return {
      props,
      m,
      formTitle,
      onBlur,
      deleteItem,
      deleteItemConfirm,
      closeDelete,
      editItem,
      close,
      save
    };
  }
});
</script>
