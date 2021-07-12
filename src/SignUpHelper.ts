import axios from "axios";
import {
  readWritePerm,
  SignUpDataBase,
  signUpDataPerm
} from "./@types/request";
import { BDate } from "@codianz/better-date";

const apiSettings = {
  clientID: "eb302753-85e4-4f90-869d-8dc887dfc70c",
  objectID: "a83e380b-6fab-4c56-9ba4-255df8f2935c",
  tenantID: "b233f6b1-68d6-45bf-a739-66ea5be95584",
  secretID: "f3aab7a5-3211-43fe-90c9-b2ec49cf3933",
  secretValue: "Q9xeGJ3-SaujhfRa_PSnop2sx.r4~SyKl8",
  issuerDomain: "codianzeval.b2clogin.com",
  b2cDomain: "codianzeval.onmicrosoft.com",
  apiScopeName: "User.ReadWrite.All",
  apiScopeUri:
    "https://codianzeval.onmicrosoft.com/eb302753-85e4-4f90-869d-8dc887dfc70c/User.ReadWrite.All",
  flowName: "B2C_1_SIGNIN",
  accessToken:
    "eyJ0eXAiOiJKV1QiLCJub25jZSI6ImdDbHhNb1JnM0o5Y2lwbVpOOUU5ZkpXbm5CeTdBcDBPeG5GdHdNams2ZjgiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyIsImtpZCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyJ9.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9iMjMzZjZiMS02OGQ2LTQ1YmYtYTczOS02NmVhNWJlOTU1ODQvIiwiaWF0IjoxNjI2MDg3MTUwLCJuYmYiOjE2MjYwODcxNTAsImV4cCI6MTYyNjA5MTA1MCwiYWlvIjoiRTJaZ1lFamN2c2FpcFVWMXd4d3hybmUvOUY0WEFBQT0iLCJhcHBfZGlzcGxheW5hbWUiOiJncmFwaF9hcGlfdGVzdCIsImFwcGlkIjoiZWIzMDI3NTMtODVlNC00ZjkwLTg2OWQtOGRjODg3ZGZjNzBjIiwiYXBwaWRhY3IiOiIxIiwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvYjIzM2Y2YjEtNjhkNi00NWJmLWE3MzktNjZlYTViZTk1NTg0LyIsImlkdHlwIjoiYXBwIiwib2lkIjoiODY1MGY1ZDAtYWE1ZC00ZmY2LWEwNDUtYzIxNGIzYTI3NGFiIiwicmgiOiIwLkFUOEFzZll6c3Rab3YwV25PV2JxVy1sVmhGTW5NT3ZraFpCUGhwMk55SWZmeHd3X0FBQS4iLCJyb2xlcyI6WyJVc2VyLlJlYWRXcml0ZS5BbGwiXSwic3ViIjoiODY1MGY1ZDAtYWE1ZC00ZmY2LWEwNDUtYzIxNGIzYTI3NGFiIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IkFTIiwidGlkIjoiYjIzM2Y2YjEtNjhkNi00NWJmLWE3MzktNjZlYTViZTk1NTg0IiwidXRpIjoiZlNCQVQ4Mk83MEc4THBOVEdxUk9BdyIsInZlciI6IjEuMCIsIndpZHMiOlsiMDk5N2ExZDAtMGQxZC00YWNiLWI0MDgtZDVjYTczMTIxZTkwIl0sInhtc190Y2R0IjoxNjI1NzQ0NTk3fQ.fPXg27sx0e59Pj81clOntGOcdBHRVEVoDTQqAPfjc2BmJPCUe0JnA3C2KwMUNt175RuLCxWZMyTm9WbqiXH8bX_kezT6syCx-XYnqiEIbiyFGC4KCZuVAd1tXPavL-yyxJYKAdC-ku8wydMtl3g3QwNIeLKt1-IFzeJv9kbIbihJbS1cR8-CMbLsL1aoIxKTEox41JmHExzEp3LDWeLxaus7BPbSxey-fK5EL2KBqEEhAkizb8ShWO5RqmckHfFvt8wWA3LRujk8I0Bs7uHL4_k-QvyWGC__KkoGCVmzoyt7Ir-oSwwMfdABPwHniyd_-EaXo9CUsVXI2-hk9ZpFkA"
};

type token = {
  token_type: "Bearer";
  expires_in: number;
  ext_expires_in: number;
  access_token: string;
  expires_at?: BDate;
};

let token: token;
export const getToken = async () => {
  const requestData = {
    grant_type: "client_credentials",
    scope: "https%3A%2F%2Fgraph.microsoft.com%2F.default",
    client_id: apiSettings.clientID,
    client_secret: apiSettings.secretValue
  };
  const config = {
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };
  await axios
    .post(
      `https://login.microsoftonline.com/${apiSettings.tenantID}/oauth2/v2.0/token`,
      requestData,
      config
    )
    .then((res) => {
      token = res.data;
      token.expires_at = new BDate(Date()).addMinutes(token.expires_in - 1000);
    })
    .catch((err) => {
      return err;
    });
};

export const signUp = async (data: signUpDataPerm) => {
  let res;
  const now = new BDate(Date());
  if (!token || token.expires_at! < now) {
    getToken();
  }
  const config = {
    headers: {
      "Content-Type": "application/JSON",
      Authorization: `Bearer ${apiSettings.accessToken}`
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
  const now = new BDate(Date());
  if (!token || token.expires_at! < now) {
    getToken();
  }
  const config = {
    headers: {
      "Content-Type": "application/JSON",
      Authorization: `Bearer ${apiSettings.accessToken}`
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
  const now = new BDate(Date());
  if (!token || token.expires_at! < now) {
    getToken();
  }
  const config = {
    headers: {
      Authorization: `Bearer ${apiSettings.accessToken}`
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
