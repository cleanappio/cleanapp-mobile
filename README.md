
# CleanApp
CleanApp.app's mobile app to use the platform on mobile phones.

The software is developed using React Native, so if you encounter any issues because of React Native you can search with that additional information.

The first step to run the software is to setup React Native development setup on your machine. React Native has tutorials for different operating systems and mobile platforms here:
https://reactnative.dev/docs/environment-setup

## iOS development

Please use an iPhone 12 or better in the simulator as this is the minimum requirement right now.

# Installing and Running the app

## Clone this repository
Change to the directory that you want to clone the code into.
```
git clone https://github.com/cleanappio/cleanapp-mobile.git
cd cleanapp-mobile
```

## Dependencies:
### Mapbox

Please signup to Mapbox and create a correct .netrc file so you can install the CocoaPods package for Mapbox. Here are tutorials that help to do that:
https://github.com/mapbox/mapbox-gl-native-ios/blob/d89e7139e5f6a9a3ea5ad57782b41579b8a0bbb1/platform/ios/INSTALL.md#cocoapods
Discussion about this on GitHub:
https://github.com/mapbox/mapbox-gl-native/issues/16581

Here is a schema for the .netrc file:
```
machine api.mapbox.com
    login mapbox
    password sk.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Available Scripts

### `npm install` or `yarn`
It will add all the required components for your project to run inside your node_modules.
## Install Pods for iOS
### npx pod-install
It will install all of pods files required for your project.
## Running app in Android or iOS
In the project directory, you can run:
### `npx react-native run-android` or `npx react-native run-ios`
## OR
### `react-native run-android` or `react-native run-ios`
Runs the app in development mode.<br>
On android emulator or ios simulator.
The page will automatically reload if you make changes to the code.<br>
You will see the build errors and lint warnings in the console.
## User Guide
You can find detailed instructions on using React Native and many tips in [its documentation](https://reactnative.dev/docs/getting-started).

# tips for building on Macbook m1/2

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

# Commands to run the iOS version on Mac

Requirements:

pod --version => >= 1.10.1

yarn -v => >= 1.22.4

node -v => >= v14.0.0

XCode + Simulator installed

Then run in the root directory:
```
yarn

yarn react-native link

npx pod-install

npx react-native run-ios
```


# Commands to run the Android version on Windows
```
yarn install --check-files
react-native run-android
```
