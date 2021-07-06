import * as entity from "../entity";

export type RequestBase = {
  entityName: entity.EntityName;
  relations: string;
};
export type FindRequestOptions = RequestBase & {
  orderby: string;
  orderdesc: "ASC" | "DESC" | undefined;
  searchColumn: entity.EntityName;
  searchType: string;
  searchText: string;
  skip: number;
  take: number;
};
export type DeleteRequestOptions = RequestBase & {
  deleteItem: string;
};
export type SaveRequestOptions = RequestBase & {};
