import {ERequestMethods} from "./ERequestMethods";
import {Webserver} from "./Webserver";
import {Request, Response} from "express";

/**
 * API Endpoint base class
 */
export class Endpoint {
  path: string = "";
  method: number = +ERequestMethods.GET;

  /**
   * Attaches the endpoint to the webserver
   * @param webserver Webserver instance
   */
  attachToWebserver = (webserver: Webserver) => {
    switch (this.method) {
      case +ERequestMethods.GET:
        webserver.getExpressApp().get(this.path, this.expressHandler);
        console.log(`Registered endpoint: GET    ${this.path}`);
        break;

      case +ERequestMethods.POST:
        webserver.getExpressApp().post(this.path, this.expressHandler);
        console.log(`Registered endpoint: POST   ${this.path}`);
        break;

      case +ERequestMethods.PUT:
        webserver.getExpressApp().put(this.path, this.expressHandler);
        console.log(`Registered endpoint: PUT    ${this.path}`);
        break;

      case +ERequestMethods.PATCH:
        webserver.getExpressApp().patch(this.path, this.expressHandler);
        console.log(`Registered endpoint: PATCH  ${this.path}`);
        break;

      case +ERequestMethods.DELETE:
        webserver.getExpressApp().delete(this.path, this.expressHandler);
        console.log(`Registered endpoint: DELETE ${this.path}`);
        break;
    }
  };

  /**
   * Express handler used to log requests
   * @param req Request Express object
   * @param res Response Express object
   */
  expressHandler = (req: Request, res: Response) => {
    console.log(`Request from ${req.ip} (${new Date().toISOString()}): ${req.method} ${this.path}`);

    this.handle(req, res);
  }

  /**
   * Express handler function to be used by endpoint subclass
   * @param req Request Express object
   * @param res Response Express object
   */
  handle = (req: Request, res: Response) => {
    return;
  };
}
