import axios from "axios";
import { readWritePerm, signUpDataPerm } from "./@types/request";
import { BDate } from "@codianz/better-date";

type Token = {
  token_type: string;
  expires_in: number;
  ext_expires_in?: number;
  access_token: string;
  expires_at?: BDate;
};
const getTokenUrl = "http://localhost:7081/api/GraphApiToken";

let Defaulttoken: Token;
export const getToken = async () => {
  let token;
  const now = new BDate(Date.now());
  if (!Defaulttoken || Defaulttoken.expires_at!.time < now.time) {
    await axios
      .get(getTokenUrl)
      .then((res) => {
        Defaulttoken = res.data;
        Defaulttoken.expires_at = new BDate(Date.now()).addSeconds(
          Defaulttoken.expires_in - 1000
        );
        token = Defaulttoken.access_token;
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    token = Defaulttoken.access_token;
  }
  return token;
};

export const signUp = async (data: signUpDataPerm) => {
  let res;
  const config = {
    headers: {
      "Content-Type": "application/JSON",
      Authorization: `Bearer ${await getToken()}`
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
      Authorization: `Bearer ${await getToken()}`
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
      Authorization: `Bearer ${await getToken()}`
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
