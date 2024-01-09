
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

*   MacOS: https://nodejs.org/en/download/package-manager#macos
*   Linux, Debian based: https://github.com/nodesource/distributions?tab=readme-ov-file#installation-instructions
*   General Linux: https://github.com/nodesource/distributions?tab=readme-ov-file
*   Other approaches: https://stackoverflow.com/questions/39981828/installing-nodejs-and-npm-on-linux

Then install yarn.

```
sudo npm install --global yarn
```

Make sure the Node.js related software has versions as expected.

```
yarn -v  # Expected to be >= 1.22.4
node -v  # Expected to be exactly = v18.17.1 
```

Use nvm to switch to a desired version.
```
nvm use 18.17.1
```

**Android**

Have Android studio installed

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

### Configure Mapbox
1.  Make sure the Mapbox download token is created.
    *   All public scopes are to be checked
    *   DOWNLOADS:READ from secret scopes is to be checked

    The token can be taken from the .env file if it already exists.

1.  Do platform specific setups
    1.  iOS

        Please signup to Mapbox and create a correct .netrc file in your home directory so you can install the CocoaPods package for Mapbox. Here are tutorials that help to do that:
        https://github.com/mapbox/mapbox-gl-native-ios/blob/d89e7139e5f6a9a3ea5ad57782b41579b8a0bbb1/platform/ios/INSTALL.md#cocoapods
        Discussion about this on GitHub: https://github.com/mapbox/mapbox-gl-native/issues/16581

        Here is a schema for the ~/.netrc file:
        ```
        machine api.mapbox.com
            login mapbox
            password <Download token>
        ```
    1. Android
        1.  Create the signing directory in your home directory.
            ```
            mkdir $HOME/.signing
            ```

        1.  Create the cleanapp.properties file in this directory
            ```
            touch $HOME/.signing/mapbox.downloadsToken
            ```

        1.  Add the following line into the cleanapp.properties:
            
            `mapbox.downloadsToken=<Download token>`

## iOS

### Pre-build

```
yarn install &&
yarn react-native link &&
npx pod-install &&
yarn ios:bundle
```

### Run app on iOS simulator

*There is no way to build and run on simulator fro the command line due to* ***error:0308010C:digital envelope routines::unsupported***

1.  Run Metro
    *  Open a new terminal window
    *  Run command ```yarn start```
1.  Open Xcode
1.  In menu: File -> Open...
1.  Click the ios/CleanApp.xcworkspace. The project will open
1.  In menu: Product / Clean build folder...
1.  Choose CleanApp > iPhone 14 or any desired simulator on top of Xcode window in the center
1.  In menu: Product > Run

The application will run on the chosen simulator.

### Deploy on TestFlight

1.  Make sure you have Apple Developer account fully set. If you use org account you have to have dev privileges there.
1.  Run Metro
    *  Open a new terminal window
    *  Run command ```yarn start```
1.  Open Xcode
1.  In menu: File -> Open...
1.  Click the ios/CleanApp.xcworkspace. The project will open
1.  On the left panel click CleanApp, make sure General tab is opened.
1.  Increment Build by 1
1.  Choose CleanApp > Any iOS Device (arm64) on top of Xcode window in the center
1.  In menu: Product / Clean build folder...
1.  In menu: Product > Archive
1.  After build is done, an Archives window will be opened. Click Distribute App button. Follow prompts.
1.  Go to https://appstoreconnect.apple.com in browser, login and monitor build rollout.

## Android

### Pre-build
```
yarn install && yarn react-native link

```

### Run app on Android simulator

1.  Clean the previous Android build
    ```
    yarn clean-android
    ```
1.  Run Metro
    *   Open a new terminal window
    *   Run metro command
        ```
        yarn run start
        ```
2.  Run the Android
    ```
    yarn run android
    ```

### Run debug app on the device

1.  Remove the CleanApp appliocation from the device if any was previously installed.
1.  Connect the device to the computer via USB.
1.  Do port reversing
    ```
    adb reverse tcp:8081 tcp:8081
    ```
1.  Run Metro
    *   Open a new terminal window
    *   Run metro command
        ```
        yarn run start
        ```
2.  Run the Android
    ```
    yarn run android
    ```

### Build release

#### Configure release keystore

1.  Create the signing directory in your home directory.
    ```
    mkdir $HOME/.signing
    ```
1.  Create the keystore file in the $HOME/.signing directory. File name should be "release.keystore".

    See e.g. https://instamobile.io/android-development/generate-react-native-release-build-android/

1. Create the properties file pointing to the keystore and containing password.
    ```
    echo "keystore=<your homedir>/.signing/release.keystore\nkeystore.password=<your keystore password>\nkeystore.alias=<your keystore alias>" >> $HOME/.signing/cleanapp.properties
    ```
1. Modify the file ```android/gradle.properties```.
    *   Find the line ```CleanApp.properties=...```
    *   Set the actual path to your cleanapp.properties file generated on previous step.
        
        ***You have to set a full path like /home/... or /Users/..., without variables like $HOME etc.***

#### Install and test the release version on the device
1.  Make sure the developer mode on the devise is enabled, https://developer.android.com/studio/debug/dev-options?authuser=3
1.  Uninstall any existing CleanApp applicationon teh device
1.  Connect the device to your computer by USB
1.  build the APK
    ```
    yarn android:bundle &&
    cd android &&
    ./gradlew clean &&
    ./gradlew assembleRelease -x bundleReleaseJsAndAssets &&
    cd ../
    ```
1.  Install apk to the device
    ```
    adb install android/app/build/outputs/apk/release/app-release.apk
    ```

#### Push the release on PlayStore
1.  build the .aab
    ```
    yarn android:bundle &&
    cd android &&
    ./gradlew clean &&
    ./gradlew bundleRelease -x bundleReleaseJsAndAssets &&
    cd ../
    ```
1. The bundle release android/app/build/outputs/bundle/release/app-release.aab is ready for upload to PlayStore

# Tips for building on Macbook m1/2

If you encounter problems to install because of brewlite, please use nvm to set your nodejs version e.g. to nvm install 16.17.0 works for the author.

For m1/m2 architecture users, please be aware that you have to install the arm64 versions of ffi and cocoapods to install the pods.

If you have an issue with npx pod-install like this:
CDN: trunk URL couldn't be downloaded: https://cdn.cocoapods.org/CocoaPods-version.yml
This can fix it:
1- At the top of the Podfile add this line
source 'https://github.com/CocoaPods/Specs.git' 
2- Remove the Podfile.lock file
3- pod repo remove trunk
4- pod install

If you are building the main.jsbundle and you get an error, replace the zlib library with browserify-zlib - that fixed it.
