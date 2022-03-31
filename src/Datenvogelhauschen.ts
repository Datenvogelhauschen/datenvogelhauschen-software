import fs from "fs";
import {Webserver} from "./web/Webserver";
import {IConfiguration} from "./IConfiguration";
import {GetCameraEndpoint} from "./web/endpoints/v1/camera/GetCameraEndpoint";
import {GetSenorsEndpoint} from "./web/endpoints/v1/sensors/GetSenorsEndpoint";
import {SensorManager} from "./sensors/SensorManager";
import jsyaml from "js-yaml";
import {Camera} from "./camera/Camera";
import {GetFeedEndpoint} from "./web/endpoints/v1/feed/GetFeedEndpoint";
import {StatusLed} from "./StatusLed";
import crypto from "crypto";
import {GetDeviceInfoEndpoint} from "./web/endpoints/v1/deviceinfo/GetDeviceInfoEndpoint";
import {IUserSettings} from "./IUserSettings";
import {SensorDatabase} from "./database/SensorDatabase";
import {GetStorageEndpoint} from "./web/endpoints/v1/storage/GetStorageEndpoint";
import {GetSettingsEndpoint} from "./web/endpoints/v1/settings/GetSettingsEndpoint";
import {PatchSettingsEndpoint} from "./web/endpoints/v1/settings/PatchSettingsEndpoint";
import {GetOnlineServiceTokenEndpoint} from "./web/endpoints/v1/onlineServiceToken/GetOnlineServiceTokenEndpoint";
import {
  GetExportLocalDataToUsbEndpoint
} from "./web/endpoints/v1/actions/exportLocalDataToUsb/GetExportLocalDataToUsbEndpoint";
import {GetPurgeLocalDataEndpoint} from "./web/endpoints/v1/actions/purgeLocalData/GetPurgeLocalDataEndpoint";
import {GetRestartSoftwareEndpoint} from "./web/endpoints/v1/actions/restartSoftware/GetRestartSoftwareEndpoint";
import {GetRebootEndpoint} from "./web/endpoints/v1/actions/reboot/GetRebootEndpoint";
import {GetShutdownEndpoint} from "./web/endpoints/v1/actions/shutdown/GetShutdownEndpoint";
import version from "./version";
import constants from "./constants";
import {OnlineService} from "./communication/OnlineService";

/**
 * Datenvogelhäuschen main class
 */
export class Datenvogelhauschen {
  /**
   * Serial number of the Datenvogelhäuschen based on the
   * Raspberry PI's CPU serial number.
   * Needed to authenticate with the Datenvogelhäuschen service
   * in order to publish measured data. This is done to protect
   * our service from spamming or DOS-attacking with massive
   * amounts of data sent into our database.
   */
  static SERIAL_NUMBER: string = "UNKNOWN_DEVICE";

  static SERIAL_NUMBER_SHA1: string = "";

  /**
   * Run configuration of the Datenvogelhäuschen software
   */
  static CONFIGURATION: IConfiguration = undefined;

  /**
   * Contents of usersettings.json
   */
  static USER_SETTINGS: IUserSettings = undefined;

  /**
   * Datenvogelhäuschen entry function
   */
  main = () => {
    console.log(`>>> ${version.softwareName} - ${version.softwareVersionMajor}.${version.softwareVersionMinor} #${version.softwareVersionCommit}`);

    // Read configuration
    const config = <IConfiguration> jsyaml.load(fs.readFileSync(constants.filepaths.configuration, "utf-8"));
    Datenvogelhauschen.CONFIGURATION = config;
    console.log(`Loaded configuration.yml: `);
    console.log(config);

    // Read usersettings.json
    const userSettings = <IUserSettings> JSON.parse(fs.readFileSync(constants.filepaths.usersettings).toString());
    Datenvogelhauschen.USER_SETTINGS = userSettings;
    console.log(`Loaded usersettings.json: `);
    console.log(userSettings);

    // Initialization
    console.log(`Initializing components...`);

    StatusLed.INSTANCE = new StatusLed(Datenvogelhauschen.CONFIGURATION.statusLed.pin,
      Datenvogelhauschen.CONFIGURATION.statusLed.enabled);

    const db = new SensorDatabase();
    const onlineService = new OnlineService();

    const sensorManager = new SensorManager(db, onlineService);
    const camera = new Camera(onlineService);

    // Read serial number from filesystem
    this.readSerialNumber();

    // Create new webserver instance
    console.log(`Starting webserver...`);
    const webserver = new Webserver();

    // Register webserver endpoints
    new GetCameraEndpoint(camera).attachToWebserver(webserver);
    new GetSenorsEndpoint(sensorManager).attachToWebserver(webserver);
    new GetFeedEndpoint().attachToWebserver(webserver);
    new GetDeviceInfoEndpoint().attachToWebserver(webserver);
    new GetStorageEndpoint().attachToWebserver(webserver);
    new GetSettingsEndpoint().attachToWebserver(webserver);
    new PatchSettingsEndpoint().attachToWebserver(webserver);
    new GetOnlineServiceTokenEndpoint().attachToWebserver(webserver);
    new GetExportLocalDataToUsbEndpoint(db).attachToWebserver(webserver);
    new GetPurgeLocalDataEndpoint(db).attachToWebserver(webserver);
    new GetRestartSoftwareEndpoint().attachToWebserver(webserver);
    new GetRebootEndpoint().attachToWebserver(webserver);
    new GetShutdownEndpoint().attachToWebserver(webserver);

    // Start webserver
    webserver.start();

    console.log(`Startup done!`);
    StatusLed.INSTANCE.power();

    // Stop on SIGINT
    process.on("SIGINT", () => {
      StatusLed.INSTANCE.danger();
      webserver.stop();
      sensorManager.closeAll();
      camera.stop();
      StatusLed.INSTANCE.off();

      process.exit();
    });
  };

  /**
   * Reads serial number from filesystem
   */
  readSerialNumber = () => {
    fs.readFile("/sys/firmware/devicetree/base/serial-number", (err, data) => {
      if(err) {
        console.log(`Unable to read serial number from /sys/firmware/devicetree/base/serial-number! Please make sure that this file exist and is readable.`);
        console.log(`Serial number: "${ Datenvogelhauschen.SERIAL_NUMBER }" (serial number could not be read!)`);
        return;
      }

      Datenvogelhauschen.SERIAL_NUMBER = data.toString().trim();

      let hash = crypto.createHash("sha1");
      hash.update(Datenvogelhauschen.SERIAL_NUMBER);
      Datenvogelhauschen.SERIAL_NUMBER_SHA1 = hash.digest("hex");

      console.log(`Serial number hash: "${ Datenvogelhauschen.SERIAL_NUMBER_SHA1 }" (based on CPU's serial number)`);
    });
  };

  /**
   * Writes usersettings.json
   */
  static writeUserSettings = () => {
    console.log(`Wrote usersettings.json...`);
    fs.writeFileSync(constants.filepaths.usersettings, JSON.stringify(Datenvogelhauschen.USER_SETTINGS));
  }
}
