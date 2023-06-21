import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, KeyboardAvoidingView} from 'react-native';
import {connect} from 'react-redux';
import {getWeb3} from '../web3/getWeb3';
import {styles} from '../styles/walletactions';
import {withTranslation} from 'react-i18next';
import {useStateValue} from '../services/State/State';
import {getTokenBalance} from '../utils/PtoyToken';
import {
  getWalletAddress,
  getWalletData,
  getWalletType,
} from '../services/DataManager';
import {WALLETTYPE_LOCAL} from '../web3/constants';

const WalletActions = ({t, ...props}) => {
  const [destination, setDestination] = useState('');
  //const [password, setPassword] = useState("")
  const [, setWeb3] = useState(undefined);
  const [tokenBal, setTokenBal] = useState(0);
  const [currencyVal, setCurrencyVal] = useState(0);
  const [, setNewAccount] = useState('');
  const [, setNewPKey] = useState('');

  const [{currencySettings}] = useStateValue();

  const [, setCurrentWalletType] = useState(WALLETTYPE_LOCAL);

  const [, setCurrentWalletAddress] = useState('');

  const init = async () => {
    const _web3 = getWeb3();
    const walletData = await getWalletData();
    const _newAccount = walletData.publicKey;
    const _newPKey = walletData.privateKey;

    const walletAddress = await getWalletAddress();
    const walletType = await getWalletType();
    setCurrentWalletType(walletType);
    setCurrentWalletAddress(walletAddress);
    const _tokenBal = await getTokenBalance(_web3, walletAddress);
    setWeb3(_web3);
    setNewAccount(_newAccount);
    setNewPKey(_newPKey);
    setDestination(destination);
    setTokenBal(_tokenBal);
    setCurrencyVal((Number(_tokenBal) * currencySettings.rate).toFixed(2));
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <KeyboardAvoidingView behavior="position">
      <ScrollView showsVerticalScrollIndicator={true}>
        <View style={styles.container}>
          <View>
            <Text style={styles.txtBalance}>{`${tokenBal} PTOY`}</Text>
            <Text style={styles.txtCurrency}>{`= ${currencyVal} USD`}</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const mapStateToProps = (state) => ({
  web3: state.web3,
  account: state.reducers.account,
  seedPhrase: state.reducers.seedPhrase,
  password: state.reducers.password,
});

export default withTranslation()(connect(mapStateToProps, null)(WalletActions));
