const fs = require("fs");
const [_, __, newVersion, androidBuildNumber, iosBuildNumber] = process.argv;

const rootPackageJson = require("../package.json");
// TODO: Improve this, loop through each package instead of hardcoding
const socketPackageJson = require("../packages/socket-server/package.json");
const nativeAppPackageJson = require("../packages/native-app/package.json");
const sharedPackageJson = require("../packages/shared/package.json");
const buildGradlePath = "./packages/native-app/android/app/build.gradle";
const infoPlistPath = "./packages/native-app/ios/orient/Info.plist";

rootPackageJson.version = newVersion;
socketPackageJson.version = newVersion;
nativeAppPackageJson.version = newVersion;
sharedPackageJson.version = newVersion;

fs.writeFileSync("./package.json", JSON.stringify(rootPackageJson, null, 2));
fs.writeFileSync(
  "./packages/socket-server/package.json",
  JSON.stringify(socketPackageJson, null, 2)
);
fs.writeFileSync(
  "./packages/native-app/package.json",
  JSON.stringify(nativeAppPackageJson, null, 2)
);
fs.writeFileSync(
  "./packages/shared/package.json",
  JSON.stringify(sharedPackageJson, null, 2)
);

const buildGradleBuffer = fs.readFileSync(buildGradlePath);
const infoPlistBuffer = fs.readFileSync(infoPlistPath);

const currentAndroidBuildNumber = Number(
  /versionCode (?<buildNumber>[0-9])/g.exec(buildGradleBuffer.toString()).groups
    .buildNumber
);

const newBuildGradleContents = buildGradleBuffer
  .toString()
  .replace(/versionName '[0-9]\.[0-9]\.[0-9]'/g, `versionName '${newVersion}'`)
  .replace(
    /versionCode [0-9]/g,
    `versionCode ${androidBuildNumber || currentAndroidBuildNumber + 1}`
  );

const currentIosBuildNumber = Number(
  /<string>(?<buildNumber>[0-9])<\/string>/g.exec(infoPlistBuffer.toString())
    .groups.buildNumber
);

const newInfoPlistContents = infoPlistBuffer
  .toString()
  .replace(
    /<string>[0-9]\.[0-9]\.[0-9]<\/string>/g,
    `<string>${newVersion}</string>`
  )
  .replace(
    /<string>[0-9]<\/string>/g,
    `<string>${iosBuildNumber || currentIosBuildNumber + 1}</string>`
  );

fs.writeFileSync(buildGradlePath, newBuildGradleContents);
fs.writeFileSync(infoPlistPath, newInfoPlistContents);
