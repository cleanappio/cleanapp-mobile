
# CleanApp
CleanApp.app's mobile app to use the platform on mobile phones.

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