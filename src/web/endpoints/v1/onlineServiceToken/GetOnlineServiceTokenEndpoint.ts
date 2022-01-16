import {Endpoint} from "../../../Endpoint";
import {ERequestMethods} from "../../../ERequestMethods";
import {Request, Response} from "express";
import {exec} from "child_process";
import crypto from "crypto";
import {Datenvogelhauschen} from "../../../../Datenvogelhauschen";

/**
 * GET /v1/actions/onlineServiceToken
 * Gets current online service authentication hash
 */
export class GetOnlineServiceTokenEndpoint extends Endpoint {
  path = "/v1/onlineServiceToken";
  method = +ERequestMethods.GET;

  handle = (req: Request, res: Response) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayTimestamp = new Date(year, month, 1).getTime();

    let hash = crypto.createHash("sha1");
    hash.update(Datenvogelhauschen.SERIAL_NUMBER + firstDayTimestamp.toString());
    const currentHash = hash.digest("hex");

    console.log(`Calculated current time-based authentication hash (timestamp: ${firstDayTimestamp}): ${currentHash.substring(0, 5)}...................................`);

    res.json({
      currentHash: currentHash,
      createdFrom: firstDayTimestamp
    });
  }
}
