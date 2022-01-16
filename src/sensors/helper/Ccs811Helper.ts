import i2c, {I2CBus} from "i2c-bus";
import {FaultReporter} from "../faults/FaultReporter";
import {EFaultType} from "../faults/EFaultType";

/**
 * Helper class used to make the CCS811 readable from two classes while still respecting it's maximum readouts
 */
export class Ccs811Helper {
  static CCS811_ADDRESS = 0x5a;
  static CCS811_STATUS = 0x00;
  static CCS811_MEAS_MODE = 0x01;
  static CCS811_ALG_RESULT_DATA = 0x02;
  static CCS811_RAW_DATA = 0x03;
  static CCS811_ENV_DATA = 0x05;
  static CCS811_NTC = 0x06;
  static CCS811_THRESHOLDS = 0x10;
  static CCS811_BASELINE = 0x11;
  static CCS811_HW_ID = 0x20;
  static CCS811_HW_VERSION = 0x21;
  static CCS811_FW_BOOT_VERSION = 0x23;
  static CCS811_FW_APP_VERSION = 0x24;
  static CCS811_ERROR_ID = 0xE0;
  static CCS811_APP_START = 0xF4;
  static CCS811_SW_RESET = 0xFF;

  private i2cInstance: I2CBus;

  private co2: number;
  private tvoc: number;

  private interval: any;

  /**
   * Opens the sensor
   * @param i2cBus I2C bus number
   */
  constructor(i2cBus: number) {
    this.i2cInstance = i2c.openSync(i2cBus);

    this.configure();

    setTimeout(() => {
      this.interval = setInterval(this.updateValues, 10000);
    }, 2000);
  }

  /**
   * Returns this.co2
   */
  getCo2 = () => {
    return this.co2;
  }

  /**
   * Returns this.tvoc
   */
  getTvoc = () => {
    return this.tvoc;
  }

  /**
   * Updates CO2 and TVOC value
   */
  updateValues = () => {
    const dataStatus = this.i2cInstance.readByteSync(Ccs811Helper.CCS811_ADDRESS, Ccs811Helper.CCS811_STATUS);

    if(dataStatus & 1 << 3) {
      try {
        const resp = this.readData();

        this.co2 = resp.co2;
        this.tvoc = resp.tvoc;
      } catch (e) {
        this.co2 = 0;
        this.tvoc = 0;

        console.log(`An error occurred while reading the CCS811: ${e}`);
      }
    } else {
      console.log(`Tried to read CCS811, but no data was available! Keeping old values...`);
    }
  }

  /**
   * Configures sensor for operation
   */
  configure = () => {
    // Check if sensor is connected
    const hardwareId = this.i2cInstance.readByteSync(Ccs811Helper.CCS811_ADDRESS, Ccs811Helper.CCS811_HW_ID);

    if(hardwareId != 0x81) {
      console.log(`Unable to configure CCS811!`);
      this.updateValues = () => { return; };
      return;
    }

    // Check sensor
    const status = this.i2cInstance.readByteSync(Ccs811Helper.CCS811_ADDRESS, Ccs811Helper.CCS811_STATUS);

    if(status & 1 << 0) {
      console.log(`Error while starting up CCS811! (status=${status})`);
      console.log(`Error: ${this.getError()}`);
      this.updateValues = () => { return; };
      return;
    }

    if(!(status & 1 << 4)) {
      console.log(`CCS811 app invalid! Please install a valid firmware on your CCS811! (status=${status})`);
      console.log(`Error: ${this.getError()}`);
      this.updateValues = () => { return; };
      return;
    }

    // Start app
    this.i2cInstance.writeI2cBlockSync(Ccs811Helper.CCS811_ADDRESS, Ccs811Helper.CCS811_APP_START, 0, Buffer.alloc(0));

    const statusApp = this.i2cInstance.readByteSync(Ccs811Helper.CCS811_ADDRESS, Ccs811Helper.CCS811_STATUS);

    if(statusApp & 1 << 0) {
      console.log(`Error while starting up CCS811 app! (status=${statusApp})`);
      console.log(`Error: ${this.getError()}`);
      this.updateValues = () => { return; };
      return;
    }

    // Set mode
    const mode = 2;

    let currentMode = this.i2cInstance.readByteSync(Ccs811Helper.CCS811_ADDRESS, Ccs811Helper.CCS811_MEAS_MODE);
    currentMode &= ~(0b00000111 << 4);
    currentMode |= (mode << 4); // 2 = mode number
    this.i2cInstance.writeByteSync(Ccs811Helper.CCS811_ADDRESS, Ccs811Helper.CCS811_MEAS_MODE, currentMode);
  }

  /**
   * Resets the sensor
   */
  reset = () => {
    this.i2cInstance.writeI2cBlockSync(Ccs811Helper.CCS811_ADDRESS, 0xff, 4,
      Buffer.from([0x11, 0xE5, 0x72, 0x8A]));
  }

  getError = () => {
    const error = this.i2cInstance.readByteSync(Ccs811Helper.CCS811_ADDRESS, Ccs811Helper.CCS811_ERROR_ID);

    const list: Array<string> = [];

    if(error & 1 << 5) {
      list.push("HeaterSupply");
    } else if(error & 1 << 4) {
      list.push("HeaterFault");
    } else if(error & 1 << 3) {
      list.push("MaxResistance");
    } else if(error & 1 << 2) {
      list.push("MeasModeInvalid");
    } else if(error & 1 << 1) {
      list.push("ReadRegInvalid");
    } else if(error & 1 << 0) {
      list.push("MsgInvalid");
    }

    return list;
  }

  private map = (x: number, in_min: number, in_max: number, out_min: number, out_max: number): number => {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }

  /**
   * Reads co2 and tvoc data from sensor
   */
  readData = () => {
    const buffer = Buffer.alloc(5);
    this.i2cInstance.readI2cBlockSync(Ccs811Helper.CCS811_ADDRESS, 0x02, 5, buffer);

    const co2_raw = (buffer[0] << 8) | buffer[1];
    const tvoc_raw = (buffer[2] << 8) | buffer[3];

    const co2 = this.map(co2_raw, 0, 0xffff, 400, 8192);
    const tvoc = this.map(tvoc_raw, 0, 0xffff, 0, 1187);

    return {
      co2: co2,
      tvoc: tvoc
    };
  }

  /**
   * Sets the environment data of the sensor. Needed to normalize measured values internally.
   * @param temperature Temperature in °C
   * @param humidity Humidity in %
   */
  setEnvironmentData = (temperature: number, humidity: number) => {
    const buffer = Buffer.alloc(4);

    const h = (humidity * 1000) >> 0; // 42.348 becomes 42348
    let t = (temperature * 1000) >> 0; // 23.2 becomes 23200

    buffer[0] = ((h + 250) / 500) >> 0
    buffer[1] = 0 // CCS811 only supports increments of 0.5 so bits 7-0 will always be zero

    t += 25000 // Add the 25C offset
    buffer[2] = ((t + 250) / 500) >> 0
    buffer[3] = 0

    this.i2cInstance.writeI2cBlockSync(Ccs811Helper.CCS811_ADDRESS, 0x05, 4, buffer)
  }

  /**
   * Closes the sensor
   */
  close = () => {
    clearInterval(this.interval);
    this.i2cInstance.closeSync();
  }
}
