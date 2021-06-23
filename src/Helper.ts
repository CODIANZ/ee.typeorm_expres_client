import { DataTableHeader } from "vuetify";
import { FindManyOptions } from "typeorm";
import * as entity from "./entity";
import { Observable, of } from "rxjs";
import { Application } from "./Application";
import { map, tap } from "rxjs/operators";
import axios from "axios";
import { AxiosResponse } from "axios";

const crud_url = "http://localhost:3000/";

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

type orderdesc_t = "ASC" | "DESC" | 1 | -1 | undefined;
type opt_t = {
  entityName: entity.entity_name_t;
  order?: {};
  orderby: string;
  orderdesc: orderdesc_t;
  skip: number;
  take?: number;
};

export const getList = (opt: opt_t): AxiosResponse => {
  let res: any;
  opt.order = createOrder(opt.entityName, opt.orderby, opt.orderdesc);
  const query = createListOptions(opt);
  res = axios
    .post(crud_url, createReq(opt.entityName, query))
    .then((response) => {
      res = response;
    })
    .catch((e) => {
      res = e;
    });
  return res;
};

const createReq = (entityName: entity.entity_name_t, query: {}) => {
  return { entity: entityName, query: query };
};

function createOrder(
  entityName: entity.entity_name_t,
  orderby: string,
  orderdesc: orderdesc_t
) {
  // prettier-ignore
  switch (entityName) {
    case "User":
      switch (orderby) {
        case "id":return { id: orderdesc };
        case "age":return { age: orderdesc };
        case "firstName":return { firstName: orderdesc };
        case "lastName":return { lastName: orderdesc };
      }
    case "Book":
      switch (orderby) {
        case "id":return { id: orderdesc };
        case "title":return { title: orderdesc };
        case "author":return { author: orderdesc };
        case "publish_at":return { publish_at: orderdesc };
      }
  }
}

function createListOptions(opt: opt_t): FindManyOptions {
  return { order: opt.order, skip: opt.skip, take: opt.take ? opt.take : 10 };
}

// function createOptions<B, E>(b: B, e?: E, skip?: number, take?: number) {
//   return { skip, take, ...b, ...e };
// }
// export const GetList: {
//   [E in entity.entity_name_t]: (
//     opt?: FindManyOptions<entity.entity_map_t[E]>,
//     skip?: number,
//     take?: number
//   ) => Observable<entity.entity_map_t[E][]>;
// } = {
//   User: (opt?: FindManyOptions<entity.User>, skip?: number, take?: number) => {
//     return Application.Instance.Api.list("User", {
//       opt: {
//         ...createOptions(
//           ListDescriptions["User"].basicOptions(),
//           opt,
//           skip,
//           take
//         )
//       }
//     });
//   },
//   Book: (opt?: FindManyOptions<entity.Book>, skip?: number, take?: number) => {
//     return Application.Instance.Api.list("Book", {
//       opt: {
//         ...createOptions(
//           ListDescriptions["Book"].basicOptions(),
//           opt,
//           skip,
//           take
//         )
//       }
//     });
//   }
// };

export const GetListTitle: {
  [M in entity.entity_name_t]: () => string;
} = {
  User: () => "ユーザー",
  Book: () => "本"
};
