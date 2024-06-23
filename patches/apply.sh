BASEDIR=$(dirname $0)
pushd ${BASEDIR}

patch -f ../node_modules/react-native-bottom-sheet/android/build.gradle node_modules/react-native-bottom-sheet/android/build.gradle.patch
patch -f ../node_modules/react-native-os/android/build.gradle node_modules/react-native-os/android/build.gradle.patch
patch -f ../node_modules/react-native-tcp/android/build.gradle node_modules/react-native-tcp/android/build.gradle.patch
patch -f ../node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/frameprocessors/VisionCameraProxy.kt node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/frameprocessors/VisionCameraProxy.kt.patch
rm -rf ../node_modules/react-native-tcp/ios/CocoaAsyncSocket

popd