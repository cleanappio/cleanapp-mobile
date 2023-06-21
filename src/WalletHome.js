import React from 'react';
import {StyleSheet, Text, View, Button} from 'react-native';
import WalletSettings from './screens/WalletSettings';

export default class Home extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <WalletSettings navigation={this.props.navigation} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: '2%',
    paddingTop: '5%',
    paddingHorizontal: '4%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
