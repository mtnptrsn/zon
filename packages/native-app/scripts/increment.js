const packageJson = require('../package.json');
const fs = require('fs');
const [_, __, newVersion, androidBuildNumber, iosBuildNumber] = process.argv;
const buildGradlePath = './android/app/build.gradle';
const infoPlistPath = './ios/orient/Info.plist';

packageJson.version = newVersion;
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

const buildGradleBuffer = fs.readFileSync(buildGradlePath);
const infoPlistBuffer = fs.readFileSync(infoPlistPath);

const currentAndroidBuildNumber = Number(
  /versionCode (?<buildNumber>[0-9])/g.exec(buildGradleBuffer.toString()).groups
    .buildNumber,
);

const newBuildGradleContents = buildGradleBuffer
  .toString()
  .replace(/versionName '[0-9]\.[0-9]\.[0-9]'/g, `versionName '${newVersion}'`)
  .replace(
    /versionCode [0-9]/g,
    `versionCode ${androidBuildNumber || currentAndroidBuildNumber + 1}`,
  );

const currentIosBuildNumber = Number(
  /<string>(?<buildNumber>[0-9])<\/string>/g.exec(infoPlistBuffer.toString())
    .groups.buildNumber,
);

const newInfoPlistContents = infoPlistBuffer
  .toString()
  .replace(
    /<string>[0-9]\.[0-9]\.[0-9]<\/string>/g,
    `<string>${newVersion}</string>`,
  )
  .replace(
    /<string>[0-9]<\/string>/g,
    `<string>${iosBuildNumber || currentIosBuildNumber + 1}</string>`,
  );

fs.writeFileSync(buildGradlePath, newBuildGradleContents);
fs.writeFileSync(infoPlistPath, newInfoPlistContents);
