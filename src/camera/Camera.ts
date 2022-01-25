import PiCamera from "pi-camera";
import gm from "gm";
import fs from "fs";
import constants from "../constants";
import {Datenvogelhauschen} from "../Datenvogelhauschen";
import {OnlineService} from "../communication/OnlineService";

/**
 * PiCam wrapper
 */
export class Camera {
  photoPath: string = "/tmp/datenvogelhauschen_picam_tmp.jpg";
  photoStampedPath: string = "/tmp/datenvogelhauschen_picam_tmp_stamped.jpg";
  piCam: PiCamera;

  snapInterval: any;
  currentPhotoCount: number = 0;

  onlineService: OnlineService;

  /**
   * Constructs new Camera class
   */
  constructor(onlineService: OnlineService) {
    this.onlineService = onlineService;

    this.piCam = new PiCamera({
      mode: "photo",
      width: 1920,
      height: 1080,
      nopreview: true,
      output: this.photoPath
    });

    this.snapInterval = setInterval(this.snap, 15000);
    this.snap();

    try {
      fs.mkdirSync(constants.filepaths.camera_captures);
    } catch (e) {}
  }

  /**
   * Creates a photo and saves it to the class
   */
  private snap = () => {
    this.piCam.snap()
      .then(result => {
        gm(this.photoPath)
          .composite("cam_overlay.png")
          .geometry("+0+0")
          .write(this.photoStampedPath, err => {
            if(err) {
              console.log(`An error occurred while putting a stamp on a photo via graphicsmagick: ${err}`);
            }
          });

        if(Datenvogelhauschen.USER_SETTINGS.localData.saveLocally && this.currentPhotoCount > 4) {
          this.currentPhotoCount = 0;
          fs.copyFileSync(this.photoStampedPath, constants.filepaths.camera_captures + "/" + new Date(Date.now()).toISOString() + ".jpg");
          this.onlineService.postCurrentCameraImage(this.photoStampedPath);
          console.log(`Saved camera image to local storage!`);
        } else {
          this.currentPhotoCount++;
          console.log(`Snapped new camera image! Not saving to local storage!`);
        }
      })
      .catch(err => {
        console.log(`An error occurred while snapping a photo with the PiCam: ${err}`);
      })
  }

  /**
   * Stops the camera
   */
  stop = () => {
    clearInterval(this.snapInterval);
  }

  /**
   * Returns the path of the last photo
   */
  getPhotoPath = () => {
    return this.photoPath;
  }

  /**
   * Returns the path of the last stamped photo
   */
  getStampedPhotoPath = () => {
    return this.photoStampedPath;
  }
}
