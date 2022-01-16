import {Endpoint} from "../../../Endpoint";
import {ERequestMethods} from "../../../ERequestMethods";
import {Request, Response} from "express";
import {Datenvogelhauschen} from "../../../../Datenvogelhauschen";

/**
 * PATCH /v1/settings
 * Patches user settings
 */
export class PatchSettingsEndpoint extends Endpoint {
  path = "/v1/settings";
  method = +ERequestMethods.PATCH;

  handle = (req: Request, res: Response) => {
    Datenvogelhauschen.USER_SETTINGS = {
      dataSharing: {
        weather: req.body.dataSharing.weather,
        bird: req.body.dataSharing.bird,
        camera: req.body.dataSharing.camera
      },
      localData: {
        saveLocally: req.body.localData.saveLocally
      }
    };

    Datenvogelhauschen.writeUserSettings();

    res.json(
      Datenvogelhauschen.USER_SETTINGS
    );
  }
}
