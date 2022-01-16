import {Endpoint} from "../../../Endpoint";
import {ERequestMethods} from "../../../ERequestMethods";
import {Request, Response} from "express";
import {Datenvogelhauschen} from "../../../../Datenvogelhauschen";

/**
 * GET /v1/settings
 * Returns user settings
 */
export class GetSettingsEndpoint extends Endpoint {
  path = "/v1/settings";
  method = +ERequestMethods.GET;

  handle = (req: Request, res: Response) => {
    res.json(
      Datenvogelhauschen.USER_SETTINGS
    );
  }
}
