import {Endpoint} from "../../../../Endpoint";
import {ERequestMethods} from "../../../../ERequestMethods";
import {Request, Response} from "express";
import fs, {copySync} from "fs-extra";
import constants from "../../../../../constants";
import {execSync} from "child_process";
import {SensorDatabase} from "../../../../../database/SensorDatabase";

/**
 * GET /v1/actions/exportLocalDataToUsb
 * Exports local data to USB device
 */
export class GetExportLocalDataToUsbEndpoint extends Endpoint {
  path = "/v1/actions/exportLocalDataToUsb";
  method = +ERequestMethods.GET;

  database: SensorDatabase;

  constructor(database: SensorDatabase) {
    super();

    this.database = database;
  }

  handle = (req: Request, res: Response) => {
    try {
      console.log(`Creating directory at /mnt/datenvogelhauschen_usb`);
      fs.mkdirSync("/mnt/datenvogelhauschen_usb");
    } catch (e) {}

    try {
      execSync("mount /dev/sda1 /mnt/datenvogelhauschen_usb");
      console.log(`Mounting /dev/sda1 to directory at /mnt/datenvogelhauschen_usb`);
    } catch (e) {
      console.log(`Error while copying data to USB device: ${e}`);

      res.json({
        exported: false,
        error: true
      });

      this.rollback();
      return;
    }

    // Copy current state to avoid IO errors
    this.database.close();

    try {
      console.log(`Copying local database to tmp.sqlite to prevent IO errors`);
      fs.copyFileSync(constants.filepaths.database, "tmp.sqlite");
    } catch (e) {
      console.log(`Error while copying data to USB device: ${e}`);

      res.json({
        exported: false,
        error: true
      });

      this.rollback();
      return;
    }

    this.database.open();

    try {
      console.log(`Copying tmp.sqlite to USB device`);
      fs.copySync("tmp.sqlite", "/mnt/datenvogelhauschen_usb/Sensors.sqlite", {
        overwrite: true
      });
    } catch (e) {
      console.log(`Error while copying data to USB device: ${e}`);

      res.json({
        exported: false,
        error: true
      });

      this.rollback();
      return;
    }

    try {
      console.log(`Deleting tmp.sqlite`);
      fs.rmSync("tmp.sqlite");
    } catch (e) {
      console.log(`Error while copying data to USB device: ${e}`);

      res.json({
        exported: false,
        error: true
      });

      this.rollback();
      return;
    }

    // Copy images. No need to avoid IO errors
    try {
      console.log(`Copying local camera-captures directory to USB device`);
      copySync(constants.filepaths.camera_captures, "/mnt/datenvogelhauschen_usb/CameraCaptures", {
        overwrite: true
      });
    } catch (e) {
      console.log(`Error while copying data to USB device: ${e}`);

      res.json({
        exported: false,
        error: true
      });

      this.rollback();
      return;
    }

    try {
      console.log(`Unmounting /mnt/datenvogelhauschen_usb`);
      execSync("umount /mnt/datenvogelhauschen_usb");
    } catch (e) {
      console.log(`Error while copying data to USB device: ${e}`);

      res.json({
        exported: false,
        error: true
      });

      this.rollback();
      return;
    }

    try {
      console.log(`Deleting /mnt/datenvogelhauschen_usb`);
      fs.rmSync("/mnt/datenvogelhauschen_usb", {
        recursive: true,
        force: true
      });
    } catch (e) {
      console.log(`Error while copying data to USB device: ${e}`);

      res.json({
        exported: false,
        error: true
      });

      this.rollback();
      return;
    }

    res.json({
      exported: true,
      error: false
    });
  }

  rollback = () => {
    console.log(`Rolling back USB mount!`);

    try {
      fs.rmSync("tmp.sqlite");
    } catch (e) {}

    try {
      execSync("umount /mnt/datenvogelhauschen_usb");
    } catch (e) {}

    try {
      fs.rmSync("/mnt/datenvogelhauschen_usb", {
        recursive: true,
        force: true
      });
    } catch (e) {}
  }
}
