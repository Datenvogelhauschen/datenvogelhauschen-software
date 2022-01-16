import express, {Express} from "express";
import {Server} from "http";
import {Datenvogelhauschen} from "../Datenvogelhauschen";

/**
 * Webserver for static content and API routes
 */
export class Webserver {
  private app: Express = express();
  private server: Server;

  /**
   * Registers middleware before registering endpoints
   */
  constructor() {
    // Middleware
    this.app.use(express.static("static"));
    this.app.use(express.json());

    console.log(`Webserver ready to be started!`);
  }

  /**
   * Starts the webserver
   */
  start = () => {
    // Start listening
    this.server = this.app.listen(Datenvogelhauschen.CONFIGURATION.webserver.port,
      Datenvogelhauschen.CONFIGURATION.webserver.hostname, () => {
      console.log(`Webserver listening on ${Datenvogelhauschen.CONFIGURATION.webserver.hostname}:${Datenvogelhauschen.CONFIGURATION.webserver.port}...`);
    });
  };

  /**
   * Stops the webserver
   */
  stop = () => {
    this.server.close();
    console.log(`Stopped webserver!`);
  };

  /**
   * Returns express app
   */
  getExpressApp = () => {
    return this.app;
  }
}
