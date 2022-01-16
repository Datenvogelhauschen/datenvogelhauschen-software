import {Endpoint} from "../../../Endpoint";
import {ERequestMethods} from "../../../ERequestMethods";
import {Request, Response} from "express";
import {FaultReporter} from "../../../../sensors/faults/FaultReporter";
import {Datenvogelhauschen} from "../../../../Datenvogelhauschen";
import version from "../../../../version";

/**
 * GET /v1/deviceInfo
 * Returns device and software info
 */
export class GetDeviceInfoEndpoint extends Endpoint {
  path = "/v1/deviceInfo";
  method = +ERequestMethods.GET;

  handle = (req: Request, res: Response) => {
    res.json({
      serialHash: Datenvogelhauschen.SERIAL_NUMBER_SHA1,
      version: {
        major: version.softwareVersionMajor,
        minor: version.softwareVersionMinor,
        commit: version.softwareVersionCommit,
        notVersioned: version.notVersioned
      }
    });
  }
}
