import { FindManyOptions } from "typeorm";
import { DataTableHeader } from "vuetify";
import { Book } from "./Book";
import { Role } from "./Role";
import { User } from "./User";

export * from "./Book";
export * from "./User";

export type EntityMap = {
  User: User;
  Book: Book;
  Role: Role;
};
export type EntityName = keyof EntityMap;

export const entities = [User, Book];
export const EntityNames: { [E in EntityName]: E } = {
  User: "User",
  Book: "Book",
  Role: "Role"
};
export const GetListTitle: {
  [E in EntityName]: () => string;
} = {
  User: () => "ユーザー",
  Book: () => "本",
  Role: () => "権限"
};
export function isEntity(s: unknown): s is EntityName {
  return typeof s === "string" && s in EntityNames;
}

export interface ExtendedDataTableHeader<T extends any = any>
  extends DataTableHeader {
  editable: boolean;
  default?: string;
  rules?: string;
}
export interface Authority {
  creatable: boolean;
  editable: boolean;
  deletable: boolean;
}
export type ListDescription<T extends EntityName> = {
  relations: string;
  authorities: Authority;
  headers: () => ExtendedDataTableHeader<EntityMap[T]>[];
};
export const ListDescriptions: {
  [E in EntityName]: ListDescription<E>;
} = {
  User: {
    relations: "roles",
    authorities: { creatable: true, editable: true, deletable: true },
    headers: () => [
      { text: "id", sortable: true, editable: false, value: "id" },
      {
        text: "firstName",
        sortable: true,
        editable: true,
        value: "firstName",
        default: "aa",
        rules: "required"
      },
      {
        text: "lastName",
        sortable: true,
        editable: true,
        value: "lastName",
        default: "aa",
        rules: "required"
      },
      {
        text: "age",
        sortable: true,
        editable: true,
        value: "age",
        default: "0",
        rules: "required|numeric"
      },
      {
        text: "role",
        sortable: true,
        editable: true,
        value: "roles[0].role",
        default: "read"
      }
    ]
  },
  Role: {
    relations: "User",
    authorities: { creatable: true, editable: false, deletable: false },
    headers: () => [
      { text: "id", sortable: true, editable: false, value: "id" },
      {
        text: "role",
        sortable: true,
        editable: true,
        value: "role",
        default: "default"
      }
    ]
  },
  Book: {
    relations: "",
    authorities: { creatable: true, editable: true, deletable: true },
    headers: () => [
      { text: "id", sortable: true, editable: false, value: "id" },
      {
        text: "title",
        sortable: true,
        editable: true,
        value: "title",
        rules: "required"
      },
      {
        text: "author",
        sortable: true,
        editable: true,
        value: "author",
        rules: "required"
      },
      {
        text: "publish_at",
        sortable: true,
        editable: true,
        value: "publish_at"
      }
    ]
  }
};
