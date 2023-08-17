/* eslint-disable react-native/no-inline-styles */
import React, {useRef} from 'react';
import {Image, View, StyleSheet, TouchableHighlight} from 'react-native';
import styled from 'styled-components/native';
import {theme} from '../services/Common/theme';
import {Transition, Transitioning} from 'react-native-reanimated';
import LeaderboardIcon from '../assets/ico_leaderboard.svg';
import MapIcon from '../assets/ico_map.svg';
const CleanAppIcon = require('../assets/CleanApp_Logo.png');
import {actions} from '../services/State/Reducer';

const styles = StyleSheet.create({
  indicatorContainer: {
    marginTop: 7,
    bottom: 0,
    position: 'absolute',
    justifyContent: 'center',
  },
  indicator: {
    height: 4,
    width: 4,
  },
  cameraWrapper: {
    marginTop: -40,
  },
  cameraContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    borderWidth: 2,
    borderColor: theme.APP_COLOR_2,
    borderRadius: 40,
    width: 80,
    height: 80,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 60,
    height: 60,
  },
});

const icons = {
  Leaderboard: <LeaderboardIcon />,
  Camera: <Image source={CleanAppIcon} style={styles.cameraIcon} />,
  Map: <MapIcon />,
};

const Container = styled.TouchableWithoutFeedback``;
const Background = styled(Transitioning.View)`
  flex: auto;
  margin: 8px;
  margin-top: 0px;
  align-items: center;
  justify-content: center;
  background: transparent;
`;

function Tab({
  label,
  accessibilityState,
  onPress,
  dispatch = null,
  cameraAction = {requestCameraShot: false},
}) {
  const focused = accessibilityState.selected;
  const icon = icons[label];
  const isCamera = label === 'Camera';

  const transition = (
    <Transition.Sequence>
      <Transition.Out type="fade" durationMs={0} />
      <Transition.Change interpolation="easeInOut" durationMs={100} />
      <Transition.In type="fade" durationMs={10} />
    </Transition.Sequence>
  );

  const ref = useRef();

  const onPressCamera = () => {
    dispatch({
      type: actions.SET_CAMERA_ACTION,
      cameraAction: {
        requestCameraShot: true,
      },
    });
  };

  const DrawCameraIcon = () => {
    return (
      <View style={styles.cameraWrapper}>
        <TouchableHighlight
          onPress={onPressCamera}
          style={styles.cameraContainer}>
          <View style={styles.fabContainer}>
            {cameraAction.requestCameraShot ? (
              <Image
                source={CleanAppIcon}
                resizeMode="cover"
                style={styles.cameraIcon}
              />
            ) : (
              <Image
                source={CleanAppIcon}
                resizeMode="cover"
                style={styles.cameraIcon}
              />
            )}
          </View>
        </TouchableHighlight>
      </View>
    );
  };

  return (
    <Container
      onPress={() => {
        ref.current.animateNextTransition();
        onPress();
      }}>
      <Background
        ref={ref}
        label={label}
        focused={focused}
        transition={transition}>
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {focused && label === 'Camera' ? <>{icon}</> : <>{icon}</>}
          <View style={styles.indicatorContainer}>
            {focused && label !== 'Camera' && (
              <View
                style={{
                  marginTop: -45,
                  width: 4,
                  height: 4,
                  borderRadius: 4,
                  backgroundColor: 'white',
                }}
              />
            )}
          </View>
        </View>
      </Background>
    </Container>
  );
}

export default Tab;
