import * as entity from "../entity";

export type RequestBase = {
  entityName: entity.EntityName;
  relations?: {};
};
export type FindRequestOptions = RequestBase & {
  orderby?: string;
  orderdesc?: "ASC" | "DESC" | undefined;
  searchColumn?: string;
  searchType?: string;
  searchText?: string;
  skip?: number;
  take?: number;
};
export type DeleteRequestOptions = RequestBase & {
  deleteItem: string;
};
export type SaveRequestOptions = RequestBase & {};

export type SignUpDataBase = {
  accountEnabled: boolean;
  displayName: string;
  mailNickname: string;
  userPrincipalName: string;
  passwordProfile: {
    forceChangePasswordNextSignIn: boolean;
    password: string;
  };
};
export type readWritePerm = {
  extension_d682a04f5b2c4876914713579fdf1e26_ReadBook: boolean;
  extension_d682a04f5b2c4876914713579fdf1e26_ReadUser: boolean;
  extension_d682a04f5b2c4876914713579fdf1e26_WriteBook: boolean;
  extension_d682a04f5b2c4876914713579fdf1e26_WriteUser: boolean;
};
export type signUpDataPerm = SignUpDataBase &
  readWritePerm & {
    extension_d682a04f5b2c4876914713579fdf1e26_createUser: boolean;
  };
