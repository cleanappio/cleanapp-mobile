/* eslint-disable react-native/no-inline-styles */
import 'react-native-gesture-handler';
import 'react-native-screens';
import {enableScreens} from 'react-native-screens';
import React, {useEffect, useState} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import TabComponent from './components/Tab';
import {onboard} from './functions/onboarding';
import {theme} from './services/Common/theme';
import {Leaderboard} from './screens/Leaderboard';
import CameraScreen from './screens/CameraScreen';
import CacheScreen from './screens/CacheScreen';
import ReportsScreen from './screens/ReportsScreen';
import ReportDetails from './screens/ReportDetails';
import ReviewCameraScreen from './screens/ReviewCameraScreen';
import MapScreen from './screens/MapScreen';
import {
  getFirstRun,
  getPrivacySetting,
  getUserName,
  getWalletAddress,
  isPrivacyAndTermsAccepted,
} from './services/DataManager';
import {
  updateOrCreateUser,
  updatePrivacyAndTOC,
} from './services/API/APIManager';
import {createStackNavigator} from '@react-navigation/stack';
import {useStateValue} from './services/State/State';
import {useNotifiedReports} from './hooks/useReadReports';
import Toast from './components/Toast';
import {ReportsProvider} from './contexts/ReportsContext';

enableScreens();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ReportsStack = ({
  markReportAsRead,
  markReportAsOpened,
  openedReports,
}) => {
  return (
    <ReportsProvider
      markReportAsRead={markReportAsRead}
      markReportAsOpened={markReportAsOpened}
      openedReports={openedReports}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
        <Stack.Screen name="ReportDetails" component={ReportDetails} />
        <Stack.Screen name="ReviewCameraScreen" component={ReviewCameraScreen} />
      </Stack.Navigator>
    </ReportsProvider>
  );
};

// Create a memoized component to avoid inline function issues
const MemoizedReportsStack = React.memo(ReportsStack);

const BottomTabs = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [{reports}] = useStateValue();
  const {
    notifiedReports,
    openedReports,
    isNewReport,
    isReportOpened,
    toastMessage,
    showToast,
    hideToast,
    saveNotifiedReports,
    clearNotifiedReports,
    setToastMessage,
    setShowToast,
    markReportAsRead,
    markReportAsOpened,
  } = useNotifiedReports(reports);

  return (
    <>
      <Toast
        message={toastMessage}
        visible={showToast}
        onHide={hideToast}
        duration={4000}
      />
      <Tab.Navigator
        initialRouteName="Camera"
        detachInactiveScreens={true}
        screenOptions={{
          tabBarStyle: {
            alignItems: 'center',
            justifyContent: 'space-evenly',
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
        }}>
        <Tab.Screen
          name="Cache"
          component={CacheScreen}
          options={{
            tabBarLabel: 'Cache',
            tabBarButton: props => (
              <TabComponent
                label="Cache"
                {...props}
                notifiedReports={notifiedReports}
                openedReports={openedReports}
                isNewReport={isNewReport}
                isReportOpened={isReportOpened}
                toastMessage={toastMessage}
                showToast={showToast}
                hideToast={hideToast}
                saveNotifiedReports={saveNotifiedReports}
                clearNotifiedReports={clearNotifiedReports}
                setToastMessage={setToastMessage}
                setShowToast={setShowToast}
                markReportAsOpened={markReportAsOpened}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Leaderboard"
          component={Leaderboard}
          options={{
            tabBarLabel: 'Leaderboard',
            tabBarButton: props => (
              <TabComponent
                label="Leaderboard"
                {...props}
                notifiedReports={notifiedReports}
                openedReports={openedReports}
                isNewReport={isNewReport}
                isReportOpened={isReportOpened}
                toastMessage={toastMessage}
                showToast={showToast}
                hideToast={hideToast}
                saveNotifiedReports={saveNotifiedReports}
                clearNotifiedReports={clearNotifiedReports}
                setToastMessage={setToastMessage}
                setShowToast={setShowToast}
                markReportAsOpened={markReportAsOpened}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            tabBarLabel: 'Camera',
            tabBarButton: props => (
              <TabComponent
                label="Camera"
                {...props}
                notifiedReports={notifiedReports}
                openedReports={openedReports}
                isNewReport={isNewReport}
                isReportOpened={isReportOpened}
                toastMessage={toastMessage}
                showToast={showToast}
                hideToast={hideToast}
                saveNotifiedReports={saveNotifiedReports}
                clearNotifiedReports={clearNotifiedReports}
                setToastMessage={setToastMessage}
                setShowToast={setShowToast}
                markReportAsOpened={markReportAsOpened}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Reports"
          options={{
            tabBarLabel: 'Reports',
            tabBarButton: props => (
              <TabComponent
                label="Reports"
                {...props}
                notifiedReports={notifiedReports}
                openedReports={openedReports}
                isNewReport={isNewReport}
                isReportOpened={isReportOpened}
                toastMessage={toastMessage}
                showToast={showToast}
                hideToast={hideToast}
                saveNotifiedReports={saveNotifiedReports}
                clearNotifiedReports={clearNotifiedReports}
                setToastMessage={setToastMessage}
                setShowToast={setShowToast}
                markReportAsRead={markReportAsRead}
                markReportAsOpened={markReportAsOpened}
              />
            ),
          }}>
          {() => (
            <MemoizedReportsStack
              markReportAsRead={markReportAsRead}
              markReportAsOpened={markReportAsOpened}
              openedReports={openedReports}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            tabBarLabel: 'Map',
            tabBarButton: props => (
              <TabComponent
                label="Map"
                {...props}
                notifiedReports={notifiedReports}
                openedReports={openedReports}
                isNewReport={isNewReport}
                isReportOpened={isReportOpened}
                toastMessage={toastMessage}
                showToast={showToast}
                hideToast={hideToast}
                saveNotifiedReports={saveNotifiedReports}
                clearNotifiedReports={clearNotifiedReports}
                setToastMessage={setToastMessage}
                setShowToast={setShowToast}
                markReportAsOpened={markReportAsOpened}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

const RootScreen = () => {
  useEffect(() => {
    getFirstRun().then(async ret => {
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

  return <BottomTabs />;
};

const CreateRootNavigator = () => {
  return (
    <NavigationContainer
      theme={{
        colors: {background: theme.COLORS.BG},
        fonts: DefaultTheme.fonts,
      }}>
      <RootScreen />
    </NavigationContainer>
  );
};

export default CreateRootNavigator;
