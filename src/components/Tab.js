/* eslint-disable react-native/no-inline-styles */
import React, {useRef} from 'react';
import {Image, View, StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import {theme} from '../services/Common/theme';
import {Transition, Transitioning} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

import LeaderboardIcon from '../assets/ico_leaderboard.svg';
import CameraIcon from '../assets/ico_camera.svg';
import MapIcon from '../assets/ico_map.svg';
import CameraShootIcon from '../assets/ico_camera_shoot.svg';
import CameraTakenIcon from '../assets/ico_camera_taken.svg';

import Ripple from './Ripple';
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
});

const icons = {
  Leaderboard: <LeaderboardIcon />,
  Camera: <CameraIcon />,
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
      <Ripple onPress={onPressCamera}>
        {cameraAction.requestCameraShot ? (
          <CameraTakenIcon />
        ) : (
          <CameraShootIcon />
        )}
      </Ripple>
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
            width: 45,
            height: 3,
            backgroundColor:
              isCamera && focused ? theme.COLORS.TEXT_GREY : 'transparent',
            marginBottom: 8,
            borderRadius: 3,
          }}
        />
        <View
          style={{
            width: 45,
            height: 45,
            borderRadius: 45,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: isCamera && !focused ? 2 : 0,
            borderColor: isCamera && !focused ? '#F3EFE0' : 'transparent',
          }}>
          {isCamera && focused ? <DrawCameraIcon /> : <>{icon}</>}
          <View style={styles.indicatorContainer}>
            {focused && label !== 'Camera' && (
              <View
                style={{
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
