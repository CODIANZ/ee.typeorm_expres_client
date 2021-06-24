import { DataTableHeader } from "vuetify";
import { FindManyOptions } from "typeorm";
import * as entity from "./entity";
import axios, { AxiosResponse } from "axios";

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
type req_base_t = {
  entity: keyof entity.entity_map_t;
};

type req_user_t = req_base_t & {
  entity: "User";
  query: FindManyOptions<entity.entity_map_t["User"]>;
};

type req_book_t = req_base_t & {
  entity: "Book";
  query: FindManyOptions<entity.entity_map_t["Book"]>;
};

type req_t = req_user_t | req_book_t;

export async function getList(opt: opt_t) {
  let res;
  opt.order = createOrder(opt.entityName, opt.orderby, opt.orderdesc);
  const query = createListOptions(opt);
  await axios({
    method: "post",
    url: crud_url,
    headers: { "Content-Type": "application/json" },
    data: createReq(opt.entityName, query)
  })
    .then((response) => {
      res = response;
    })
    .catch((e) => {
      res = e.response.data.message;
    });
  return res;
}

const createReq = (entityName: entity.entity_name_t, query: {}): req_t => {
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

export const GetListTitle: {
  [M in entity.entity_name_t]: () => string;
} = {
  User: () => "ユーザー",
  Book: () => "本"
};
