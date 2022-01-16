import {Sensor} from "../Sensor";
import {ESensorType} from "../ESensorType";
import {Datenvogelhauschen} from "../../Datenvogelhauschen";
import {BMP280} from "@idenisovs/bmp280";
import {FaultReporter} from "../faults/FaultReporter";
import {EFaultType} from "../faults/EFaultType";

/**
 * BMP280 Pressure sensor class
 */
export class PressureSensor extends Sensor {
  static BMP280_I2C_ADDRESS = 0x76; // can be 0x77
  static BMP280_I2C_TEMPERATURE_REGISTER = 0x88; // unsigned short (16 bit); can be 0x89
  static BMP280_I2C_PRESSURE_REGISTER = 0x8E; // unsigned short (16 bit); can be 0x8F

  identifier = "pressure";
  readableName = "Air Pressure";
  unitChar = "hPa";
  unitFull = "Hectopascal";

  sensorType = +ESensorType.I2C;
  i2cBus = Datenvogelhauschen.CONFIGURATION.sensors.bmp280.i2cBus;

  bmp280Sensor: BMP280;

  constructor() {
    super();

    this.bmp280Sensor = new BMP280({
      bus: this.i2cBus,
      address: PressureSensor.BMP280_I2C_ADDRESS
    });

    this.bmp280Sensor.connect();

    // Enable read cycle
    this.startReadCycle();
  }

  read = async () => {
    const values = await this.bmp280Sensor.sensors();

    const val = values.pressure;

    if(val <= 0) {
      FaultReporter.INSTANCE.reportFault(EFaultType.INVALID_VALUES, this);
    } else if(val >= 1099) {
      FaultReporter.INSTANCE.reportFault(EFaultType.UNREAL_VALUES, this);
    } else {
      FaultReporter.INSTANCE.clearFaultsForSensor(this);
    }

    this.value = val;
  };

  close = () => {
    this.bmp280Sensor.disconnect();
  }
}
