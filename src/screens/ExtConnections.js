/* eslint-disable react-hooks/exhaustive-deps */
import {
  useWalletConnect,
  withWalletConnect,
} from '@walletconnect/react-native-dapp';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import {Platform, LogBox} from 'react-native';
import {default as AsyncStorage} from '@react-native-async-storage/async-storage';
import {styles} from '../styles/walletsettings';
import Button from '../components/Button';
import {ReadOnlyBox_} from './WalletSettings';
import {theme} from '../services/Common/theme';
import {
  LoginFromWalletConnect,
  LogoutFromWalletConnect,
} from '../functions/login';

import {useSelector} from 'react-redux';
import {ActivityIndicator} from 'react-native';
import Ripple from '../components/Ripple';

const ExtConnections = ({t, ...props}) => {
  const connector = useWalletConnect();
  const web3 = useSelector((state) => state.web3);

  const [ethAddress, setEthAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [Address, setAddress] = useState('Not Logged In');
  const [celoAddress, setCeloAddress] = useState('Not Logged In');
  const [cUSDBalance, setUSDBalance] = useState('Not Logged In');
  const [celoBalance, setCeloBalance] = useState('Not Logged In');
  const [ethBalance, setEthBalance] = useState('0');
  const [phoneNumber, setPhoneNumber] = useState('Not Logged In');
  const [helloWorldContract, setHelloWorldContract] = useState(null);
  const [contractName, setContractName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [message, setMessage] = useState('Loading...');
  const [connected, setConnected] = useState(false);
  const [wcLoading, setWCLoading] = useState(false);

  const [data, setData] = React.useState({
    secureTextEntry: true,
  });

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };

  const connectWallet = useCallback(async () => {
    let result = await connector.connect();
    if (result) {
      setAddress(result.accounts[0]);
      setMessage(`Connected to ${result.peerMeta.name}`);
      // connection flag
      setConnected(true);
    }

    return result;
  }, [connector]);

  useEffect(() => {
    if (connected) {
      // Login From Wallet
      LoginFromWalletConnect(connector, web3);
    }
  }, [connected]);

  useEffect(() => {
    return () => {};
  }, []);

  const signTransaction = useCallback(async () => {
    try {
      await connector.signTransaction({
        data: '0x',
        from: '0xbc28Ea04101F03aA7a94C1379bc3AB32E65e62d3',
        gas: '0x9c40',
        gasPrice: '0x02540be400',
        nonce: '0x0114',
        to: '0x89D24A7b4cCB1b6fAA2625Fe562bDd9A23260359',
        value: '0x00',
      });
    } catch (e) {}
  }, [connector]);

  const killSession = useCallback(async () => {
    setWCLoading(true);
    setMessage('Loading...');
    // Logout from wallet
    LogoutFromWalletConnect(web3).then(() => {
      setWCLoading(false);
      setConnected(false);
    });

    return connector.killSession();
  }, [connector]);

  return (
    <>
      <View style={styles.container}>
        {connector.connected ? (
          <>
            <View>
              <View>
                <Text style={styles.textBoxTitle}>
                  Connected to {connector.peerMeta.name}!
                </Text>
              </View>
              <ReadOnlyBox_
                title="Pubic Address"
                value={connector.accounts[0]}
              />
              <Ripple style={styles.buttonStyle} onPress={() => killSession()}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  {wcLoading && (
                    <ActivityIndicator
                      color={theme.COLORS.WHITE}
                      size="small"
                      style={{marginRight: 10}}
                    />
                  )}
                  <Text style={styles.buttonText}>{'Disconnect'}</Text>
                </View>
              </Ripple>
            </View>
          </>
        ) : (
          <View>
            <Ripple style={styles.buttonStyle} onPress={() => connectWallet()}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {wcLoading && (
                  <ActivityIndicator
                    color={theme.COLORS.WHITE}
                    size="small"
                    style={{marginRight: 10}}
                  />
                )}
                <Text style={styles.buttonText}>{'WalletConnect'}</Text>
              </View>
            </Ripple>
          </View>
        )}
      </View>
    </>
  );
};

export default ExtConnections;
