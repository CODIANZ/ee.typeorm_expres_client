import axios from "axios";
import { readWritePerm, signUpDataPerm } from "./@types/request";
import { BDate } from "@codianz/better-date";

// type Token = {
//   token_type: "Bearer";
//   expires_in: number;
//   ext_expires_in: number;
//   access_token: string;
//   expires_at?: BDate;
// };
const getTokenUrl = "http://localhost:7081/api/GraphApiToken";

let token: any;
export const getToken = async () => {
  await axios
    .get(getTokenUrl)
    .then((res) => {
      token = res.data;
    })
    .catch((err) => {
      console.log(err);
    });
};

export const signUp = async (data: signUpDataPerm) => {
  let res;
  let config;
  const now = new BDate(Date.now());
  if (!token || token.expires_at! < now) {
    await getToken().then(() => {
      config = {
        headers: {
          "Content-Type": "application/JSON",
          Authorization: `Bearer ${token.access_token}`
        }
      };
    });
  } else {
    config = {
      headers: {
        "Content-Type": "application/JSON",
        Authorization: `Bearer ${token.access_token}`
      }
    };
  }
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
  let config;
  const now = new BDate(Date.now());
  if (!token || token.expires_at! < now) {
    await getToken().then(() => {
      config = {
        headers: {
          "Content-Type": "application/JSON",
          Authorization: `Bearer ${token.access_token}`
        }
      };
    });
  } else {
    config = {
      headers: {
        "Content-Type": "application/JSON",
        Authorization: `Bearer ${token.access_token}`
      }
    };
  }

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
  let config;
  const now = new BDate(Date.now());
  if (!token || token.expires_at! < now) {
    await getToken().then(() => {
      config = {
        headers: {
          Authorization: `Bearer ${token.access_token}`
        }
      };
    });
  } else {
    config = {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    };
  }
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
