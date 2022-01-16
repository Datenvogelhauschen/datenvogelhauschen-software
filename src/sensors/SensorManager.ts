import {Sensor} from "./Sensor";
import {Co2Sensor} from "./impl/Co2Sensor";
import {HumiditySensor} from "./impl/HumiditySensor";
import {PressureSensor} from "./impl/PressureSensor";
import {TemperatureSensor} from "./impl/TemperatureSensor";
import {TvocSensor} from "./impl/TvocSensor";
import {ISensorReadout} from "./ISensorReadout";
import {DhtHelper} from "./helper/DhtHelper";
import {Datenvogelhauschen} from "../Datenvogelhauschen";
import {Ccs811Helper} from "./helper/Ccs811Helper";
import {SensorDatabase} from "../database/SensorDatabase";

/**
 * Manages Sensor instances
 */
export class SensorManager {
  registeredSensors: Array<Sensor>;

  dhtHelper = new DhtHelper(Datenvogelhauschen.CONFIGURATION.sensors.dht11.pin);
  ccs811Helper = new Ccs811Helper(Datenvogelhauschen.CONFIGURATION.sensors.ccs811.i2cBus);

  co2Sensor = new Co2Sensor(this.ccs811Helper);
  humiditySensor = new HumiditySensor(this.dhtHelper);
  pressureSensor = new PressureSensor();
  temperatureSensor = new TemperatureSensor(this.dhtHelper);
  tvocSensor = new TvocSensor(this.ccs811Helper);

  warumup: boolean = false;

  db: SensorDatabase;
  dbWriteInterval: any;

  /**
   * Adds all sensors from class to registeredSensors list
   */
  constructor(db: SensorDatabase) {
    this.registeredSensors = [
      this.co2Sensor,
      this.humiditySensor,
      this.pressureSensor,
      this.temperatureSensor,
      this.tvocSensor
    ];

    this.db = db;

    setTimeout(() => {
      this.dbWriteInterval = setInterval(() => {
        for (const s of this.registeredSensors) {
          this.db.insertSensorValue(
            s.identifier,
            s.getValue()
          );
        }

        // TODO: online service

        console.log(`Sensor data was written to the local database and sent to the Datenvogelhäuschen online service (if allowed)!`);
      }, 300000); // 300000s = 5min

      this.warumup = false;
      console.log(`Warmup sequence (20min) done. Starting to sent data every 5min (if allowed)!`);
    }, 1200000); // 1200000s = 20min

    this.warumup = true;

    console.log(`All sensors initialized! Sensor data will be sent to the Datenvogelhäuschen online service and saved to the local Database in 20min every 5min (if allowed)!`);
  }

  /**
   * Creates object with all sensor values and infos
   */
  getSensorReadouts = () => {
    let data: {[key: string]: ISensorReadout} = {};

    for(const sensor of this.registeredSensors) {
      data[sensor.identifier] = <ISensorReadout>{
        readableName: sensor.readableName,
        identifier: sensor.identifier,
        unitChar: sensor.unitChar,
        unitFull: sensor.unitFull,
        value: sensor.getValue()
      };
    }

    return data;
  }

  /**
   * Closes all sensors
   */
  closeAll = () => {
    for(const sensor of this.registeredSensors) {
      sensor.close();
    }

    clearInterval(this.dbWriteInterval);

    console.log(`Closed sensors!`);
  }

  /**
   * Are sensors still in warmup phase?
   */
  isInWarmup = () => {
    return this.warumup;
  }
}
