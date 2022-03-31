import {Datenvogelhauschen} from "../Datenvogelhauschen";
import axios from "axios";
import {OnlineServiceTokenHelper} from "./OnlineServiceTokenHelper";
import FormData from "form-data";
import fs from "fs-extra";
import {Camera} from "../camera/Camera";

/**
 * OnlineService communication class
 */
export class OnlineService {
  static ANY_ERRORS: boolean = false;

  apiBaseUrl: string = Datenvogelhauschen.CONFIGURATION.onlineService.baseUrl;

  /**
   * Posts sensor data to online service
   * @param temperature Temperature
   * @param humidity Humidity
   * @param pressure Pressure
   * @param co2 Co2
   * @param tvoc TVOC
   */
  sendSensorData = async (temperature: number, humidity: number, pressure: number, co2: number, tvoc: number) => {
    try {
      const token = OnlineServiceTokenHelper.getCurrentToken();

      const resp = await axios.post(this.apiBaseUrl + "v1/deviceGateway/sensors", {
        temperature: temperature,
        humidity: humidity,
        pressure: pressure,
        co2: co2,
        tvoc: tvoc
      }, {
        headers: {
          "Authorization": "HardwareToken " + btoa(JSON.stringify({
            hash: token.hash,
            timestamp: token.timestamp,
            rawHash: token.rawHash
          }))
        }
      });

      if(resp.data.posted) {
        console.log("Posted current sensor data to online service!");
        OnlineService.ANY_ERRORS = false;
      } else {
        console.log("Error while posting current sensor data to online service! Response: " + resp);
        OnlineService.ANY_ERRORS = true;
      }
    } catch (e) {
        console.log("Error while posting current sensor data to online service: " + e);
        OnlineService.ANY_ERRORS = true;
    }
  }

  /**
   * Posts a local image to the online service
   * @param localPath Local camera image path
   */
  postCurrentCameraImage = async (localPath: string) => {
    try {  
      const token = OnlineServiceTokenHelper.getCurrentToken();

      const form = new FormData();
      form.append("file", fs.createReadStream(localPath));

      const resp = await axios.post(this.apiBaseUrl + "v1/deviceGateway/camera", form, {
        headers: {
          "Authorization": "HardwareToken " + btoa(JSON.stringify({
            hash: token.hash,
            timestamp: token.timestamp,
            rawHash: token.rawHash
          })),
          "Content-Type": "multipart/form-data"
        }
      });

      if(resp.data.posted) {
        console.log("Posted current camera data to online service!");
        OnlineService.ANY_ERRORS = false;
      } else {
        console.log("Error while posting current sensor data to online service! Response: " + resp);
        OnlineService.ANY_ERRORS = true;
      }
    } catch (e) {
        console.log("Error while posting current camera data to online service: " + e);
        OnlineService.ANY_ERRORS = true;
    }
  }
}
