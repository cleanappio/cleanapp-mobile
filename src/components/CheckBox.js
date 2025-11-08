import * as React from 'react';
import {Text, Animated, TouchableOpacity, Easing} from 'react-native';
import EntypoIcon from 'react-native-vector-icons/Entypo';

class CheckBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      springValue: new Animated.Value(1),
    };
  }

  spring = () => {
    if (this.props.onChange) {
      this.props.onChange(!this.props.isChecked);
    }
    const {springValue} = this.state;
    springValue.setValue(0.7);
    Animated.spring(springValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  render() {
    const {
      title = '',
      size = 20,
      textColor = '#000',
      editable = true,
    } = this.props || {};
    const {springValue} = this.state;

    return (
      <TouchableOpacity
        style={{
          marginVertical: 5,
          alignItems: 'center',
          flexDirection: 'row',
        }}
        disabled={!editable}
        onPress={this.spring.bind(this, Easing.bounce)}>
        <Animated.View
          style={{
            width: size,
            height: size,
            borderWidth: 1,
            borderColor: this.props.isChecked ? '#00a9a5' : '#949aa2',
            borderRadius: 5,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: this.props.isChecked ? '#00a9a5' : 'transparent',
            transform: [{scale: springValue}],
          }}>
          {this.props.isChecked ? (
            <EntypoIcon name="check" color="#fff" size={size - 5} />
          ) : null}
        </Animated.View>
        <Text
          style={{
            marginLeft: 5,
            fontSize: size - 8,
            textAlign: 'center',
            marginTop: -2,
            color: textColor,
          }}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
}

export default CheckBox;
