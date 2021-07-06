<template>
  <v-container fluid>
    <v-spacer class="mt-16"></v-spacer>
    <v-data-table
      :entity="m.entity"
      :headers="m.headers"
      :items="m.items"
      :sync="m.search"
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
              :items="m.columnSelecter"
              label="Select"
              return-object
              single-line
              clearable
            />
            <v-text-field
              v-model="m.inTyped"
              label="Search"
              single-line
              hide-details
              @blur="onBlur"
            />
            <v-select
              v-model="m.searchType"
              :items="m.typeSelecter"
              label="Type"
              return-object
              single-line
              clearable
            />
          </v-row>
          <v-spacer></v-spacer>

          <v-dialog v-model="m.dialog" fullscreen>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-if="m.authority.creatable"
                color="primary"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
              >
                New Item
              </v-btn>
            </template>
            <v-card>
              <ValidationObserver v-slot="{ invalid }">
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <slot name="editor" />
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancel
                  </v-btn>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="save"
                    type="submit"
                    :disabled="invalid"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </ValidationObserver>
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
        <v-icon
          v-if="m.authority.editable"
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon v-if="m.authority.deletable" small @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
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
      <hr />
      <span>
        debug：
        {{ m.searchType }}
      </span>
    </div>
  </v-container>
</template>

<script lang="ts">
import vue from "vue";
import {
  defineComponent,
  reactive,
  watch,
  computed
} from "@vue/composition-api";
import { AxiosResponse } from "axios";
import { FindRequestOptions, DeleteRequestOptions } from "../@types/request";
import * as helper from "../DBHelper";
import * as entity from "../entity";

type Item = { id?: string };
type SearchType = { text: string; value: string };

export default defineComponent({
  props: {
    entity: {
      type: String as () => entity.EntityName,
      required: true
    },
    editedItem: {}
  },
  setup(props, context) {
    const m = reactive({
      entity: undefined as entity.EntityName | undefined,
      relations: "",
      headers: undefined as entity.ExtendedDataTableHeader[] | undefined,
      authority: undefined as entity.Authority | undefined,
      items: [] as any[],
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
      editedItem: {} as Item,
      defaultItem: {} as any,
      columnSelecter: [] as string[],
      typeSelecter: [] as SearchType[],
      searchColumn: undefined as entity.EntityName | undefined,
      searchType: {} as SearchType,
      inTyped: "",
      searchText: ""
    });

    m.typeSelecter = [
      { text: "を含む", value: "Like" },
      { text: "と等しい", value: "Equal" },
      { text: "以外", value: "Not" },
      { text: "未満", value: "LessThan" },
      { text: "以下", value: "LessThanOrEqual" },
      { text: "超", value: "MoreThan" },
      { text: "以上", value: "MoreThanOrEqual" }
    ];

    const formTitle = computed(() => (m.editedIndex === -1 ? "追加" : "編集"));

    const onBlur = () => {
      m.searchText = m.inTyped;
    };
    const updateEntity = (propsEntity: entity.EntityName) => {
      if (entity.isEntity(propsEntity)) {
        m.entity = propsEntity;
        m.relations = entity.ListDescriptions[m.entity!].relations;
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
      m.columnSelecter = m.headers.map((x: entity.ExtendedDataTableHeader) => x.value);
      m.headers.push({
        text: "Actions",
        value: "actions",
        sortable: false,
        editable: false,
        width: 0
      });
      m.authority = entity.ListDescriptions[m.entity!].authorities;
      //prettier-ignore
      m.headers.forEach((x: entity.ExtendedDataTableHeader) => {if(x.default) m.defaultItem[x.value] = x.default;})
      context.emit("setItem", m.defaultItem);
    };

    const updateList = async () => {
      const opt: FindRequestOptions = {
        entityName: m.entity!,
        relations: m.relations,
        orderby: m.sortBy,
        orderdesc: m.sortDesc ? "DESC" : "ASC",
        searchColumn: m.searchColumn!,
        searchType: m.searchType.value!,
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
    };

    const deleteItem = (item: Item) => {
      m.editedIndex = m.items.indexOf(item);
      m.editedItem = { ...item };
      m.dialogDelete = true;
    };

    const deleteItemConfirm = async () => {
      const opt: DeleteRequestOptions = {
        entityName: m.entity!,
        relations: m.relations,
        deleteItem: m.editedItem.id!
      };
      await helper.deleteItem(opt);
      await updateList();
      closeDelete();
    };

    const closeDelete = () => {
      m.dialogDelete = false;
      vue.nextTick(() => {
        context.emit("setItem", m.defaultItem);
        m.editedIndex = -1;
      });
    };

    const editItem = (item: Item) => {
      m.editedIndex = m.items.indexOf(item);
      context.emit("setItem", item);
      m.dialog = true;
    };

    const close = () => {
      m.dialog = false;
      context.emit("setItem", m.defaultItem);
      m.editedIndex = -1;
    };

    const save = async () => {
      if (m.editedIndex != -1) {
        // update
        let data = props.editedItem;
        const opt = { entityName: m.entity, data: data };
        m.response = await helper.updateItem(opt);
      } else {
        // create
        let data = props.editedItem;
        const opt = { entityName: m.entity, data: data };
        m.response = await helper.createItem(opt);
      }
      await updateList();
      close();
    };

    watch(
      () => [m.searchColumn, m.searchText, m.searchType],
      () => {
        if (m.searchColumn || m.searchText || m.searchType) updateList();
        else if (!m.searchColumn || !m.searchText || !m.searchType) {
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
