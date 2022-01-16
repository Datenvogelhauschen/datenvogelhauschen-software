import {Endpoint} from "../../../../Endpoint";
import {ERequestMethods} from "../../../../ERequestMethods";
import {Request, Response} from "express";
import fs from "fs";
import constants from "../../../../../constants";
import {SensorDatabase} from "../../../../../database/SensorDatabase";

/**
 * GET /v1/actions/purgeLocalData
 * Deletes local files
 */
export class GetPurgeLocalDataEndpoint extends Endpoint {
  path = "/v1/actions/purgeLocalData";
  method = +ERequestMethods.GET;

  database: SensorDatabase;

  constructor(database: SensorDatabase) {
    super();

    this.database = database;
  }

  handle = (req: Request, res: Response) => {
    fs.rmSync(constants.filepaths.camera_captures, {
      recursive: true,
      force: true
    });

    fs.mkdirSync(constants.filepaths.camera_captures);

    this.database.close();

    fs.rmSync(constants.filepaths.database, {
      force: true
    });

    this.database.open();

    console.log(`Purged all local data!`);

    res.json({
      deleted: true
    });
  }
}
