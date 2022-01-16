/**
 * Sensor base class
 */
import {ESensorType} from "./ESensorType";

export class Sensor {
  static READ_INTERVAL: number = 15000;

  identifier: string = "unidentified_sensor";
  readableName: string = "Unidentified Sensor";
  unitChar: string = "UU";
  unitFull: string = "Unknown Unit";

  sensorType: ESensorType = undefined;
  pin: number = -1
  bus: number = -1

  value: number = 0;

  /**
   * To be called if a sensor has to be read in a cycle.
   * This will execute this.read every _ ms.
   */
  startReadCycle = () => {
    setInterval(this.read, Sensor.READ_INTERVAL);
  }

  /**
   * Used to refresh sensor value
   */
  read = () => {
    return;
  };

  /**
   * Closes the sensor
   */
  close = () => {
    return;
  }

  /**
   * Returns value of sensor
   */
  getValue = (): number => {
    return this.value;
  };
}
