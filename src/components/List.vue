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
              v-model="m.search.searchColumn"
              :items="m.search.columnSelecter"
              label="Select"
              return-object
              single-line
              clearable
            />
            <v-text-field
              v-model="m.search.inTyped"
              label="Search"
              single-line
              hide-details
              @blur="onBlur"
            />
            <v-select
              v-model="m.search.searchType"
              :items="m.search.typeSelecter"
              label="Type"
              return-object
              single-line
              clearable
            />
          </v-row>
          <v-spacer></v-spacer>

          <v-dialog v-model="m.dialog" fullscreen>
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
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
                      <template
                        v-for="(column, index) in m.edit.editableColumn"
                      >
                        <v-col cols="12" sm="6" md="4" :key="index">
                          <ValidationProvider
                            v-slot="{ errors }"
                            :name="column"
                            :rules="m.edit.editedRules[column]"
                          >
                            <v-text-field
                              v-model="m.edit.editedItem[column]"
                              :label="column"
                              :error-messages="errors"
                            >
                            </v-text-field>
                          </ValidationProvider>
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
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
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
        {{ m.edit.editedRules }}
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
import * as helper from "../DBHelper";
import * as entity from "../entity";

type RequestBase = { entityName: entity.EntityName };
type FindRequestOptions = RequestBase & {
  orderby: string;
  orderdesc: "ASC" | "DESC" | undefined;
  searchColumn: entity.EntityName;
  searchType: string;
  searchText: string;
  skip: number;
  take: number;
};
type DeleteRequestOptions = RequestBase & {
  deleteItem: string;
};
type SaveRequestOptions = RequestBase & {};
type Item = {
  id?: string;
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
      headers: undefined as entity.ExtendedDataTableHeader[] | undefined,
      items: [] as any[],
      entity: undefined as entity.EntityName | undefined,
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
      edit: {
        editedIndex: -1,
        editableColumn: [] as string[],
        editedItem: {} as Item,
        editedRules: {} as any,
        defaultItem: {} as any
      },
      search: {
        columnSelecter: [] as string[],
        typeSelecter: [] as string[],
        typeSelecterParams: [] as string[],
        searchColumn: undefined as entity.EntityName | undefined,
        searchType: "",
        inTyped: "",
        searchText: ""
      }
    });
    // prettier-ignore
    m.search.typeSelecter = ["と等しい","以外","未満","以下","以上","超","を含む"];
    // prettier-ignore
    m.search.typeSelecterParams = ["","Not","LessThan","LessThanOrEqual","MoreThan","MoreThanOrEqual","Like"];
    const formTitle = computed(() =>
      m.edit.editedIndex === -1 ? "追加" : "編集"
    );

    const onBlur = () => {
      m.search.searchText = m.search.inTyped;
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
      m.headers.push({
        text: "Actions",
        value: "actions",
        sortable: false,
        editable: false,
        width: 0
      });
      //prettier-ignore
      m.search.columnSelecter = m.headers.map((x: entity.ExtendedDataTableHeader) => x.value);
      //prettier-ignore
      m.edit.editableColumn = m.headers.filter((x: entity.ExtendedDataTableHeader) => x.editable == true)
      .map((x: entity.ExtendedDataTableHeader) => x.value);
      //prettier-ignore
      m.headers.forEach((x: entity.ExtendedDataTableHeader) => {if(x.default) m.edit.defaultItem[x.value] = x.default;})
      //prettier-ignore
      m.headers.forEach((x: entity.ExtendedDataTableHeader) => {if(x.default) m.edit.editedRules[x.value] = x.rules;})
      m.edit.editedItem = m.edit.defaultItem;
    };

    const updateList = async () => {
      const opt: FindRequestOptions = {
        entityName: m.entity!,
        orderby: m.sortBy,
        orderdesc: m.sortDesc ? "DESC" : "ASC",
        searchColumn: m.search.searchColumn!,
        searchType:
          m.search.typeSelecterParams[
            m.search.typeSelecter.indexOf(m.search.searchType)
          ],
        searchText: m.search.searchText,
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
      m.edit.editedIndex = m.items.indexOf(item);
      m.edit.editedItem = { ...item };
      m.dialogDelete = true;
    };

    const deleteItemConfirm = async () => {
      const opt: DeleteRequestOptions = {
        entityName: m.entity!,
        deleteItem: m.edit.editedItem.id!
      };
      await helper.deleteItem(opt);
      await updateList();
      closeDelete();
    };

    const closeDelete = () => {
      m.dialogDelete = false;
      vue.nextTick(() => {
        m.edit.editedItem = m.edit.defaultItem;
        m.edit.editedIndex = -1;
      });
    };

    const editItem = (item: Item) => {
      m.edit.editedIndex = m.items.indexOf(item);
      m.edit.editedItem = { ...item };
      m.dialog = true;
    };

    const close = () => {
      m.dialog = false;
      m.edit.editedItem = m.edit.defaultItem;
      m.edit.editedIndex = -1;
    };

    const save = async () => {
      if (m.edit.editedIndex != -1) {
        // update
        let data = { ...m.edit.editedItem };
        const opt = { entityName: m.entity, data: data };
        m.response = await helper.updateItem(opt);
      } else {
        // create
        let data = { ...m.edit.editedItem };
        const opt = { entityName: m.entity, data: data };
        m.response = await helper.createItem(opt);
      }
      await updateList();
      close();
    };

    watch(
      () => [m.search.searchColumn, m.search.searchText],
      () => {
        if (m.search.searchColumn || m.search.searchText) updateList();
        if (!m.search.searchColumn || !m.search.searchText) {
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