import * as msal from "@azure/msal-browser";

// prettier-ignore
export type client_setting_t = {
  clientId: string;       /** アプリケーション (クライアント) ID */
  issuerDomain: string;   /** issuer domain */
  b2cDomain: string;      /** b2c domain */
  flowName: string;       /** ユーザーフロー名 */
  apiScopeUris: string[]; /** スコープ URI */
  redirectUri: string;    /** リダイレクト URI */
  cacheLocation: "sessionStorage" | "localStorage";
  mode: "redirect" | "popup";
};

export class AzureClientAuth {
  private m_setting: client_setting_t;

  private get setting() {
    return this.m_setting;
  }

  constructor(setting: client_setting_t) {
    this.m_setting = setting;
  }

  private get msalConfig(): msal.Configuration {
    return {
      auth: {
        clientId: this.setting.clientId, // アプリケーション（クライアント）ＩＤ
        authority: `https://${this.setting.issuerDomain}/${this.setting.b2cDomain}/${this.setting.flowName}`,
        knownAuthorities: [this.setting.issuerDomain],
        redirectUri: this.setting.redirectUri
      },
      cache: {
        cacheLocation: this.setting.cacheLocation,
        storeAuthStateInCookie: false
      },
      system: {
        loggerOptions: {
          loggerCallback: (
            level: number,
            message: string,
            containsPii: any
          ) => {
            if (containsPii) {
              return;
            }
            switch (level) {
              case msal.LogLevel.Error:
                console.error(message);
                return;
              case msal.LogLevel.Info:
                console.info(message);
                return;
              case msal.LogLevel.Verbose:
                console.debug(message);
                return;
              case msal.LogLevel.Warning:
                console.warn(message);
                return;
            }
          }
        }
      }
    };
  }

  private m_msalObj?: msal.PublicClientApplication;
  private get msalObj() {
    if (!this.m_msalObj) {
      this.m_msalObj = new msal.PublicClientApplication(this.msalConfig);
    }
    return this.m_msalObj;
  }

  private get authReq(): msal.RedirectRequest {
    return {
      scopes: ["openid", "profile", ...this.setting.apiScopeUris]
    };
  }

  private get logoffReq(): msal.EndSessionPopupRequest {
    return {
      postLogoutRedirectUri: this.setting.redirectUri,
      mainWindowRedirectUri: this.setting.redirectUri
    };
  }

  private get tokenReq(): msal.SilentRequest {
    return {
      scopes: [...this.authReq.scopes],
      forceRefresh: false
    };
  }

  private signInWithRedirect() {
    return this.msalObj.handleRedirectPromise().then((resp) => {
      if (resp && resp.account) {
        this.selectAccount();
      } else {
        const currentAccounts = this.msalObj.getAllAccounts();
        if (currentAccounts.length === 0) {
          this.msalObj.loginRedirect(this.authReq);
        } else {
          this.selectAccount();
        }
      }
      return this.getAccount();
    });
  }

  private signInWithPopup() {
    return this.msalObj.loginPopup(this.authReq).then((authResult) => {
      this.selectAccount();
      return this.getAccount();
    });
  }

  private signOutWithRedirect() {
    this.clearAccount();
    return this.msalObj.logoutRedirect(this.logoffReq);
  }

  private signOutWithPopup() {
    this.clearAccount();
    return this.msalObj.logoutPopup(this.logoffReq);
  }

  private m_selectedAccount?: msal.AccountInfo;

  private setAccount(account: msal.AccountInfo) {
    this.msalObj.setActiveAccount(account ?? null);
    this.m_selectedAccount = account;
  }

  private clearAccount() {
    this.msalObj.setActiveAccount(null);
    this.m_selectedAccount = undefined;
  }

  public getAccount() {
    return this.m_selectedAccount;
  }

  private selectAccount() {
    const currentAccounts = this.msalObj.getAllAccounts();
    if (currentAccounts.length == 0) {
      return;
    } else if (currentAccounts.length == 1) {
      this.setAccount(currentAccounts[0]);
    } else {
      const accounts = currentAccounts.filter(
        (account) =>
          account.homeAccountId
            .toUpperCase()
            .includes(this.setting.flowName.toUpperCase()) &&
          account.idTokenClaims !== undefined &&
          ((account.idTokenClaims as any).iss as string)
            .toUpperCase()
            .includes(this.setting.issuerDomain.toUpperCase()) &&
          ((account.idTokenClaims as any).aud as string) ===
            this.msalConfig.auth.clientId
      );
      console.log(currentAccounts);
      console.log(accounts);
      if (
        accounts.every(
          (account) => account.localAccountId === accounts[0].localAccountId
        )
      ) {
        this.setAccount(accounts[0]);
      } else {
        this.signOut();
      }
    }
  }

  public signIn() {
    if (this.setting.mode == "redirect") {
      return this.signInWithRedirect();
    } else {
      return this.signInWithPopup();
    }
  }

  public signOut() {
    this.clearAccount();
    if (this.setting.mode == "redirect") {
      return this.signOutWithRedirect();
    } else {
      return this.signOutWithPopup();
    }
  }

  public getToken() {
    const tokenReq = this.tokenReq;
    tokenReq.account = this.getAccount();
    return this.msalObj
      .acquireTokenSilent(this.tokenReq)
      .then((response) => {
        if (!response.accessToken || response.accessToken === "") {
          throw new msal.InteractionRequiredAuthError();
        }
        return response;
      })
      .catch((error) => {
        if (error instanceof msal.InteractionRequiredAuthError) {
          return this.msalObj
            .acquireTokenPopup(tokenReq)
            .then((response) => {
              console.log(response);
              return response;
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          console.log(error);
        }
      });
  }
}

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
}
