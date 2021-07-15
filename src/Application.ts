import { AzureClientAuth, client_setting_t } from "./AzureClientAuth";
import { map } from "rxjs/operators";
import { from } from "rxjs";

export class Application {
  private static sFuncInstance = () => {
    const instane = new Application();
    Application.sFuncInstance = () => instane;
    return instane;
  };

  public static get Instance() {
    return Application.sFuncInstance();
  }

  private m_auth?: AzureClientAuth;
  public get Auth() {
    if (!this.m_auth) {
      const setting: client_setting_t = {
        issuerDomain: "codianzeval.b2clogin.com",
        b2cDomain: "codianzeval.onmicrosoft.com",
        clientId: "881fab39-5488-4d6a-927d-0dad6a784889",
        flowName: "B2C_1_SIGNIN",
        apiScopeUris: [
          "https://codianzeval.onmicrosoft.com/881fab39-5488-4d6a-927d-0dad6a784889/auth"
        ],
        // redirectUri: `${location.protocol}//${location.host}/`,
        redirectUri: `http://localhost:8080/`,
        mode: "popup",
        cacheLocation: "sessionStorage"
      };
      this.m_auth = new AzureClientAuth(setting);
    }
    return this.m_auth;
  }
  public get getAccount() {
    return this.m_auth?.getAccount();
  }

  public get getTokenHeader() {
    return from(Application.Instance.Auth.getToken()).pipe(
      map((res) => {
        if (!res) throw Error("!res");
        return {
          Authorization: `Bearer ${res.accessToken}`
        };
      })
    );
  }
}
