/* eslint-disable react-native/no-inline-styles */
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabComponent from './components/Tab';
import { StyleSheet, Image, View, Text, AppState } from 'react-native';
import { theme } from './services/Common/theme';
import { useStateValue } from './services/State/State';
import { Onboarding } from './screens/Onboarding';
import { Leaderboard } from './screens/Leaderboard';
import { fontFamilies } from './utils/fontFamilies';
import CameraScreen from './screens/CameraScreen';
import MapScreen from './screens/MapScreen';
import CacheScreen from './screens/CacheScreen';
import ReferralScreen from './screens/ReferralScreen';
import { getFirstRun, getPrivacySetting, getUserName, getWalletAddress, isPrivacyAndTermsAccepted } from './services/DataManager';
import { updateOrCreateUser, updatePrivacyAndTOC } from './services/API/APIManager';

const Tab = createBottomTabNavigator();

const BottomTabs = ({ navigation }) => {
  const [
    {
      showLandingPageWalkthrough,
      showUploadImagePageWalkthrough,
      showVerifyImagePageWalkthrough,
      showAnnotateImagePageWalkthrough,
      cameraAction,
    },
    dispatch,
  ] = useStateValue();

  const showWalkthrough =
    showLandingPageWalkthrough ||
    showUploadImagePageWalkthrough ||
    showVerifyImagePageWalkthrough ||
    showAnnotateImagePageWalkthrough;

  return (
    <>
      <Tab.Navigator
        initialRouteName="Camera"
        screenOptions={{
          tabBarStyle: {
            alignItems: "center",
            justifyContent: "space-evenly",
            height: 60,
            headerShown: false,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Cache"
          component={CacheScreen}
          options={{
            tabBarLabel: "Cache",
            tabBarButton: (props) => (
              <TabComponent label="Cache" {...props} />
            ),
          }}
        />
        <Tab.Screen
          name="Leaderboard"
          component={Leaderboard}
          options={{
            tabBarLabel: "Leaderboard",
            tabBarButton: (props) => (
              <TabComponent label="Leaderboard" {...props} />
            ),
          }}
        />
        <Tab.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            tabBarLabel: "Camera",
            tabBarButton: (props) => (
              <TabComponent
                label="Camera"
                dispatch={dispatch}
                cameraAction={cameraAction}
                {...props}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Referral"
          component={ReferralScreen}
          options={{
            tabBarLabel: "Referral",
            tabBarButton: (props) => (
              <TabComponent label="Referral" {...props} />
            ),
          }}
        />
        <Tab.Screen
          name="MapScreen"
          component={MapScreen}
          options={{
            tabBarLabel: "Map",
            tabBarButton: (props) => <TabComponent label="Map" {...props} />,
          }}
        />
      </Tab.Navigator>
    </>
  );
};

const RootScreen = () => {
  const [isOnboarding, setIsOnboarding] = useState(false);

  const completeOnboarding = () => {
    console.log('completeOnboarding...');
    setIsOnboarding(false);
    console.log('Done!');
  }

  useEffect(() => {
    getFirstRun().then(async (ret) => {
      if (ret && ret.firstRun) {
        const walletAddress = await getWalletAddress();
        const userAvatar = await getUserName();
        if (!walletAddress || !userAvatar || !userAvatar.userName) {
          setIsOnboarding(true);
          return;
        }
        const privacySetting = await getPrivacySetting();
        const termAccepted = await isPrivacyAndTermsAccepted();
        await updateOrCreateUser(walletAddress, userAvatar.userName);
        await updatePrivacyAndTOC(
          walletAddress,
          privacySetting === 0 ? 'share_data_live' : 'not_share_data_live',
          termAccepted ? 'ACCEPTED' : 'REJECTED',
        );
        setIsOnboarding(false);
      } else {
        setIsOnboarding(true);
      }
    });
  }, []);


  return (
    <>
      {isOnboarding && <Onboarding completeOnboarding={completeOnboarding} />}
      {!isOnboarding && <BottomTabs />}
    </>
  );
};

const CreateRootNavigator = () => {
  return (
    <NavigationContainer theme={{ colors: { background: theme.COLORS.BG } }}>
      <RootScreen />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  leftIcon: {
    width: 40,
    height: 24,
  },
  rightIcon: {
    width: 32,
    height: 30,
  },
  leftButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.APP_COLOR_2,
  },
  languageButtonOuter: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: theme.APP_COLOR_2,
  },
  rightButton: {
    padding: 5,
    borderRadius: 30,
  },
  languageOptionsContainer: {
    borderRadius: 30,
    backgroundColor: theme.COLORS.BLACK,
  },
  flagIcon: {
    width: 16,
    height: 16,
    marginRight: 14,
  },
  languageBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 17,
    paddingVertical: 8,
  },
  languageOption: {
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderColor: theme.COLORS.WHITE_OPACITY_3P,
  },
  languageOptionText: {
    fontSize: 14,
    height: 20,
    marginTop: 4,
    fontFamily: fontFamilies.DefaultBold,
    color: theme.COLORS.WHITE_OPACITY_3P,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 54,
    height: 42,
    marginRight: 5,
  },
});
export default CreateRootNavigator;
