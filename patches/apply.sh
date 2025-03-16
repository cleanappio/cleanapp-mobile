BASEDIR=$(dirname $0)
pushd ${BASEDIR}

patch < react-native-splash-screen.patch -f ../node_modules/react-native-splash-screen/android/build.gradle
rm -rf ../node_modules/react-native-tcp/ios/CocoaAsyncSocket

popd

patch < @rnmapbox+maps+10.1.33.patch
