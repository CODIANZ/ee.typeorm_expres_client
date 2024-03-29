<template>
  <v-container fluid>
    <v-spacer class="mt-16"></v-spacer>
    <v-data-table
      v-if="m.permissionRead"
      :entity="m.entity"
      :headers="m.headers"
      :items="m.items"
      :loading="m.isLoad"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-row>
            <v-toolbar-title class="mx-4 mt-2">アカウント</v-toolbar-title>
          </v-row>
          <v-spacer></v-spacer>
          <v-dialog v-model="m.dialog" fullscreen v-if="m.permissionWrite">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                New Item
              </v-btn>
            </template>
            <v-card>
              <v-container>
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
                      <v-col cols="12" sm="12">
                        <ValidationProvider
                          v-slot="{ errors }"
                          name="email"
                          :rules="m.editedRules.email"
                        >
                          <v-text-field
                            v-model="m.mailAddress"
                            color="blue darken-2"
                            label="メールアドレス"
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
                    <v-container class="mt-3 ml-8">
                      <v-row>
                        <v-col cols="12" sm="4" md="4">
                          <v-checkbox
                            v-model="
                              m.editedItem
                                .extension_d682a04f5b2c4876914713579fdf1e26_ReadBook
                            "
                            label="readBook"
                          ></v-checkbox>
                          <v-checkbox
                            v-model="
                              m.editedItem
                                .extension_d682a04f5b2c4876914713579fdf1e26_WriteBook
                            "
                            label="writeBook"
                          ></v-checkbox>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" sm="4" md="4">
                          <v-checkbox
                            v-model="
                              m.editedItem
                                .extension_d682a04f5b2c4876914713579fdf1e26_ReadAccount
                            "
                            label="readAccount"
                          ></v-checkbox>
                          <v-checkbox
                            v-model="
                              m.editedItem
                                .extension_d682a04f5b2c4876914713579fdf1e26_WriteAccount
                            "
                            label="writeAccount"
                          ></v-checkbox>
                        </v-col>
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
                      type="submit"
                      :disabled="invalid"
                    >
                      Save
                    </v-btn>
                  </v-card-actions>
                </ValidationObserver>
              </v-container>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-if="m.permissionWrite" v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import vue from "vue";
import { readWritePerm, signUpDataPerm } from "../@types/request";
import {
  defineComponent,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  reactive,
  watch
} from "@vue/composition-api";
import { signUp, getList, update } from "../SignUpHelper";
import { AxiosResponse } from "axios";
import { DataTableHeader } from "vuetify";
import { AzureADPermissions } from "@/@types/azureADPermissions";
import { AccountInfo } from "@azure/msal-common";

export const extensionAttributes = {
  ReadBook: "extension_d682a04f5b2c4876914713579fdf1e26_ReadBook",
  ReadAccount: "extension_d682a04f5b2c4876914713579fdf1e26_ReadAccount",
  WriteBook: "extension_d682a04f5b2c4876914713579fdf1e26_WriteBook",
  WriteAccount: "extension_d682a04f5b2c4876914713579fdf1e26_WriteAccount"
};
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
      permissions: {} as AzureADPermissions,
      permissionRead: false,
      permissionWrite: false,
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
      mailAddress: "",
      mailNickname: "",
      createUser: false,
      fullAccess: false,
      editedRules: {
        firstName: "alpha|required",
        lastName: "alpha|required",
        mailAddress: "email|required"
      }
    });
    m.headers = [
      { text: "表示名", value: "displayName", sortable: true },
      {
        text: "readBook",
        value: extensionAttributes.ReadBook,
        sortable: true
      },
      {
        text: "writeBook",
        value: extensionAttributes.WriteBook,
        sortable: true
      },
      {
        text: "readAccount",
        value: extensionAttributes.ReadAccount,
        sortable: true
      },
      {
        text: "WriteAccount",
        value: extensionAttributes.WriteAccount,
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
        readWrite = {
          [extensionAttributes.ReadBook]:
            m.editedItem[extensionAttributes.ReadBook],
          [extensionAttributes.ReadAccount]:
            m.editedItem[extensionAttributes.ReadAccount],
          [extensionAttributes.WriteBook]:
            m.editedItem[extensionAttributes.WriteBook],
          [extensionAttributes.WriteAccount]:
            m.editedItem[extensionAttributes.WriteAccount]
        };
        let pass = "Aa0";
        // ランダム文字列の生成、開発環境以外で使用
        // const chars =
        //   "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        // for (var i = 0; i < 8; i++) {
        //   pass += chars.charAt(Math.floor(Math.random() * chars.length));
        // }
        const data: signUpDataPerm = {
          accountEnabled: true,
          displayName: `${m.lastName} ${m.firstName}`,
          mailNickname: m.mailNickname,
          mail: m.mailAddress,
          userPrincipalName: `${m.mailAddress.replace(
            "@",
            "_"
          )}#EXT#@codianzeval.onmicrosoft.com`,
          passwordProfile: {
            forceChangePasswordNextSignIn: false,
            password: pass === "Aa0" ? pass : "Testpass01"
          },
          ...readWrite
        };
        m.response = await signUp(data);
      } else {
        // update
        const data: readWritePerm = {
          [extensionAttributes.ReadBook]:
            m.editedItem[extensionAttributes.ReadBook],
          [extensionAttributes.ReadAccount]:
            m.editedItem[extensionAttributes.ReadAccount],
          [extensionAttributes.WriteBook]:
            m.editedItem[extensionAttributes.WriteBook],
          [extensionAttributes.WriteAccount]:
            m.editedItem[extensionAttributes.WriteAccount]
        };
        m.response = await update(data, m.editedItem.id);
      }
      close();
      updateList();
    };

    const checkpermission = () => {
      m.permissions = props.permissions!;
      m.permissionRead = m.permissions.ReadAccount;
      m.permissionWrite = m.permissions.WriteAccount;
    };

    watch(
      () => [props.permissions, props.account],
      () => {
        vue.nextTick(() => {
          checkpermission();
          updateList();
        });
      }
    );
    onMounted(() => {
      checkpermission();
      updateList();
    });
    return {
      m,
      save,
      editItem,
      close
    };
  }
});
</script>
