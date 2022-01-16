import {Endpoint} from "../../../Endpoint";
import {ERequestMethods} from "../../../ERequestMethods";
import {Request, Response} from "express";
import {Camera} from "../../../../camera/Camera";

/**
 * GET /v1/camera
 * Returns JPEG camera image
 */
export class GetCameraEndpoint extends Endpoint {
  path = "/v1/camera";
  method = +ERequestMethods.GET;

  camera: Camera;

  constructor(camera: Camera) {
    super();

    this.camera = camera;
  }

  handle = (req: Request, res: Response) => {
    res.sendFile(this.camera.getStampedPhotoPath());
  }
}
