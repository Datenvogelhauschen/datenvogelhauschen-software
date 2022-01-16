import {Endpoint} from "../../../../Endpoint";
import {ERequestMethods} from "../../../../ERequestMethods";
import {Request, Response} from "express";
import {exec} from "child_process";

/**
 * GET /v1/actions/reboot
 * Reboots the raspberry
 */
export class GetRebootEndpoint extends Endpoint {
  path = "/v1/actions/reboot";
  method = +ERequestMethods.GET;

  handle = (req: Request, res: Response) => {
    exec("shutdown -r -h +1");

    setTimeout(() => {
      process.kill(process.pid, "SIGINT");
    }, 10000);

    console.log(`Full reboot queued! (1min)`);

    res.json({
      queued: true
    });
  }
}
