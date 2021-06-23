import { DataTableHeader } from "vuetify";
import { FindManyOptions } from "typeorm";
import * as entity from "./entity";
import { Observable, of } from "rxjs";
import { Application } from "./Application";

export type ListDescription<T extends entity.entity_name_t> = {
  basicOptions: () => FindManyOptions<entity.entity_map_t[T]>;
  headers: () => DataTableHeader<entity.entity_map_t[T]>[];
};

export const ListDescriptions: {
  [E in entity.entity_name_t]: ListDescription<E>;
} = {
  User: {
    basicOptions: () => ({
      order: { age: "DESC" }
    }),
    headers: () => [
      { text: "id", sortable: true, value: "id" },
      { text: "firstName", sortable: true, value: "firstName" },
      { text: "lastName", sortable: true, value: "lastName" },
      { text: "age", sortable: true, value: "age" }
    ]
  },
  Book: {
    basicOptions: () => ({}),
    headers: () => [
      { text: "id", sortable: true, value: "id" },
      { text: "title", sortable: true, value: "title" },
      { text: "author", sortable: true, value: "author" },
      { text: "publish_at", sortable: true, value: "publish_at" }
    ]
  }
};

function createOptions<B, E>(b: B, e?: E, skip?: number, take?: number) {
  return { skip, take, ...b, ...e };
}

export const GetList: {
  [E in entity.entity_name_t]: (
    opt?: FindManyOptions<entity.entity_map_t[E]>,
    skip?: number,
    take?: number
  ) => Observable<entity.entity_map_t[E][]>;
} = {
  User: (opt?: FindManyOptions<entity.User>, skip?: number, take?: number) => {
    return Application.Instance.Api.list("User", {
      opt: {
        ...createOptions(
          ListDescriptions["User"].basicOptions(),
          opt,
          skip,
          take
        )
      }
    });
  },
  Book: (opt?: FindManyOptions<entity.Book>, skip?: number, take?: number) => {
    return Application.Instance.Api.list("Book", {
      opt: {
        ...createOptions(
          ListDescriptions["Book"].basicOptions(),
          opt,
          skip,
          take
        )
      }
    });
  }
};

export const GetListTitle: {
  [M in entity.entity_name_t]: () => string;
} = {
  User: () => "ユーザー",
  Book: () => "本"
};
