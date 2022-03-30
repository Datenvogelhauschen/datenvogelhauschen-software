import {Gpio} from "pigpio";
import {Datenvogelhauschen} from "./Datenvogelhauschen";
import {clearInterval} from "timers";

/**
 * Status LED class
 */
export class StatusLed {
  /**
   * Status LED static instance
   * (Will be set from main class)
   */
  static INSTANCE: StatusLed;

  pin: number;
  enabled: boolean;
  gpio: Gpio;
  currentInterval: any;
  currentMode: string;
  
  /**
   * Constructs new StatusLed class
   * @param pin GPIO pin of StatusLed
   * @param enabled Is StatusLed enabled?
   */
  constructor(pin: number, enabled: boolean = true) {
    this.pin = pin;
    this.enabled = enabled;

    this.gpio = new Gpio(this.pin, {
      mode: Gpio.OUTPUT
    });

    console.log(`Status LED initialized!`);

    this.danger();
  }

  danger = () => {
    if(this.currentMode == "danger") {
      return;
    }
    
    this.currentMode = "danger";
    
    console.log(`Status LED signal: danger`);

    clearInterval(this.currentInterval);

    let lastState = false;

    this.currentInterval = setInterval(() => {
      this.gpio.digitalWrite(lastState ? 0 : 1);

      lastState = !lastState;
    }, 1000);
  }

  power = () => {
    if(this.currentMode == "power") {
      return;
    }
    
    this.currentMode = "power";
    
    console.log(`Status LED signal: power`);

    clearInterval(this.currentInterval);

    this.currentInterval = setInterval(() => {
      this.gpio.digitalWrite(1);

      setTimeout(() => {
        this.gpio.digitalWrite(0);
      }, 10);
    }, 60000);
  }

  off = () => {
    if(this.currentMode == "off") {
      return;
    }
    
    this.currentMode = "off";
    
    console.log(`Status LED signal: off`);

    clearInterval(this.currentInterval);

    this.gpio.digitalWrite(0);
  }
}
