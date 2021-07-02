import * as entity from "./entity";
import axios from "axios";

type OrderDesc = "ASC" | "DESC" | undefined;
type RequestOptions = {
  entityName: entity.EntityName;
  orderby: string;
  orderdesc: OrderDesc;
  searchColumn: entity.EntityName;
  searchText: string;
  skip: number;
  take: number;
};

const crud_url = "http://localhost:7071/api/GetList";

export async function getList(opt: RequestOptions) {
  let res;
  await axios
    .get(crud_url, { params: opt })
    .then((response) => {
      res = response;
    })
    .catch((e) => {
      res = e.response.data.message;
    });
  return res;
}
