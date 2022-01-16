const fs = require("fs");
const child_process = require("child_process");


console.log("Prebuild: creating version.ts!");

// Get current commit id
const commit = child_process.execSync("git rev-parse HEAD").toString().trim();

if(process.env.npm_config_releaseBuild) {
    if (!process.env.npm_config_versionMajor || !process.env.npm_config_versionMinor) {
        console.log("Prebuild: missing arguments: --versionMajor=... --versionMinor=...!");
        process.exit(-1);
    }

    fs.writeFileSync("src/version.ts", `
        export default {
          softwareName: "Datenvogelhäuschen",
          softwareVersionMajor: ${process.env.npm_config_versionMajor},
          softwareVersionMinor: ${process.env.npm_config_versionMinor},
          softwareVersionCommit: "${commit}",
          notVersioned: false
        };
    `);

    console.log("Prebuild: created version.ts! (notVersioned: false)");
} else {
    fs.writeFileSync("src/version.ts", `
        export default {
          softwareName: "Datenvogelhäuschen",
          softwareVersionMajor: 0,
          softwareVersionMinor: 0,
          softwareVersionCommit: "${commit}",
          notVersioned: true
        };
    `);

    console.log("Prebuild: created version.ts! (notVersioned: true)");
}
