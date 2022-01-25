import {Endpoint} from "../../../Endpoint";
import {ERequestMethods} from "../../../ERequestMethods";
import {Request, Response} from "express";
import {OnlineServiceTokenHelper} from "../../../../communication/OnlineServiceTokenHelper";

/**
 * GET /v1/actions/onlineServiceToken
 * Gets current online service authentication hash
 */
export class GetOnlineServiceTokenEndpoint extends Endpoint {
  path = "/v1/onlineServiceToken";
  method = +ERequestMethods.GET;

  handle = (req: Request, res: Response) => {
    const hash = OnlineServiceTokenHelper.getCurrentToken();

    res.json({
      currentHash: hash.hash,
      createdFrom: hash.timestamp
    });
  }
}
