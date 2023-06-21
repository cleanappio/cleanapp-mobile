import React from 'react';
import {Text, View} from 'react-native';
import Ripple from './Ripple';
import PropTypes from 'prop-types';

const Switcher = (props) => {
  const {
    options = [],
    selected = 0,
    onChange = () => {},
    editable = true,
  } = props || {};

  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 5,
        height: 55,
        elevation: 5,
        shadowRadius: 2,
        shadowOpacity: 0.3,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        paddingVertical: '1%',
        marginVertical: 5,
      }}>
      {options.map((option, index) => (
        <Ripple
          key={index}
          outerStyle={{
            backgroundColor: index === selected ? '#67c590' : '#fff',
            borderRadius: 5,
            flex: 1,
            marginHorizontal: '1%',
          }}
          innerStyle={{
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}
          disabled={!editable}
          onPress={() => onChange(index)}>
          {option.icon
            ? option.icon(index === selected ? '#fff' : '#67c590')
            : null}
          <Text
            style={{
              marginLeft: option.icon ? '10%' : 0,
              color: index === selected ? '#fff' : '#000',
            }}>
            {option.title}
          </Text>
        </Ripple>
      ))}
    </View>
  );
};

Switcher.propTypes = {
  options: PropTypes.array,
  onChange: PropTypes.func,
  selected: PropTypes.number,
  editable: PropTypes.bool,
};

export default Switcher;
