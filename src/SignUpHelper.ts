import axios, { AxiosResponse } from "axios";
import { readWritePerm, signUpDataPerm } from "./@types/request";
import { BDate } from "@codianz/better-date";
import { Application } from "./Application";
import { mergeMap, take } from "rxjs/operators";
import { BehaviorSubject, from, NEVER, Observable, of } from "rxjs";

type Token = {
  token_type: string;
  expires_in: number;
  ext_expires_in?: number;
  access_token: string;
  expires_at: BDate;
};
const getGraphTokenUrl = "http://localhost:7081/api/GraphApiToken";

const graphApiToken = new BehaviorSubject<Token | undefined>(undefined);

export const getGraphToken = (): Observable<Token> => {
  // prettier-ignore
  return graphApiToken.asObservable()
  .pipe(mergeMap((token) => {
    if(!token){
      return Application.Instance.getTokenHeader()
      .pipe(mergeMap((headers) => {
        return from(axios({
          method:"POST",
          url: getGraphTokenUrl,
          headers
        }));
      }))
      .pipe(mergeMap((resp: AxiosResponse)=>{
        const x = resp.data as Omit<Token, "expires_at">;
        const t: Token = {
          ...x,
          expires_at: BDate.now.addSeconds(x.expires_in -1000)
        };
        graphApiToken.next(t);
        return NEVER;
      }));
    }
    else{
      if(token.expires_at.time < BDate.now.time){
        graphApiToken.next(undefined);
        return NEVER;
      }
      return of(token);
    }
  }))
  .pipe(take(1));
};

export const signUp = async (data: signUpDataPerm) => {
  // prettier-ignore
  return getGraphToken()
  .pipe(mergeMap((token) => {
    const config = {
      headers: {
        "Content-Type": "application/JSON",
        Authorization: `Bearer ${token.access_token}`
      }
    };
    return from(axios.post("https://graph.microsoft.com/v1.0/users", data, config))
  })).toPromise();
};

export const update = async (data: readWritePerm, id: string) => {
  // prettier-ignore
  return getGraphToken()
    .pipe(mergeMap((token) => {
      const config = {
        headers: {
          "Content-Type": "application/JSON",
          Authorization: `Bearer ${token.access_token}`
        }
      };
      return from(axios.patch(`https://graph.microsoft.com/v1.0/users/${id}`, data, config))
    })).toPromise();
};

export const getList = async () => {
  // prettier-ignore
  return getGraphToken()
    .pipe(mergeMap((token) => {
        const config = {
          headers: {
            Authorization: `Bearer ${token.access_token}`
          }
        };
        return from(axios.get("https://graph.microsoft.com/beta/users", config));
    })).toPromise();
};
