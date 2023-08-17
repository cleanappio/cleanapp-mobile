/* eslint-disable react-native/no-inline-styles */
import 'react-native-gesture-handler';
import {enableScreens} from 'react-native-screens';
enableScreens();
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TabComponent from './components/Tab';
import {StyleSheet, Image, View, Text, AppState} from 'react-native';
import Loading from './screens/Loading';
import Ripple from './components/Ripple';
import {theme} from './services/Common/theme';
import i18n from './languages/i18n';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useStateValue} from './services/State/State';

import settingIcon from './assets/setting.png';
import {Onboarding} from './screens/Onboarding';
import {Leaderboard} from './screens/Leaderboard';
import {fontFamilies} from './utils/fontFamilies';
import CameraScreen from './screens/CameraScreen';
import MapScreen from './screens/MapScreen';
import CacheScreen from './screens/CacheScreen';
import BasketBGIcon from './assets/ico_basket_bg.svg';
import BasketIcon from './assets/ico_basket.svg';
import CreateGuildScreen from './screens/CreateGuildScreen';
import GuildScreen from './screens/GuildScreen';
import {getLocation} from './functions/geolocation';
import {actions} from './services/State/Reducer';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const Header = ({isTransparent = true}, navigation) => ({
  headerShown: true,
  headerTransparent: true,
  headerTitle: () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
      }}>
      <Ripple
        onPress={() => {
          navigation.navigate('CacheScreen');
        }}
        containerStyle={{}}
        style={{
          marginTop: 0,
          paddingTop: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <BasketBGIcon />
        <View
          style={{
            position: 'absolute',
            width: '100%',
            paddingBottom: 5,
            alignItems: 'center',
          }}>
          <BasketIcon />
        </View>
      </Ripple>
    </View>
  ),
  headerTitleStyle: {
    color: theme.COLORS.WHITE,
    textTransform: 'uppercase',
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 18,
    paddingTop: 0,
  },
  headerStyle: {
    height: 22,
    paddingTop: 0,
    marginTop: 0,
    shadowOpacity: 0,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  headerLeft: null,
  headerRight: null,
});

const LeaderboardStack = () => {
  const [{}, dispatch] = useStateValue();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Leaderboard"
        component={Leaderboard}
        options={({navigation}) => {
          return Header(
            {
              title: i18n.t('landing.Leaderboard'),
              isTransparent: true,
              showBackButton: false,
              dispatch,
            },
            navigation,
          );
        }}
      />
      <Stack.Screen
        name="CreateGuild"
        component={CreateGuildScreen}
        options={({navigation}) => {
          return Header(
            {
              title: i18n.t('landing.Leaderboard'),
              isTransparent: true,
              showBackButton: false,
              dispatch,
            },
            navigation,
          );
        }}
      />
      <Stack.Screen
        name="GuildList"
        component={GuildScreen}
        options={({navigation}) => {
          return Header(
            {
              title: i18n.t('landing.Leaderboard'),
              isTransparent: true,
              showBackButton: false,
              dispatch,
            },
            navigation,
          );
        }}
      />
    </Stack.Navigator>
  );
};

const CameraScreenStack = () => {
  const [{}, dispatch] = useStateValue();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CameraScreen"
        component={CameraScreen}
        options={({navigation}) => {
          return Header(
            {
              title: '',
              isTransparent: true,
              showBackButton: true,
              dispatch,
            },
            navigation,
          );
        }}
      />
    </Stack.Navigator>
  );
};

const MapScreenStack = () => {
  const [{}, dispatch] = useStateValue();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
        options={({navigation}) => {
          return Header(
            {
              title: '',
              isTransparent: true,
              showBackButton: true,
              dispatch,
            },
            navigation,
          );
        }}
      />
    </Stack.Navigator>
  );
};

const CacheScreenStack = () => {
  const [{}, dispatch] = useStateValue();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CacheScreen"
        component={CacheScreen}
        options={({navigation}) => {
          return Header(
            {
              title: '',
              isTransparent: true,
              showBackButton: true,
              dispatch,
            },
            navigation,
          );
        }}
      />
    </Stack.Navigator>
  );
};

const BottomTabs = ({navigation}) => {
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

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        navigation.navigate('Camera');
      }
    };

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  return (
    <>
      <Tab.Navigator
        initialRouteName="Camera"
        tabBarOptions={{
          style: {
            zIndex: 1,
            height: 80,
            backgroundColor: 'transparent',
            elevation: 3,
            shadowColor: theme.APP_COLOR_1,
            shadowOffset: {
              width: 5,
              height: 5,
            },
            shadowOpacity: 0.5,
            paddingBottom: 25,
            paddingVertical: 20,
          },
        }}>
        <Tab.Screen
          name="Leaderboard"
          component={LeaderboardStack}
          options={{
            unmountOnBlur: true,
            tabBarButton: (props) => (
              <TabComponent label="Leaderboard" {...props} />
            ),
          }}
        />
        <Tab.Screen
          name="Camera"
          component={CameraScreenStack}
          options={{
            unmountOnBlur: true,
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
          name="MapScreen"
          component={MapScreenStack}
          options={{
            unmountOnBlur: true,
            tabBarButton: (props) => <TabComponent label="Map" {...props} />,
          }}
        />
        <Tab.Screen
          name="CacheScreen"
          component={CacheScreenStack}
          options={{
            unmountOnBlur: true,
            tabBarButton: (props) => null,
          }}
        />
      </Tab.Navigator>
    </>
  );
};

const RootStack = () => {
  const [, dispatch] = useStateValue();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Loading"
        component={Loading}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Onboarding"
        component={Onboarding}
        options={({navigation}) => {
          return Header(
            {
              title: '',
              isTransparent: true,
              showBackButton: true,
              dispatch,
            },
            navigation,
          );
        }}
      />
      <Stack.Screen
        name="Home"
        component={BottomTabs}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const CreateRootNavigator = () => {
  return (
    <NavigationContainer theme={{colors: {background: theme.COLORS.BG}}}>
      <RootStack />
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
