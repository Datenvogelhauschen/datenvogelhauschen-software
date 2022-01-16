import {Database} from "sqlite3";
import constants from "../constants";
import {Datenvogelhauschen} from "../Datenvogelhauschen";

/**
 * Sqlite3 & online service wrapper class
 */
export class SensorDatabase {
  db: Database;
  dbOpen: boolean = false;

  /**
   * Opens database file
   */
  constructor() {
    this.open();
  }

  /**
   * Opens the database
   */
  open = () => {
    this.db = new Database(constants.filepaths.database);
    this.dbOpen = true;
    this.prepareSchema();
  }

  /**
   * Closes database
   */
  close = () => {
    this.db.close();
  };

  /**
   * Prepares schema of database
   */
  prepareSchema = () => {
    if(!this.dbOpen) { return; }

    this.db.serialize(() => {
      // Creates sensors table
      this.db.run(`
        create table if not exists sensors
        (
          identifier varchar(128),
          unit       varchar(128)
        );
        
        create unique index sensors_identifier_uindex
          on sensors (identifier);
      `);

      this.db.run(`
        insert into sensors (identifier, unit) values ('co2', 'ppm');
      `);

      this.db.run(`
        insert into sensors (identifier, unit) values ('tvoc', 'ppb');
      `);

      this.db.run(`
        insert into sensors (identifier, unit) values ('temperature', '°C');
      `);

      this.db.run(`
        insert into sensors (identifier, unit) values ('humidity', '%');
      `);

      this.db.run(`
        insert into sensors (identifier, unit) values ('pressure', 'hPa');
      `);

      // Creates sensor_values table
      this.db.run(`
        create table if not exists sensors_values
        (
          f_identifier varchar(128) not null
            constraint sensors_values_sensors_identifier_fk
              references sensors (identifier)
              on update restrict on delete restrict,
          value        real         not null,
          timestamp    integer default CURRENT_TIMESTAMP not null
        );
      `);
    });
  }

  /**
   * Inserts sensor value to sensors_values
   */
  insertSensorValue = (sensorIdentifier: string, value: number) => {
    if(!this.dbOpen) { return; }
    if(!Datenvogelhauschen.USER_SETTINGS.localData.saveLocally) { return; }

    const query = this.db.prepare(`
      INSERT INTO sensors_values (f_identifier, value) VALUES (?, ?);
    `);

    console.log(`Writing sensor readout for sensor "${sensorIdentifier}" with value "${value}" to local database`);

    query.run([sensorIdentifier, value]);
  };
}
