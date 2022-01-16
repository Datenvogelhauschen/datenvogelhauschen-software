# 🕊️ Datenvogelhäuschen
A digital effort to protect our local fauna using data analysis. 
This project was created as part of the [VDE Technikpreis 2021](https://www.vde-rhein-ruhr.de/de/youngnet-regional/schule-mint/technikpreis).


## 🏠 Getting yourself a Datenvogelhäuschen
### Ordering the Datenvogelhäuschen
The Datenvogelhäuschen isn't a commercial product by now. But if you are interested in one and don't
feel like building it yourself, you can feel free to contact us and get a Datenvogelhäuschen for the price
of materials and shipping.

### Building the Datenvogelhäuschen
#### Hardware
! TODO !

#### Software
##### Running a released version


##### Building the software on your own
Running the Datenvogelhäuschen software is simple. SSH on your Raspberry Pi and clone this repository via:

```shell
$ git clone https://github.com/jbohnst/datenvogelhauschen-software.git
```

Then `cd` into the `datenvogelhauschen-software/` directory and install the required node and system packages:

```shell
# Install system packages
# If you want to export data to another filesystem than NTFS or ext4, you can add the according packages here.
# Be aware that some filesystems like Fat32 will not work by their nature.
$ sudo apt-get update
$ sudo apt-get install ntfs-3g pigpio graphicsmagick nodejs npm ttf-mscorefonts-installer python3

# Install the Datenvogelhäuschen npm package requirements
$ npm install
```

Now, as the `bmp280` package contains a typo, you'll need to go into the `node_modules/`
directory to rename `I2cBus` to `I2CBus` in `@idenisovs/bmp280/types/index.d.ts`. This will
likely not be needed to be done anymore in the future. For now, we'll work arond this issue like this.

Now that you've installed the `datenvogelhauschen` node package, you can build it by typing:

```shell
# This software needs to run as root to be able to make use of all features
$ npm run build --versionMajor=0 --versionMinor=0

# Or, if this doesn't work because of permissions:
$ npm run build && sudo $(which node) ./dist/index.js
```

The TypeScript scripts will be compiled and the software will be executed. Open `http://raspberrypi/`
(or whatever device name you may choose) in your browser to configure your Datenvogelhäuschen.

And don't forget to create a systemd service if you want the Datenvogelhäuschen software to run
automatically on startup. This is helpful in case of power shortages.

## 👥 Contributors
### Our Team
This Project was realized by:
 - Maximilian Lorenz
 - Mathis Vinzent Tillenburg
 - Marian Wodarczak
 - Samir Labas
 - Ben Engelhardt
 - Joshua Bohnhorst ([@jbohnst](https://github.com/jbohnst))

Under supervision of: 
- Christian Lübbering ([DBG Essen](https://dbgessen.eu/))

As part of the [VDE Technikpreis 2021](https://www.vde-rhein-ruhr.de/de/youngnet-regional/schule-mint/technikpreis).

### Contributions from other projects
To realize this project we use various libraries and documentations developed by volunteers 
outside our team. We sincerely thank everyone dedicating their free time to the Open Source 
projects used in the Datenvogelhäuschen.

Here are a few libraries we used:

- [i2c-bus](https://github.com/fivdi/i2c-bus) made by [@fivdi](https://github.com/fivadi) and 
  [a few other volunteers](https://github.com/fivdi/i2c-bus/graphs/contributors). 
- [pigpio](https://github.com/joan2937/pigpio) as well as the [node wrapper](https://github.com/fivdi/pigpio) also
  made by [@fivdi](https://github.com/fivadi) and [a few volunteers](https://github.com/fivdi/pigpio/graphs/contributors).
- [pigpio-dht](https://github.com/depuits/pigpio-dht) made by [@depuits](https://github.com/depuits) and
  [two other contributors](https://github.com/depuits/pigpio-dht/graphs/contributors).
- [bmp280-sensor](https://bitbucket.org/ptax/bmp280-sensor) by [@ptax](https://bitbucket.org/ptax).
- [pi-camera](https://github.com/stetsmando/pi-camera) made by [@stetsmando](https://github.com/stetsmando) and
  [6 other contributors](https://github.com/stetsmando/pi-camera/graphs/contributors).
- [express](https://github.com/expressjs/express) made by [a ton of contributors](https://github.com/expressjs/express/graphs/contributors).
- ... and many more!

Thanks to everyone making this possible.
