import {
  Animated,
  BackAndroid,
  BackHandler,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Ripple from './Ripple';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {theme} from '../services/Common/theme';
import LinearGradient from 'react-native-linear-gradient';
import {fontFamilies} from '../utils/fontFamilies';

const HwBackHandler = BackHandler || BackAndroid;
const HW_BACK_EVENT = 'hardwareBackPress';

const {OS} = Platform;

export default class Alert extends Component {
  constructor(props) {
    super(props);
    const {show} = this.props;
    this.springValue = new Animated.Value(0.3);

    this.state = {
      showSelf: false,
    };

    if (show) {
      this._springShow(true);
    }
  }

  componentDidMount() {
    HwBackHandler.addEventListener(HW_BACK_EVENT, this._handleHwBackEvent);
  }

  _springShow = (fromConstructor) => {
    const {useNativeDriver = false} = this.props;
    this._toggleAlert(fromConstructor);
    Animated.spring(this.springValue, {
      toValue: 1,
      bounciness: 20,
      useNativeDriver,
    }).start();
  };

  _springHide = () => {
    const {useNativeDriver = false} = this.props;
    if (this.state.showSelf === true) {
      Animated.spring(this.springValue, {
        toValue: 0,
        tension: 20,
        useNativeDriver,
      }).start();
      setTimeout(() => {
        this._toggleAlert();
        this._onDismiss();
      }, 150);
    }
  };

  _toggleAlert = (fromConstructor) => {
    if (fromConstructor) {
      this.state = {showSelf: true};
    } else {
      this.setState({showSelf: !this.state.showSelf});
    }
  };

  _handleHwBackEvent = () => {
    const {closeOnHardwareBackPress} = this.props;
    if (this.state.showSelf && closeOnHardwareBackPress) {
      this._springHide();
      return true;
    } else if (!closeOnHardwareBackPress && this.state.showSelf) {
      return true;
    }
    return false;
  };

  _onTapOutside = () => {
    const {closeOnTouchOutside} = this.props;
    if (closeOnTouchOutside) {
      this._springHide();
    }
  };

  _onDismiss = () => {
    const {onDismiss} = this.props;
    onDismiss && onDismiss();
  };

  _renderButton = (data) => {
    const {text, onPress, backgroundColor} = data;
    return (
      <Ripple
        outerStyle={{backgroundColor: backgroundColor, ...styles.buttonOuter}}
        innerStyle={styles.buttonInner}
        onPress={onPress}>
        <Text style={styles.buttonText}>{text}</Text>
      </Ripple>
    );
  };

  _renderAlert = () => {
    const animation = {transform: [{scale: this.springValue}]};
    const {title, message, type} = this.props;
    const {
      showCancelButton,
      cancelText,
      cancelButtonStyle,
      cancelButtonTextStyle,
      onCancelPressed,
    } = this.props;
    const {
      showConfirmButton,
      confirmText,
      confirmButtonStyle,
      confirmButtonTextStyle,
      onConfirmPressed,
    } = this.props;

    const cancelButtonData = {
      text: cancelText,
      backgroundColor: '#ed3237',
      buttonStyle: cancelButtonStyle,
      buttonTextStyle: cancelButtonTextStyle,
      onPress: () => {
        this._springHide();
        setTimeout(onCancelPressed, 200);
      },
    };

    const confirmButtonData = {
      text: confirmText,
      backgroundColor: '#67c590',
      buttonStyle: confirmButtonStyle,
      buttonTextStyle: confirmButtonTextStyle,
      onPress: () => {
        this._springHide();
        setTimeout(onConfirmPressed, 200);
      },
    };

    const colors = {
      success: '#23b574',
      error: '#ed3237',
      info: '#46B8DA',
      warn: '#f7b217',
    };

    const iconStyle = {
      size: 30,
      color: '#fff',
    };

    const icons = {
      info: <FontAwesomeIcon name="info" {...iconStyle} />,
      warn: <FontAwesomeIcon name="question" {...iconStyle} />,
      success: <EntypoIcon name="check" {...iconStyle} />,
      error: <FontAwesomeIcon name="remove" {...iconStyle} />,
    };

    return (
      <View style={styles.container}>
        <View style={styles.overlay} />
        <Animated.View style={[styles.contentContainer, animation]}>
          {icons[type]}
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {showCancelButton ? (
            <LinearGradient
              end={{x: 1, y: 0}}
              start={{x: 0.15, y: 0}}
              colors={[theme.COLORS.DARK_PURPLE_1, theme.COLORS.DARK_BLUE_1]}
              style={styles.radius30}>
              <Ripple
                style={styles.gradientButtonInner}
                onPress={cancelButtonData.onPress}>
                <Text style={styles.buttonText}>{cancelButtonData.text}</Text>
              </Ripple>
            </LinearGradient>
          ) : null}
          {showConfirmButton ? (
            <View style={styles.button}>
              <Ripple
                style={styles.gradientButtonInner}
                onPress={confirmButtonData.onPress}>
                <Text style={styles.buttonText}>{confirmButtonData.text}</Text>
              </Ripple>
            </View>
          ) : null}
        </Animated.View>
      </View>
    );
  };

  render() {
    const {show, showSelf} = this.state;
    const {modalProps = {}, closeOnHardwareBackPress} = this.props;

    const wrapInModal = OS === 'android' || OS === 'ios';

    return showSelf ? (
      wrapInModal ? (
        <Modal
          animationType="none"
          transparent={true}
          visible={show}
          statusBarTranslucent={true}
          onRequestClose={() => {
            if (showSelf && closeOnHardwareBackPress) {
              this._springHide();
            }
          }}
          {...modalProps}>
          {this._renderAlert()}
        </Modal>
      ) : (
        this._renderAlert()
      )
    ) : null;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {show} = nextProps;
    const {showSelf} = this.state;

    if (show && !showSelf) {
      this._springShow();
    } else if (show === false && showSelf) {
      this._springHide();
    }
  }

  componentWillUnmount() {
    HwBackHandler.removeEventListener(HW_BACK_EVENT, this._handleHwBackEvent);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'flex-end',
  },
  overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: theme.COLORS.COD_GRAY_OPACITY_50P,
  },
  contentContainer: {
    elevation: 10,
    maxWidth: '95%',
    minWidth: '95%',
    borderRadius: 30,
    marginBottom: 51,
    paddingVertical: 38,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: theme.APP_COLOR_2,
  },
  title: {
    fontSize: 16,
    marginTop: 11,
    lineHeight: 30,
    color: theme.COLORS.WHITE,
    textTransform: 'uppercase',
    fontFamily: fontFamilies.DefaultBold,
    fontWeight: Platform.OS === 'ios' ? '700' : 'normal',
  },
  message: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
    color: theme.COLORS.WHITE,
    textTransform: 'uppercase',
    fontFamily: fontFamilies.DefaultLight,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
  },
  radius30: {
    borderRadius: 30,
  },
  gradientButtonInner: {
    width: 300,
    borderRadius: 30,
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: '5%',
    paddingHorizontal: '1%',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 21,
    textAlign: 'center',
    color: theme.COLORS.WHITE,
    textTransform: 'uppercase',
    fontFamily: fontFamilies.DefaultBold,
    fontWeight: Platform.OS === 'ios' ? '600' : 'normal',
  },
  button: {
    marginTop: 15,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  action: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  buttonOuter: {
    flex: 1,
    margin: 5,
    borderRadius: 5,
  },
  buttonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
});

Alert.propTypes = {
  show: PropTypes.bool,
  useNativeDriver: PropTypes.bool,
  showProgress: PropTypes.bool,
  type: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  closeOnTouchOutside: PropTypes.bool,
  closeOnHardwareBackPress: PropTypes.bool,
  showCancelButton: PropTypes.bool,
  showConfirmButton: PropTypes.bool,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
  cancelButtonColor: PropTypes.string,
  confirmButtonColor: PropTypes.string,
  onCancelPressed: PropTypes.func,
  onConfirmPressed: PropTypes.func,
  customView: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.node,
    PropTypes.func,
  ]),
  modalProps: PropTypes.object,
};

Alert.defaultProps = {
  show: false,
  useNativeDriver: false,
  showProgress: false,
  closeOnTouchOutside: true,
  closeOnHardwareBackPress: true,
  showCancelButton: false,
  showConfirmButton: false,
  cancelText: 'Cancel',
  confirmText: 'Confirm',
  cancelButtonColor: '#D0D0D0',
  confirmButtonColor: '#AEDEF4',
  customView: null,
  modalProps: {},
};
