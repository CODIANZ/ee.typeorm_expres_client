<template>
  <v-container fluid>
    <v-spacer class="mt-16"></v-spacer>
    <v-data-table
      :entity="m.entity"
      :headers="m.headers"
      :items="m.items"
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
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                New Item
              </v-btn>
            </template>
            <v-card>
              <v-spacer class="mt-16"></v-spacer>
              <ValidationObserver v-slot="{ invalid }">
                <v-card-text>
                  <v-row v-if="m.editedIndex == -1">
                    <v-col cols="12" sm="6">
                      <ValidationProvider
                        v-slot="{ errors }"
                        name="lastName"
                        :rules="m.editedRules.lastName"
                      >
                        <v-text-field
                          v-model="m.lastName"
                          color="purple darken-2"
                          label="姓"
                          :error-messages="errors"
                          required
                        ></v-text-field>
                      </ValidationProvider>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <ValidationProvider
                        v-slot="{ errors }"
                        name="firstName"
                        :rules="m.editedRules.firstName"
                      >
                        <v-text-field
                          v-model="m.firstName"
                          color="blue darken-2"
                          label="名"
                          :error-messages="errors"
                          required
                        ></v-text-field>
                      </ValidationProvider>
                    </v-col>
                  </v-row>
                  <v-row v-if="m.editedIndex != -1">
                    <v-col cols="12" sm="6">
                      表示名：{{ m.editedItem.displayName }}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-checkbox
                        v-model="
                          m.editedItem
                            .extension_d682a04f5b2c4876914713579fdf1e26_CreateUser
                        "
                        label="createUser"
                      ></v-checkbox>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-checkbox
                        v-model="m.fullAccess"
                        label="fullAccess"
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                  <v-container v-if="!m.fullAccess">
                    <v-checkbox
                      v-model="
                        m.editedItem
                          .extension_d682a04f5b2c4876914713579fdf1e26_readBook
                      "
                      label="readBook"
                    ></v-checkbox>
                    <v-checkbox
                      v-model="
                        m.editedItem
                          .extension_d682a04f5b2c4876914713579fdf1e26_writeBook
                      "
                      label="writeBook"
                    ></v-checkbox>
                    <v-checkbox
                      v-model="
                        m.editedItem
                          .extension_d682a04f5b2c4876914713579fdf1e26_readUser
                      "
                      label="readUser"
                    ></v-checkbox>
                    <v-checkbox
                      v-model="
                        m.editedItem
                          .extension_d682a04f5b2c4876914713579fdf1e26_writeUser
                      "
                      label="writeUser"
                    ></v-checkbox>
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

    <v-btn @click="onClickgetToken"> getToken </v-btn>
    <div v-if="m.response">
      <span>
        レスポンス全文：
        {{ m.response }}
      </span>
      <hr />
      <span>
        リクエストクエリー：
        {{ m.editedItem }}
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
import { readWritePerm, signUpDataPerm } from "../@types/request";
import { defineComponent, reactive } from "@vue/composition-api";
import { signUp, getToken, getList, update } from "../SignUpHelper";
import { AxiosResponse } from "axios";
import { DataTableHeader } from "vuetify";

export default defineComponent({
  setup(props, context) {
    const m = reactive({
      headers: undefined as DataTableHeader[] | undefined,
      items: [] as any[],
      response: undefined as AxiosResponse | undefined,
      isLoad: true,
      dialog: false,
      dialogDelete: false,
      editedIndex: -1,
      editedItem: {} as any,
      defaultItem: {} as any,
      firstName: "",
      lastName: "",
      mailNickname: "",
      createUser: false,
      fullAccess: false,
      readBook: false,
      writeBook: false,
      readUser: false,
      writeUser: false,
      editedRules: { firstName: "alpha|required", lastName: "alpha|required" }
    });

    m.headers = [
      { text: "表示名", value: "displayName", sortable: true },
      {
        text: "createUser",
        value: "extension_d682a04f5b2c4876914713579fdf1e26_CreateUser",
        sortable: true
      },
      {
        text: "readBook",
        value: "extension_d682a04f5b2c4876914713579fdf1e26_ReadBook",
        sortable: true
      },
      {
        text: "writeBook",
        value: "extension_d682a04f5b2c4876914713579fdf1e26_ReadUser",
        sortable: true
      },
      {
        text: "readUser",
        value: "extension_d682a04f5b2c4876914713579fdf1e26_WriteBook",
        sortable: true
      },
      {
        text: "WriteUser",
        value: "extension_d682a04f5b2c4876914713579fdf1e26_WriteUser",
        sortable: true
      },
      {
        text: "Actions",
        value: "actions",
        sortable: false,
        width: 0
      }
    ];

    const updateList = async () => {
      m.isLoad = true;
      m.response = await getList();
      m.items = m.response!.data.value;
      m.isLoad = false;
    };

    const editItem = (item: any) => {
      m.editedIndex = m.items.indexOf(item);
      m.editedItem = Object.assign({}, item);
      m.dialog = true;
    };

    const close = () => {
      m.dialog = false;
      m.editedIndex = -1;
      m.editedItem = {};
    };

    const save = async () => {
      if (m.editedIndex == -1) {
        // create
        m.mailNickname = m.firstName + m.lastName.charAt(0).toUpperCase();
        let readWrite: readWritePerm;
        if (m.fullAccess) {
          readWrite = {
            extension_d682a04f5b2c4876914713579fdf1e26_ReadBook: true,
            extension_d682a04f5b2c4876914713579fdf1e26_ReadUser: true,
            extension_d682a04f5b2c4876914713579fdf1e26_WriteBook: true,
            extension_d682a04f5b2c4876914713579fdf1e26_WriteUser: true
          };
        } else {
          readWrite = {
            extension_d682a04f5b2c4876914713579fdf1e26_ReadBook: m.readBook,
            extension_d682a04f5b2c4876914713579fdf1e26_ReadUser: m.readUser,
            extension_d682a04f5b2c4876914713579fdf1e26_WriteBook: m.writeBook,
            extension_d682a04f5b2c4876914713579fdf1e26_WriteUser: m.writeUser
          };
        }
        const data: signUpDataPerm = {
          accountEnabled: true,
          displayName: `${m.lastName} ${m.firstName}`,
          mailNickname: m.mailNickname,
          userPrincipalName: `${m.lastName}_${m.firstName}#EXT#@codianzeval.onmicrosoft.com`,
          passwordProfile: {
            forceChangePasswordNextSignIn: true,
            password: "xWwvJ]6NMw+bWH-d"
          },
          extension_d682a04f5b2c4876914713579fdf1e26_createUser: m.createUser,
          ...readWrite
        };
        m.response = await signUp(data);
      } else {
        // update
        const data: readWritePerm = {
          extension_d682a04f5b2c4876914713579fdf1e26_ReadBook:
            m.editedItem.extension_d682a04f5b2c4876914713579fdf1e26_readBook,
          extension_d682a04f5b2c4876914713579fdf1e26_ReadUser:
            m.editedItem.extension_d682a04f5b2c4876914713579fdf1e26_readUser,
          extension_d682a04f5b2c4876914713579fdf1e26_WriteBook:
            m.editedItem.extension_d682a04f5b2c4876914713579fdf1e26_writeBook,
          extension_d682a04f5b2c4876914713579fdf1e26_WriteUser:
            m.editedItem.extension_d682a04f5b2c4876914713579fdf1e26_writeUser
        };
        m.response = await update(data, m.editedItem.id);
      }
      close();
      updateList();
    };

    const onClickgetToken = () => {
      getToken();
    };

    updateList();
    return {
      m,
      save,
      onClickgetToken,
      editItem,
      close
    };
  }
});
</script>
