import {Endpoint} from "../../../../Endpoint";
import {ERequestMethods} from "../../../../ERequestMethods";
import {Request, Response} from "express";
import {exec} from "child_process";

/**
 * GET /v1/actions/restartSoftware
 * Shuts the raspberry down
 */
export class GetRestartSoftwareEndpoint extends Endpoint {
  path = "/v1/actions/restartSoftware";
  method = +ERequestMethods.GET;

  handle = (req: Request, res: Response) => {
    setTimeout(() => {
      exec(`kill -s SIGINT ${process.pid} && sleep 5 && node ${__filename}`);
    }, 10000);

    console.log(`Software restart queued! (10s)`);

    res.json({
      queued: true
    });
  }
}
