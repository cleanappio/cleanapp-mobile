/* eslint-disable react-native/no-inline-styles */
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabComponent from './components/Tab';
import { onboard } from './functions/onboarding';
import { theme } from './services/Common/theme';
import { Leaderboard } from './screens/Leaderboard';
import CameraScreen from './screens/CameraScreen';
import CacheScreen from './screens/CacheScreen';
import ReferralScreen from './screens/ReferralScreen';
import { getFirstRun, getPrivacySetting, getUserName, getWalletAddress, isPrivacyAndTermsAccepted } from './services/DataManager';
import { updateOrCreateUser, updatePrivacyAndTOC } from './services/API/APIManager';

const Tab = createBottomTabNavigator();

const BottomTabs = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      initialRouteName="Camera"
      detachInactiveScreens={true}
      screenOptions={{
        tabBarStyle: {
          alignItems: "center",
          justifyContent: "space-evenly",
          height: 60 + insets.bottom,
          headerShown: false,
          paddingHorizontal: 30,
          paddingBottom: insets.bottom,
          backgroundColor: theme.APP_COLOR_1,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
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
    </Tab.Navigator>
  );
};

const RootScreen = () => {

  useEffect(() => {
    getFirstRun().then(async (ret) => {
      if (ret && ret.firstRun) {
        const walletAddress = await getWalletAddress();
        const userAvatar = await getUserName();
        if (!walletAddress || !userAvatar || !userAvatar.userName) {
          await onboard();
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
      } else {
        await onboard();
      }
    });
  }, []);

  return (
    <BottomTabs />
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
