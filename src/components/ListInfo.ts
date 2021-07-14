import { DataTableHeader } from "vuetify";
import * as entity from "../entity";

export const GetListTitle: {
  [E in entity.EntityName]: () => string;
} = {
  User: () => "ユーザー",
  Book: () => "本",
  Role: () => "権限"
};

export interface ExtendedDataTableHeader<T extends any = any>
  extends DataTableHeader {
  default?: string;
  rules?: string;
}
export interface Authority {
  creatable: boolean;
  editable: boolean;
  deletable: boolean;
}
export interface Permission {
  read?: string;
  write?: string;
  open?: boolean;
}

export type ListDescription<T extends entity.EntityName> = {
  relations: {};
  authorities: Authority;
  permissions: Permission;
  headers: () => ExtendedDataTableHeader<entity.EntityMap[T]>[];
};
export const ListDescriptions: {
  [E in entity.EntityName]: ListDescription<E>;
} = {
  User: {
    relations: { role: "roles" },
    authorities: { creatable: true, editable: true, deletable: true },
    permissions: { open: true },
    headers: () => [
      { text: "id", sortable: true, value: "id" },
      {
        text: "firstName",
        sortable: true,
        value: "firstName",
        default: "aa",
        rules: "required"
      },
      {
        text: "lastName",
        sortable: true,
        value: "lastName",
        default: "aa",
        rules: "required"
      },
      {
        text: "age",
        sortable: true,
        value: "age",
        default: "0",
        rules: "required|numeric"
      },
      {
        text: "roles",
        sortable: false,
        value: "roles",
        default: "read"
      }
    ]
  },
  Role: {
    relations: "",
    permissions: { open: true },
    authorities: { creatable: true, editable: false, deletable: false },
    headers: () => [
      { text: "id", sortable: true, value: "id" },
      {
        text: "role",
        sortable: true,
        value: "role",
        default: "default"
      }
    ]
  },
  Book: {
    relations: "",
    permissions: { read: "extension_ReadBook", write: "extension_WriteBook" },
    authorities: { creatable: true, editable: true, deletable: true },
    headers: () => [
      { text: "id", sortable: true, value: "id" },
      {
        text: "title",
        sortable: true,
        value: "title",
        rules: "required"
      },
      {
        text: "author",
        sortable: true,
        value: "author",
        rules: "required"
      },
      {
        text: "publish_at",
        sortable: true,
        value: "publish_at"
      }
    ]
  }
};
