import {Endpoint} from "../../../Endpoint";
import {ERequestMethods} from "../../../ERequestMethods";
import {Request, Response} from "express";
import {SensorManager} from "../../../../sensors/SensorManager";

/**
 * GET /v1/sensors
 * Returns sensor data
 */
export class GetSenorsEndpoint extends Endpoint {
  path = "/v1/sensors";
  method = +ERequestMethods.GET;

  sensorManager: SensorManager;

  constructor(sensorManager: SensorManager) {
    super();

    this.sensorManager = sensorManager;
  }

  handle = (req: Request, res: Response) => {
    res.json(this.sensorManager.getSensorReadouts());
  }
}
