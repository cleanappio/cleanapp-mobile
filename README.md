# CleanApp

CleanApp.app's mobile app to use the platform on mobile phones.

The software is developed using React Native, so if you encounter any issues because of React Native you can search with that additional information.

# Installing and Running the app

The full setup is currently available on MacOS only. The Android only build can be done on Linus as well. In that case you can skip iOS related steps in this README.

## Pre-requisites

**React Native**

The first step to run the software is to setup React Native development setup on your machine. React Native has tutorials for different operating systems and mobile platforms here:
https://reactnative.dev/docs/environment-setup

You can find detailed instructions on using React Native and many tips in [its documentation](https://reactnative.dev/docs/getting-started).

**Node.js**

First you have to install node.js.

- MacOS: https://nodejs.org/en/download/package-manager#macos
- Linux, Debian based: https://github.com/nodesource/distributions?tab=readme-ov-file#installation-instructions
- General Linux: https://github.com/nodesource/distributions?tab=readme-ov-file
- Other approaches: https://stackoverflow.com/questions/39981828/installing-nodejs-and-npm-on-linux

Then install yarn.

```
sudo npm install --global yarn
```

Make sure the Node.js related software has versions as expected.

```
yarn -v  # Expected to be >= 1.22.4
node -v  # Expected to be exactly = v18.20.2
```

Use nvm to switch to a desired version.

```
nvm use 18.20.2
```

**Android**

Have Android studio installed

- Check that all available versions of CMake are installed

Make sure Jetifier is installed.

```
npx jetify
```

**iOS**

Make sure you installed XCode and Simulator

Please use an iPhone 12 or newer in the simulator as this is the minimum requirement right now.

Make sure you installed cocoa pod with version >= 1.10.1

```
pod --version
```

## Clone this repository

Change to the directory that you want to clone the code into.

```
git clone https://github.com/cleanappio/cleanapp-mobile.git &&
cd cleanapp-mobile
```

## Configure Environment

### Prepare .env File

All environment variables are stored in the .env file in the project directory. The .env file is never to be pushed to git.

Take the .env file from the Google Drive `CleanApp/Engineering/Mobile App Env` folder. Ask project admins for the link. Copy the .env file into a project root directory.

### Choose the application mode

- Open .env prepared in the previous step
- Modify the value of the APP_MODE variable. Set one of values:
  - `local` - for the local build & testing with backend running locally;
  - `dev` - for build and testing with the backend running on dev cloud environment;
  - `prod` - for production build;

### Configure Mapbox

1.  Make sure the Mapbox download token is created.

    - All public scopes are to be checked
    - DOWNLOADS:READ from secret scopes is to be checked

    The token can be taken from the .env file if it already exists.

1.  Do platform specific setups

    1.  iOS

        Create a correct .netrc file in your home directory so you can install the CocoaPods package for Mapbox. Here are tutorials that help to do that:
        https://github.com/mapbox/mapbox-gl-native-ios/blob/d89e7139e5f6a9a3ea5ad57782b41579b8a0bbb1/platform/ios/INSTALL.md#cocoapods
        Discussion about this on GitHub: https://github.com/mapbox/mapbox-gl-native/issues/16581

        Here is a schema for the ~/.netrc file:

        ```
        machine api.mapbox.com
            login mapbox
            password <Download token>
        ```

    1.  Android

        1.  Create the signing directory in your home directory.

            ```
            mkdir $HOME/.signing
            ```

        1.  Create the cleanapp.properties file in this directory

            ```
            touch $HOME/.signing/cleanapp.properties
            ```

        1.  Add the following line into the cleanapp.properties:

            `mapbox.downloadsToken=<Download token>`

## Version Management

CleanApp uses a centralized version management system to ensure consistency across all platforms.
NOTE: Please make sure to make the scripts executable by running the command: chmod +x <file_name>.(js/sh)

### Version Configuration

The app version is managed through `version.json` which serves as the single source of truth:

```json
{
  "version": "3.2.8",
  "buildNumber": 21,
  "versionCode": 39,
  "description": "CleanApp version configuration - single source of truth for all platforms"
}
```

### Updating Versions

#### Automatic Version Updates

```bash
# Patch version (3.2.8 -> 3.2.9)
npm run version:patch

# Minor version (3.2.8 -> 3.3.0)
npm run version:minor

# Major version (3.2.8 -> 4.0.0)
npm run version:major
```

#### Manual Version Updates

1. Edit `version.json` with new version numbers
2. Sync across platforms: `npm run sync-version`

For detailed version management documentation, see [VERSION_MANAGEMENT.md](docs/VERSION_MANAGEMENT.md).

## iOS

### Pre-build

```
yarn install &&
./patches/apply.sh &&
npx pod-install &&
yarn ios:bundle
```

### Run app on iOS simulator

_There is no way to build and run on simulator from the command line due to_ **_error:0308010C:digital envelope routines::unsupported_**

1.  Run Metro
    - Open a new terminal window
    - Run command `yarn start`
1.  Open Xcode
1.  In menu: File -> Open...
1.  Click the `ios/CleanApp.xcworkspace`. The project will open
1.  In menu: `Product / Clean build folder...`
1.  Choose `CleanApp > iPhone 14` or any desired simulator on top of Xcode window in the center
1.  In menu: `Product > Run`

The application will run on the chosen simulator.

### Deploy on TestFlight

1.  Make sure you have Apple Developer account fully set. If you use org account you have to have dev privileges there.
1.  Update version numbers in `version.json` and run `npm run sync-version`
1.  Run Metro
    - Open a new terminal window
    - Run command `yarn start`
1.  Open Xcode
1.  In menu: File -> Open...
1.  Click the `ios/CleanApp.xcworkspace`. The project will open
1.  On the left panel click CleanApp, make sure General tab is opened.
1.  Choose CleanApp > Any iOS Device (arm64) on top of Xcode window in the center
1.  In menu: `Product / Clean build folder...`
1.  In menu: `Product > Archive`
1.  After build is done, an Archives window will be opened. Click Distribute App button. Follow prompts.
1.  Go to https://appstoreconnect.apple.com in browser, login and monitor build rollout.

## Android

### Pre-build

```
yarn install && ./patches/apply.sh
```

### Interactive Build Script

CleanApp includes an interactive build script that simplifies the Android build process:

```bash
# Interactive mode - prompts for build type
./scripts/build-android.sh

# Command line mode
./scripts/build-android.sh debug     # Debug build only
./scripts/build-android.sh release   # Release build only
./scripts/build-android.sh both      # Both debug and release
./scripts/build-android.sh --help    # Show help
```

### Run app on Android simulator

1.  Clean the previous Android build
    ```
    yarn clean-android
    ```
1.  Run Metro
    - Open a new terminal window
    - Run metro command
      ```
      yarn run start
      ```
1.  Run the Android
    ```
    yarn run android
    ```

### Run debug app on the device

1.  Remove the CleanApp application from the device if any was previously installed.
1.  Connect the device to the computer via USB.
1.  Do port reversing
    ```
    adb reverse tcp:8081 tcp:8081
    ```
1.  Run Metro
    - Open a new terminal window
    - Run metro command
      ```
      yarn run start
      ```
1.  Run the Android
    ```
    yarn run android
    ```

### Build Release APK

#### Configure release keystore

Follow the react native guide: https://reactnative.dev/docs/signed-apk-android

#### Build and install release APK

1.  Update version numbers in `version.json` and run `npm run sync-version`
1.  Use the interactive build script:
    ```bash
    ./scripts/build-android.sh release
    ```
    Or manually:
    ```bash
    yarn android:bundle &&
    cd android &&
    ./gradlew clean &&
    ./gradlew assembleRelease &&
    cd ../
    ```
1.  Install APK to the device
    ```bash
    adb install android/app/build/outputs/apk/release/app-release.apk
    ```

### Build Release AAB for Play Store

1.  Update version numbers in `version.json` and run `npm run sync-version`
1.  Build the AAB:
    ```bash
    yarn android:bundle &&
    cd android &&
    ./gradlew clean &&
    ./gradlew bundleRelease &&
    cd ../
    ```
1.  The bundle release `android/app/build/outputs/bundle/release/app-release.aab` is ready for upload to Play Store

## Build Script Features

The Android build script (`scripts/build-android.sh`) provides:

- **Interactive Mode**: Prompts user to choose build type
- **Command Line Mode**: Direct build execution with arguments
- **Version Display**: Shows current app version and build timing
- **APK Information**: Displays file locations and sizes
- **Error Handling**: Validates environment and dependencies
- **Colored Output**: Clear, professional build feedback

### Build Script Usage Examples

```bash
# Interactive build (recommended for first-time users)
./scripts/build-android.sh

# Quick debug build
./scripts/build-android.sh debug

# Production release build
./scripts/build-android.sh release

# Build both versions
./scripts/build-android.sh both

# Show help and usage
./scripts/build-android.sh --help
```
