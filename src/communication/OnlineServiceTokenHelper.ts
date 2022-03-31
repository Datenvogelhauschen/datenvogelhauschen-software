import crypto from "crypto";
import {Datenvogelhauschen} from "../Datenvogelhauschen";

/**
 * OnlineService token helper class
 */
export class OnlineServiceTokenHelper {
  /**
   * Generates a new SHA1 with current timestamp as salt
   */
  static getCurrentToken = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayTimestamp = new Date(year, month, 1).getTime();

    let hash = crypto.createHash("sha1");
    hash.update(Datenvogelhauschen.SERIAL_NUMBER + firstDayTimestamp.toString());
    const currentHash = hash.digest("hex");

    console.log(`Calculated current time-based authentication hash (timestamp: ${firstDayTimestamp}): ${currentHash.substring(0, 5)}...................................`);

    return {
      hash: currentHash,
      timestamp: firstDayTimestamp,
      rawHash: Datenvogelhauschen.SERIAL_NUMBER_SHA1
    }
  }
}
