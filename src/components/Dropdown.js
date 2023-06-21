/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  Modal,
  FlatList,
  Animated,
  TextInput,
  StyleSheet,
} from 'react-native';
import Ripple from './Ripple';
import PropTypes from 'prop-types';

const DropDown = ({
  showTitle = true,
  valueField = 'value',
  labelField = 'label',
  cancelText = 'Cancel',
  titleText = 'Select One',
  options = [],
  selected = null,
  onChange = () => {},
  icon = null,
}) => {
  const hasValue = selected && selected[valueField] && selected[labelField];
  const [animatedValue] = useState(new Animated.Value(hasValue ? 1 : 0));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: hasValue ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const labelStyle = {
    position: 'absolute',
    width: '100%',
    left: '5%',
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['28%', '13%'],
    }),
    bottom: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['25%', '5%'],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 10],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#36373a', '#000'],
    }),
  };

  return (
    <>
      <Ripple
        onPress={() => setVisible(true)}
        outerStyle={styles.containerOuter}
        innerStyle={styles.containerInner}>
        <View
          style={{
            flex: icon ? 0.85 : 1,
            alignItems: 'center',
            paddingHorizontal: '5%',
            justifyContent: 'center',
          }}>
          <Animated.Text style={labelStyle}>{titleText}</Animated.Text>
          <TextInput
            style={{
              marginTop: hasValue ? '2.5%' : 0,
              width: '100%',
              color: '#000',
            }}
            editable={false}
            value={selected && selected[labelField] ? selected[labelField] : ''}
          />
        </View>
        {icon ? <View style={{flex: 0.15}}>{icon}</View> : null}
      </Ripple>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}>
        <View style={styles.overlay}>
          <View style={{...styles.optionsContainer, ...styles.shadow}}>
            <FlatList
              data={options}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => index}
              ListHeaderComponent={
                showTitle ? (
                  <>
                    <View style={styles.optionInner}>
                      <Text style={{...styles.optionText, color: '#000'}}>
                        {titleText}
                      </Text>
                    </View>
                    <View style={styles.divider} />
                  </>
                ) : null
              }
              stickyHeaderIndices={showTitle ? [5] : null}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              renderItem={({item}) => (
                <Ripple
                  innerStyle={styles.optionInner}
                  onPress={() => {
                    setVisible(false);
                    onChange(item);
                  }}>
                  <Text
                    style={{
                      ...styles.optionText,
                      color: item.color ? item.color : null,
                    }}>
                    {item[labelField]}
                  </Text>
                </Ripple>
              )}
            />
          </View>
          <Ripple
            innerStyle={styles.optionInner}
            onPress={() => {
              setVisible(false);
              onChange(null);
            }}
            outerStyle={{...styles.cancelOptionOuter, ...styles.shadow}}>
            <Text style={styles.cancelOptionText}>{cancelText}</Text>
          </Ripple>
        </View>
      </Modal>
    </>
  );
};

DropDown.propTypes = {
  showTitle: PropTypes.string,
  valueField: PropTypes.string,
  labelField: PropTypes.string,
  cancelText: PropTypes.string,
  titleText: PropTypes.string,
  options: PropTypes.array,
  selected: PropTypes.object,
  onChange: PropTypes.func,
  icon: PropTypes.node,
};

export default DropDown;

const styles = StyleSheet.create({
  containerOuter: {
    elevation: 5,
    shadowRadius: 2,
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: '100%',
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: '#fff',
  },
  containerInner: {
    minHeight: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    paddingBottom: '5%',
    paddingVertical: '2%',
    paddingHorizontal: '5%',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(52,52,52,0.5)',
  },
  shadow: {
    elevation: 10,
  },
  optionsContainer: {
    maxHeight: '50%',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: '3%',
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#0271ff',
    textAlign: 'center',
  },
  optionInner: {
    paddingVertical: '4%',
    paddingHorizontal: '5%',
    backgroundColor: '#f0f0f0',
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e1e1',
  },
  cancelOptionOuter: {
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  cancelOptionText: {
    fontSize: 16,
    color: '#0271ff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
