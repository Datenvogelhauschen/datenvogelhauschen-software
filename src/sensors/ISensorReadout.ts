/**
 * Interface for sensor readout to be used to compose object with all sensor values and infos
 */
export interface ISensorReadout {
  value: number,
  identifier: string,
  readableName: string,
  unitChar: string,
  unitFull: string
}
