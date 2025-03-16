/* eslint-disable react-native/no-inline-styles */
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabComponent from './components/Tab';
import { StyleSheet, Image, View, Text, AppState } from 'react-native';
import { theme } from './services/Common/theme';
import { useStateValue } from './services/State/State';
import { Onboarding } from './screens/Onboarding';
import { Leaderboard } from './screens/Leaderboard';
import CameraScreen from './screens/CameraScreen';
import MapScreen from './screens/MapScreen';
import CacheScreen from './screens/CacheScreen';
import ReferralScreen from './screens/ReferralScreen';
import { getFirstRun, getPrivacySetting, getUserName, getWalletAddress, isPrivacyAndTermsAccepted } from './services/DataManager';
import { updateOrCreateUser, updatePrivacyAndTOC } from './services/API/APIManager';
import { useTheme } from 'react-native-elements';

const Tab = createBottomTabNavigator();

const BottomTabs = ({ navigation }) => {
  return (
    <Tab.Navigator
      initialRouteName="Camera"
      detachInactiveScreens={true}
      screenOptions={{
        tabBarStyle: {
          alignItems: "center",
          justifyContent: "space-evenly",
          height: 60,
          headerShown: false,
          paddingHorizontal: 30,
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
  );
};

const RootScreen = () => {
  console.log('RootScreen');
  const [isOnboarding, setIsOnboarding] = useState(false);

  const completeOnboarding = () => {
    setIsOnboarding(false);
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
    <NavigationContainer theme={{
      colors: { background: theme.COLORS.BG },
      fonts: DefaultTheme.fonts,
    }}>
      <RootScreen />
    </NavigationContainer>
  );
};

export default CreateRootNavigator;
