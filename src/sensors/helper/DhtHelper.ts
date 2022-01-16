import dht, {Dht} from "pigpio-dht";
import {Datenvogelhauschen} from "../../Datenvogelhauschen";

/**
 * Helper class to be used to read the DHT11 sensor from.
 * This is needed as the sensor can only be read every 2s.
 * Thus, a limitation is needed while still providing the
 * last sensor value.
 */
export class DhtHelper {
  private sensor: Dht = undefined;
  private humidity: number = 0;
  private temperature: number = 0;

  private readInterval: any;

  /**
   * Constructs the class
   * @param gpio GPIO pin to which the sensor is connected
   */
  constructor(gpio: number) {
    this.sensor = dht(gpio, 11)

    this.sensor.on("result", data => {
      this.temperature = data.temperature;
      this.humidity = data.humidity;
    });

    this.sensor.on("badChecksum", () => {
      console.log("Warning: The DHT11 sensor (temperature/humidity) has returned a value with a bad checksum. Ignoring...");
    });

    this.readInterval = setInterval(this.read, 5000);
    this.read();
  }

  /**
   * Reads the sensor value each 2500ms using setInterval
   */
  private read = () => {
    this.sensor.read();
  }

  /**
   * Stops reading the sensor
   */
  close = () => {
    clearInterval(this.readInterval);
  }

  /**
   * Returns this.humidity
   */
  getHumidity = () => {
    return this.humidity;
  }

  /**
   * Returns this.temperature
   */
  getTemperature = () => {
    return this.temperature;
  }
}
