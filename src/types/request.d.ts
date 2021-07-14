import * as entity from "../entity";
import { extensionAttributes } from "./views/SignUp.vue";
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
  mail: string;
  passwordProfile: {
    forceChangePasswordNextSignIn: boolean;
    password: string;
  };
};
export type readWritePerm = {
  [extensionAttributes.ReadBook]: boolean;
  [extensionAttributes.ReadAccount]: boolean;
  [extensionAttributes.WriteBook]: boolean;
  [extensionAttributes.WriteAccount]: boolean;
};
export type signUpDataPerm = SignUpDataBase & readWritePerm;
