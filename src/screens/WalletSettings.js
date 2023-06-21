import React, {Component, useState} from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
  Platform,
  Alert,
  Keyboard,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import {STPupdateAccounts, STPupdateSeedPhrase} from '../actions/actions.js';
import {WALLETTYPE_WC} from '../web3/constants';
import {styles} from '../styles/walletsettings';
import {
  chkNetwork,
  webThreeReturned,
  readStoredWallet,
} from '../functions/walletsettings';
import {withTranslation} from 'react-i18next';
import {theme} from '../services/Common/theme.js';
import IonIcon from 'react-native-vector-icons/Feather';
import Ripple from '../components/Ripple';
import Clipboard from '@react-native-clipboard/clipboard';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {removeWalletData} from '../services/DataManager';
import CButton from '../components/CButton';
import Feather from 'react-native-vector-icons/Feather';
import ReactNativeBiometrics from 'react-native-biometrics';

const ReadOnlyBoxActionButton = ({
  text,
  onCopied = () => {},
  isProtected = false,
}) => {
  const onCopy = () => {
    if (isProtected) {
      authenticate(() => {
        handleCopy();
      });
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    onCopied();
    Clipboard.setString(text);
    if (Platform.OS === 'ios') {
      Alert.alert('Copied to clipboard');
    } else {
      ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
    }
  };

  return (
    <Ripple onPress={onCopy}>
      <MaterialIcon
        size={15}
        name="content-copy"
        color={theme.COLORS.TULIP_TREE}
      />
    </Ripple>
  );
};

const authenticate = (onSuccess) => {
  const rnBiometrics = new ReactNativeBiometrics();

  rnBiometrics
    .simplePrompt({promptMessage: 'Scan fingerprint or face'})
    .then((resultObject) => {
      const {success} = resultObject;

      if (success) {
        onSuccess();
      } else {
      }
    })
    .catch(() => {});
};

export const ReadOnlyBox_ = ({
  title,
  value,
  isFocused,
  setFocused,
  type = '',
}) => {
  const [seedPhrase, setSeedPhrase] = useState({secureSeedPhrase: true});

  const toggleSecureSeedPhrase = () => {
    setSeedPhrase({
      ...seedPhrase,
      secureSeedPhrase: !seedPhrase.secureSeedPhrase,
    });
  };

  return (
    <View
      style={[styles.readOnlyBox, isFocused ? styles.readOnlyBoxShadow : {}]}>
      <View>
        <View style={styles.titleCopyButton}>
          <Text style={styles.textBoxTitle}>{title}</Text>
          <CButton text={value} onCopied={(value) => value} />
        </View>
        <View style={styles.titleCopyButton}>
          <TextInput
            autoCorrect={false}
            spellCheck={false}
            numberOfLines={2}
            style={styles.textBoxValue}
            value={value}
            maxLength={42}
            onFocus={() => Keyboard.dismiss()}
            secureTextEntry={seedPhrase.secureSeedPhrase ? true : false}
          />
          <View style={styles.secureFeather}>
            <TouchableOpacity onPress={toggleSecureSeedPhrase}>
              {seedPhrase.secureSeedPhrase ? (
                <Feather name="eye" color={theme.COLORS.TULIP_TREE} size={20} />
              ) : (
                <Feather
                  name="eye-off"
                  color={theme.COLORS.TULIP_TREE}
                  size={20}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {type === 'mnemonics' ? (
        <View>
          <Text numberOfLines={4} style={styles.textBoxPhraseValue}>
            <Text style={{color: 'yellow'}}>CAUTION! </Text>ALWAYS KEEP YOUR
            MNEMONIC PHRASE SECRET ! ANYONE WITH THIS PHRASE CAN ACCESS YOUR
            FUNDS AND REMOVE THEM PERMANENTLY
          </Text>
        </View>
      ) : null}
    </View>
  );
};

class WalletSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      publicKey: '',
      privateKey: '',
      pword: '',
      mnemonics: '',
      newdialogVisible: false,
      restoredialogVisible: false,
      selectedLanguage: '',
      networktype: 'none',
      wallet: ' ',
      ethTokenBal: ' ',
      oceanERC20TokenBal: ' ',
      phec0ERC20TokenBal: ' ',
      account: '0x0',
      daiToken: '',
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      age: '',
      focused: '',
      newWallet: false,
      walletType: '',
      wcWalletAddress: '',
    };
    // const [age, setAge] = useState('')

    this.web3 = null;
    this.rinkebynet = 'none';
    this.ropstennet = 'none';
    this.kovannet = 'none';
    this.mainnet = 'none';
    this.rinkebyCheck = 'none';
    this.ropstenCheck = 'none';
    this.kovannetCheck = 'none';
    this.mainnetCheck = 'none';
    //this.wallet = ""
  }
  componentDidMount() {
    chkNetwork(this);
    webThreeReturned(this);
    readStoredWallet(this);
  }
  uponWalletAdded = () => {
    this.setState({newWallet: false});
  };

  render() {
    const {t} = this.props;

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View
          style={{
            paddingVertical: 17,
          }}>
          {this.state.walletType !== WALLETTYPE_WC ? (
            <>
              <ReadOnlyBox_
                type="publicKey"
                value={this.state.publicKey}
                title={t('walletSettings.publicKey')}
                setFocused={(val) => this.setState({focused: val})}
                isFocused={this.state.focused === t('walletSettings.publicKey')}
              />
              <ReadOnlyBox_
                type="mnemonics"
                value={this.state.mnemonics}
                title={t('walletSettings.mnemonicPhrase')}
                setFocused={(val) => this.setState({focused: val})}
                isFocused={
                  this.state.focused === t('walletSettings.mnemonicPhrase')
                }
              />
              <ReadOnlyBox_
                type="privateKey"
                value={this.state.privateKey}
                title={t('walletSettings.privateKey')}
                setFocused={(val) => this.setState({focused: val})}
                isFocused={
                  this.state.focused === t('walletSettings.privateKey')
                }
              />
            </>
          ) : (
            <ReadOnlyBox_
              type="publicKey"
              value={this.state.wcWalletAddress}
              title={t('walletSettings.publicKey')}
              setFocused={(val) => this.setState({focused: val})}
              isFocused={this.state.focused === t('walletSettings.publicKey')}
            />
          )}
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => ({
  web3: state.web3,
  account: state.reducers.account,
  seedPhrase: state.reducers.seedPhrase,
});

const mapDispatchToProps = (dispatch) => {
  // Action
  return {
    STPupdateAccounts: (account0) => dispatch(STPupdateAccounts(account0)),
    STPupdateSeedPhrase: (seedPhrase) =>
      dispatch(STPupdateSeedPhrase(seedPhrase)),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(WalletSettings),
);
