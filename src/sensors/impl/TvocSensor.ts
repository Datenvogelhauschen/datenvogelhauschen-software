import {Sensor} from "../Sensor";
import {ESensorType} from "../ESensorType";
import {Datenvogelhauschen} from "../../Datenvogelhauschen";
import {Ccs811Helper} from "../helper/Ccs811Helper";
import {FaultReporter} from "../faults/FaultReporter";
import {EFaultType} from "../faults/EFaultType";

/**
 * CCS811 Tvoc sensor
 */
export class TvocSensor extends Sensor {
  identifier = "tvoc";
  readableName = "Total Volatile Organic Compounds";
  unitChar = "ppb";
  unitFull = "Parts per billion";

  sensorType = +ESensorType.I2C;
  i2cBus = Datenvogelhauschen.CONFIGURATION.sensors.ccs811.i2cBus;

  ccs811Helper: Ccs811Helper;

  constructor(ccs811Helper: Ccs811Helper) {
    super();

    this.ccs811Helper = ccs811Helper;
  }

  getValue = () => {
    const val = this.ccs811Helper.getTvoc();

    if(val < 0) {
      FaultReporter.INSTANCE.reportFault(EFaultType.INVALID_VALUES, this);
    } else if(val >= 1186) {
      FaultReporter.INSTANCE.reportFault(EFaultType.UNREAL_VALUES, this);
    } else {
      FaultReporter.INSTANCE.clearFaultsForSensor(this);
    }

    return val;
  }
}
