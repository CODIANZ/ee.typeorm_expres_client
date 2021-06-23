import { Api, listopt_t, list_t } from "./Api";
import { from, Observable } from "rxjs";
import * as entity from "./entity";
import axios from "axios";
import { map } from "rxjs/operators";

const crud_url = "http://localhost:3000/";
export const createRequestParameter = {
  list: <T extends keyof entity.entity_map_t>(model: T, opt: listopt_t<T>) => {
    const req: list_t<T> = {
      ...opt,
      opcode: "list",
      model: model
    };
    return req;
  }
};
export class Server implements Api {
  list<T extends keyof entity.entity_map_t>(
    model: T,
    opt: listopt_t<T>
  ): Observable<entity.entity_map_t[T][]> {
    // prettier-ignore
    return from(axios.post(crud_url+"list"))
    .pipe(map((x: any) => {
      return x.data as entity.entity_map_t[T][];
    }));
  }
}
