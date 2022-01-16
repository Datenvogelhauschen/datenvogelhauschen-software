import {Sensor} from "../Sensor";
import {EFaultType} from "./EFaultType";
import {StatusLed} from "../../StatusLed";

export class FaultReporter {
  /**
   * FaultReporter static instance
   */
  static INSTANCE = new FaultReporter();

  faults: {[key: string]: Array<{sensor: Sensor, faultType: EFaultType, timestamp: number}> } = {};

  /**
   * Report a fault
   * @param faultType FaultType enum
   * @param sensor Sensor class
   */
  reportFault = (faultType: EFaultType, sensor: Sensor) => { // TODO Implement in helpers for more in depth information
    if(!this.faults[sensor.identifier]) {
      this.faults[sensor.identifier] = [];
    }

    if(this.faults[sensor.identifier].length > 16) {
      this.faults[sensor.identifier].shift();
    }

    this.faults[sensor.identifier].push({
      sensor: sensor,
      faultType: +faultType,
      timestamp: Date.now()
    });

    console.log(`A fault was reported for sensor "${sensor.identifier}"! Fault type: ${faultType}`);
    this.checkFaults();
  };

  /**
   * Checks for faults and returns a list with the latest fault details
   */
  checkFaults = () => {
    const faultDetails: {sensorName: string, sensorPin: number, i2cBus: number, lastFault: string}[] = [];

    for(const key of Object.keys(this.faults)) {
      if(this.faults[key].length < 5) {
        // Only add fault to report if there are multiple errors
        break;
      }

      faultDetails.push({
        sensorName: this.faults[key][this.faults[key].length - 1].sensor.readableName,
        sensorPin: this.faults[key][this.faults[key].length - 1].sensor.pin,
        i2cBus: this.faults[key][this.faults[key].length - 1].sensor.bus,
        lastFault: new Date(this.faults[key][this.faults[key].length - 1].timestamp).toTimeString()
      });
    }

    if(faultDetails.length > 0) {
      StatusLed.INSTANCE.danger();
    } else {
      StatusLed.INSTANCE.power();
    }

    return faultDetails;
  }

  /**
   * Clears fault list
   */
  clearFaults = () => {
    this.faults = {};
  }

  /**
   * Clears fault list for a specific sensor
   * @param sensor Sensor class
   */
  clearFaultsForSensor = (sensor: Sensor) => {
    if(this.faults[sensor.identifier]) {
      this.faults[sensor.identifier] = [];
    }

    this.checkFaults();
  }
}
