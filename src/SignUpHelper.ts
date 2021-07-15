import axios, { AxiosResponse } from "axios";
import { readWritePerm, signUpDataPerm } from "./@types/request";
import { BDate } from "@codianz/better-date";
import { Application } from "./Application";
import { map, mergeMap } from "rxjs/operators";
import { from, Observable } from "rxjs";
import { doSubscribe } from "@codianz/rx";

type Token = {
  token_type: string;
  expires_in: number;
  ext_expires_in?: number;
  access_token: string;
  expires_at?: BDate;
};
const getGraphTokenUrl = "http://localhost:7081/api/GraphApiToken";

let Defaulttoken: Token;

// export const getGraphToken = () => {
//   const now = new BDate(Date.now());
//   if (!Defaulttoken || Defaulttoken.expires_at!.time < now.time) {
//     // prettier-ignore
//     return from(Application.Instance.getTokenHeader())
//     .pipe(mergeMap((headers) => {
//       return from (axios({
//         method:"post",
//         url:getGraphTokenUrl,
//         headers
//       }));
//     }))
//     .pipe(map((res:AxiosResponse) => {
//       Defaulttoken = res.data;
//       Defaulttoken.expires_at = new BDate(Date.now()).addSeconds(
//           Defaulttoken.expires_in - 1000
//         );
//     }));
//   }
//   return Defaulttoken.access_token;
// };

export const getGraphToken = async () => {
  const now = new BDate(Date.now());
  if (!Defaulttoken || Defaulttoken.expires_at!.time < now.time) {
    Application.Instance.Auth.getToken().then((res) => {
      axios({
        url: getGraphTokenUrl,
        method: "POST",
        headers: {
          Authorization: `Bearer ${res!.accessToken}`
        }
      })
        .then((res) => {
          Defaulttoken = res.data;
          Defaulttoken.expires_at = new BDate(Date.now()).addSeconds(
            Defaulttoken.expires_in - 1000
          );
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
  return Defaulttoken.access_token;
};

export const signUp = async (data: signUpDataPerm) => {
  let res;
  const config = {
    headers: {
      "Content-Type": "application/JSON",
      Authorization: `Bearer ${await getGraphToken()}`
    }
  };
  await axios
    .post("https://graph.microsoft.com/v1.0/users", data, config)
    .then((response) => {
      res = response;
    })
    .catch((err) => {
      res = err;
    });
  return res;
};

export const update = async (data: readWritePerm, id: string) => {
  let res;
  const config = {
    headers: {
      "Content-Type": "application/JSON",
      Authorization: `Bearer ${await getGraphToken()}`
    }
  };
  await axios
    .patch(`https://graph.microsoft.com/v1.0/users/${id}`, data, config)
    .then((response) => {
      res = response;
    })
    .catch((err) => {
      res = err;
    });
  return res;
};

export const getList = async () => {
  let res;
  const config = {
    headers: {
      Authorization: `Bearer ${await getGraphToken()}`
    }
  };
  await axios
    .get("https://graph.microsoft.com/beta/users", config)
    .then((response) => {
      res = response;
    })
    .catch((err) => {
      res = err;
    });
  return res;
};
