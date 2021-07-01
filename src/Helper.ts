import { FindConditions, FindManyOptions } from "typeorm";
import * as entity from "./entity";
import axios from "axios";
import { DataTableHeader } from "vuetify";

type OrderDesc = "ASC" | "DESC" | 1 | -1 | undefined;
type Options = {
  entityName: entity.EntityName;
  order?: {};
  orderby: string;
  orderdesc: OrderDesc;
  where?: FindConditions<entity.EntityMap>;
  searchColumn: entity.EntityName;
  searchText: string;
  skip: number;
  take: number;
};

const crud_url = "http://localhost:7071/api/GetList";

export async function getList(opt: Options) {
  let res;
  opt.where = createSearch(opt.entityName, opt.searchColumn, opt.searchText);
  opt.order = createOrder(opt.entityName, opt.orderby, opt.orderdesc);
  const query = createQuery(opt);
  await axios
    .get(crud_url, { params: createReq(opt.entityName, query) })
    .then((response) => {
      res = response;
    })
    .catch((e) => {
      res = e.response.data.message;
    });
  return res;
}

const createReq = (
  entityName: entity.EntityName,
  query: {}
): entity.Request => {
  return { entity: entityName, query: query };
};

function createQuery(opt: Options): FindManyOptions {
  return {
    where: opt.where,
    order: opt.order,
    skip: opt.skip,
    take: opt.take
  };
}

function createSearch(
  entityName: entity.EntityName,
  searchColumn: string,
  searchText: string
) {
  let where = {};
  const headerValues = (
    entity.ListDescriptions[entityName].headers() as any
  ).map((x: DataTableHeader) => x.value);
  headerValues.forEach((value: string) => {
    if (Object.keys(where).length > 0) return;
    if (value === searchColumn) {
      where = { [searchColumn]: `${searchText}` };
    }
  });
  return where;
}
function createOrder(
  entityName: entity.EntityName,
  orderby: string,
  orderdesc: OrderDesc
) {
  let order = {};
  // prettier-ignore
  const headerValues = (entity.ListDescriptions[entityName].headers()as any).map((x:DataTableHeader) => x.value);
  headerValues.forEach((value: string) => {
    if (Object.keys(order).length > 0) return;
    if (value === orderby) {
      order = { [orderby]: orderdesc };
    }
  });
  return order;
}
