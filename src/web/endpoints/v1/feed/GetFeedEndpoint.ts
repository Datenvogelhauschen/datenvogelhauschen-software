import {Endpoint} from "../../../Endpoint";
import {ERequestMethods} from "../../../ERequestMethods";
import {Request, Response} from "express";
import {FaultReporter} from "../../../../sensors/faults/FaultReporter";

/**
 * GET /v1/feed
 * Returns user feed
 */
export class GetFeedEndpoint extends Endpoint {
  path = "/v1/feed";
  method = +ERequestMethods.GET;

  handle = (req: Request, res: Response) => {
    const onlineFeed: {title: string, content: string}[] = [];

    // TODO: Read datenvogelhäuschen.de feed

    const faultFeed: {title: string, content: string}[] = [];

    for(const f of FaultReporter.INSTANCE.checkFaults()) {
      faultFeed.push({
        title: `<b>Warnung:</b> Häufige Sensorfehler! (Sensor: "${f.sensorName}")`,
        content: `Beim auslesend des Sensors "${f.sensorName}" traten immer wieder Fehler auf. <br>
                  Letzter Fehler: <code>timestamp="${f.lastFault}", pin=${f.sensorPin}, i2cBus=${f.i2cBus}</code>. <br>
                  Möglicherweise muss der Sensor gewechselt werden. Bitte wende dich an 
                  <a href="mailto:contact@datenvogelhäuschen.de">contact@datenvogelhäuschen.de</a> für
                  weitere Informationen.`
      });
    }

    const feed = [
      ...onlineFeed,
      ...faultFeed
    ];

    console.log(`Composed feed with ${feed.length} elements from faults and online feed!`);

    res.json({
      feed: feed
    });
  }
}
