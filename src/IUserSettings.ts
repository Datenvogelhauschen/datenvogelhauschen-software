/**
 * Interface for usersettings.json
 */
export interface IUserSettings {
  dataSharing: {
    weather: boolean,
    bird: boolean,
    camera: boolean
  },
  localData: {
    saveLocally: boolean
  }
}
