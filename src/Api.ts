import * as entity from "./entity";
import { Observable } from "rxjs";
import { FindManyOptions } from "typeorm";

export interface list_t<T extends entity.entity_name_t> {
  opcode: "list";
  model: T;
  opt?: FindManyOptions<entity.entity_map_t[T]>;
}

export type listopt_t<T extends entity.entity_name_t> = Omit<
  list_t<T>,
  "opcode" | "model"
>;

export interface Api {
  list<T extends entity.entity_name_t>(
    model: T,
    opt: listopt_t<T>
  ): Observable<entity.entity_map_t[T][]>;
}
