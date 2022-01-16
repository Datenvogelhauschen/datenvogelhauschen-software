import {Endpoint} from "../../../../Endpoint";
import {ERequestMethods} from "../../../../ERequestMethods";
import {Request, Response} from "express";
import {exec} from "child_process";

/**
 * GET /v1/actions/shutdown
 * Shuts the raspberry down
 */
export class GetShutdownEndpoint extends Endpoint {
  path = "/v1/actions/shutdown";
  method = +ERequestMethods.GET;

  handle = (req: Request, res: Response) => {
    exec("shutdown -h +1");

    setTimeout(() => {
      process.kill(process.pid, "SIGINT");
    }, 10000);

    console.log(`Full shutdown queued! (1min)`);

    res.json({
      queued: true
    });
  }
}
