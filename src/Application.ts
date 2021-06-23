import { Api } from "./Api";
import { Server } from "./Server";

export class Application {
  private static sFuncInstance = () => {
    const instane = new Application();
    Application.sFuncInstance = () => instane;
    return instane;
  };

  public static get Instance() {
    return Application.sFuncInstance();
  }
  private m_api: Api = new Server();

  public get Api() {
    return this.m_api;
  }
}
