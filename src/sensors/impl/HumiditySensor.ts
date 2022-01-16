import {Sensor} from "../Sensor";
import {ESensorType} from "../ESensorType";
import {Datenvogelhauschen} from "../../Datenvogelhauschen";
import {DhtHelper} from "../helper/DhtHelper";
import {FaultReporter} from "../faults/FaultReporter";
import {EFaultType} from "../faults/EFaultType";

/**
 * DHT11 Humidity sensor class
 */
export class HumiditySensor extends Sensor {
  identifier = "humidity";
  readableName = "Humidity";
  unitChar = "%";
  unitFull = "Percent";

  sensorType = +ESensorType.GPIO;
  pin = Datenvogelhauschen.CONFIGURATION.sensors.dht11.pin;

  dhtHelper: DhtHelper;

  constructor(dhtHelper: DhtHelper) {
    super();

    this.dhtHelper = dhtHelper;
  }

  getValue = () => {
    // Method has been overwritten to make direct use of the DhtHelper class instead of reading the output again on a
    // schedule though the this.read method. This way, the code runs a little more efficient (even though we're using
    // NodeJS and can't really talk about efficiency).

    const val = this.dhtHelper.getHumidity();

    if(val == 0) {
      FaultReporter.INSTANCE.reportFault(EFaultType.INVALID_VALUES, this);
    } else if(val > 100) {
      FaultReporter.INSTANCE.reportFault(EFaultType.UNREAL_VALUES, this);
    } else {
      FaultReporter.INSTANCE.clearFaultsForSensor(this);
    }

    return val;
  }

  close = () => {
    this.dhtHelper.close();
  }
}
