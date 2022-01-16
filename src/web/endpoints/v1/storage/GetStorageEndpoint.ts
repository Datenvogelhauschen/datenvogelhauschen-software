import {Endpoint} from "../../../Endpoint";
import {ERequestMethods} from "../../../ERequestMethods";
import {Request, Response} from "express";
import checkDiskSpace from "check-disk-space";

/**
 * GET /v1/storage
 * Returns storage information
 */
export class GetStorageEndpoint extends Endpoint {
  path = "/v1/storage";
  method = +ERequestMethods.GET;

  handle = async (req: Request, res: Response) => {
    const space = await checkDiskSpace("/");

    console.log(`Read disk space: ${space.free} B free of ${space.size} B total`);

    res.json({
      freeMb: space.free / 1000000,
      sizeMb: space.size / 1000000
    });
  }
}
