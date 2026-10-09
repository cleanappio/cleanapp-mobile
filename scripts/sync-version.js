#!/usr/bin/env node

/**
 * Version Sync Script
 * Synchronizes app version across all platforms from version.json
 */

const fs = require('fs');
const path = require('path');

const VERSION_FILE = path.join(__dirname, '..', 'version.json');
const PACKAGE_JSON = path.join(__dirname, '..', 'package.json');
const ANDROID_BUILD_GRADLE = path.join(
  __dirname,
  '..',
  'android',
  'app',
  'build.gradle',
);
const IOS_PROJECT_PBXPROJ = path.join(
  __dirname,
  '..',
  'ios',
  'CleanApp.xcodeproj',
  'project.pbxproj',
);
const IOS_INFO_PLISTS = [
  path.join(__dirname, '..', 'ios', 'CleanApp', 'Info.plist'),
  path.join(__dirname, '..', 'ios', 'CleanAppShareExtension', 'Info.plist'),
];

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
  }
}

function updateAndroidBuildGradle(version, versionCode) {
  try {
    let content = fs.readFileSync(ANDROID_BUILD_GRADLE, 'utf8');

    // Update versionName
    content = content.replace(
      /versionName\s+"[^"]*"/,
      `versionName "${version}"`,
    );

    // Update versionCode
    content = content.replace(
      /versionCode\s+\d+/,
      `versionCode ${versionCode}`,
    );

    fs.writeFileSync(ANDROID_BUILD_GRADLE, content);
    console.log(
      `✅ Updated Android build.gradle - version: ${version}, versionCode: ${versionCode}`,
    );
  } catch (error) {
    console.error('Error updating Android build.gradle:', error.message);
  }
}

function updateIOSProject(version, buildNumber) {
  try {
    let content = fs.readFileSync(IOS_PROJECT_PBXPROJ, 'utf8');

    // Update MARKETING_VERSION
    content = content.replace(
      /MARKETING_VERSION = [^;]+;/g,
      `MARKETING_VERSION = ${version};`,
    );

    // Update CURRENT_PROJECT_VERSION
    content = content.replace(
      /CURRENT_PROJECT_VERSION = [^;]+;/g,
      `CURRENT_PROJECT_VERSION = ${buildNumber};`,
    );

    fs.writeFileSync(IOS_PROJECT_PBXPROJ, content);
    console.log(
      `✅ Updated iOS project - version: ${version}, build: ${buildNumber}`,
    );
  } catch (error) {
    console.error('Error updating iOS project:', error.message);
  }
}

function updatePackageJson(version) {
  try {
    const packageJson = readJsonFile(PACKAGE_JSON);
    if (packageJson) {
      packageJson.version = version;
      writeJsonFile(PACKAGE_JSON, packageJson);
    }
  } catch (error) {
    console.error('Error updating package.json:', error.message);
  }
}

function updateIOSInfoPlists(version, buildNumber) {
  IOS_INFO_PLISTS.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    [
      ['CFBundleShortVersionString', version],
      ['CFBundleVersion', String(buildNumber)],
    ].forEach(([key, value]) => {
      const pattern = new RegExp(`(<key>${key}</key>\\s*<string>)[^<]*(</string>)`);
      if (!pattern.test(content)) {
        throw new Error(`Missing ${key} in ${filePath}`);
      }
      content = content.replace(pattern, (_, before, after) => before + value + after);
    });
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
  });
}

function main() {
  console.log('🔄 Syncing app version across all platforms...\n');

  // Read version configuration
  const versionConfig = readJsonFile(VERSION_FILE);
  if (!versionConfig) {
    console.error('❌ Failed to read version.json');
    process.exit(1);
  }

  const {version, buildNumber, versionCode} = versionConfig;

  console.log(`📱 Version: ${version}`);
  console.log(`🔢 Build Number: ${buildNumber}`);
  console.log(`📦 Version Code: ${versionCode}\n`);

  // Update package.json
  updatePackageJson(version);

  // Update Android build.gradle
  updateAndroidBuildGradle(version, versionCode);

  // Update iOS project
  updateIOSProject(version, buildNumber);
  updateIOSInfoPlists(version, buildNumber);

  console.log('\n✅ Version sync completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Run: cd ios && pod install');
  console.log('2. Clean and rebuild your project');
  console.log('3. Test on both platforms');
}

if (require.main === module) {
  main();
}

module.exports = {
  readJsonFile,
  writeJsonFile,
  updateAndroidBuildGradle,
  updateIOSProject,
  updatePackageJson,
  updateIOSInfoPlists,
};
