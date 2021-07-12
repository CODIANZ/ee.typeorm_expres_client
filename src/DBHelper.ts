import { FindRequestOptions, DeleteRequestOptions } from "./@types/request";
import axios from "axios";

const crud_url = "http://localhost:7081/api/DBCrud";

export async function getList(opt: FindRequestOptions) {
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

export async function deleteItem(opt: DeleteRequestOptions) {
  let res;
  await axios
    .delete(crud_url, { params: opt })
    .then((response) => {
      res = response;
    })
    .catch((e) => {
      res = e.response.data.message;
    });
  return res;
}

export async function updateItem(opt: any) {
  let res;
  await axios
    .post(crud_url, opt)
    .then((response) => {
      res = response;
    })
    .catch((e) => {
      res = e.response.data.message;
    });
  return res;
}
