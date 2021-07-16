import { FindRequestOptions, DeleteRequestOptions } from "./@types/request";
import axios from "axios";
import { mergeMap, take } from "rxjs/operators";
import { BehaviorSubject, from, NEVER, Observable, of } from "rxjs";
import { Application } from "./Application";

const crud_url = "http://localhost:7081/api/DBCrud";

export const getList = (opt: FindRequestOptions) => {
  // prettier-ignore
  return Application.Instance.getTokenHeader()
  .pipe(mergeMap((headers) => {
    return from(axios({
      url: crud_url,
      method:"GET",
      headers,
      params:opt
    })
  )})).toPromise()
};

export async function deleteItem(opt: DeleteRequestOptions) {
  // prettier-ignore
  return Application.Instance.getTokenHeader()
    .pipe(mergeMap((headers) => {
      return from(axios({
        url: crud_url,
        method:"DELETE",
        headers,
        params: opt
      })
    )})).toPromise()
}

export async function updateItem(opt: any) {
  // prettier-ignore
  return Application.Instance.getTokenHeader()
  .pipe(mergeMap((headers) => {
    return from(axios({
      url: crud_url,
      method:"POST",
      headers,
      data:opt
    })
  )})).toPromise()
}
