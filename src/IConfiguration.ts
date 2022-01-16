/**
 * Run configuration interface
 */
export interface IConfiguration {
  sensors: {
    dht11: {
      pin: number
    },
    ccs811: {
      i2cBus: number
    },
    bmp280: {
      i2cBus: number
    },
    statusLed: {
      pin: number
    }
  },
  webserver: {
    port: number,
    hostname: string
  },
  onlineService: {
    baseUrl: string
  },
  statusLed: {
    enabled: boolean,
    pin: number
  }
}
