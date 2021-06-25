import { FindManyOptions } from "typeorm";
import * as entity from "./entity";
import axios from "axios";

type OrderDesc = "ASC" | "DESC" | 1 | -1 | undefined;
type Options = {
  entityName: entity.EntityName;
  order?: {};
  orderby: string;
  orderdesc: OrderDesc;
  skip: number;
  take?: number;
};

const crud_url = "http://localhost:3000/";

export async function getList(opt: Options) {
  let res;
  opt.order = createOrder(opt.entityName, opt.orderby, opt.orderdesc);
  const query = createQuery(opt);
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

const createReq = (
  entityName: entity.EntityName,
  query: {}
): entity.Request => {
  return { entity: entityName, query: query };
};

function createOrder(
  entityName: entity.EntityName,
  orderby: string,
  orderdesc: OrderDesc
) {
  let order = {};
  // prettier-ignore
  const headerTexts = entity.ListDescriptions[entityName].headers().map((x) => x.text);
  headerTexts.forEach((value) => {
    if (order) return;
    if (value === orderby) {
      order = { orderby: orderdesc };
    }
  });
  return order;
}

function createQuery(opt: Options): FindManyOptions {
  return { order: opt.order, skip: opt.skip, take: opt.take ? opt.take : 10 };
}
