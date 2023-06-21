import React, {useState} from 'react';
import {Text, View, ScrollView, TextInput, Button} from 'react-native';
import {styles} from '../styles/wallet';
import {theme} from '../services/Common/theme';
import {setWalletData} from '../services/DataManager';
const NewWallet = ({t}, uponWalletAdded) => {
  const [publicKey, setPublicKey] = useState(
    '0xeb1FBE7D01f589d53fb8D1095cfb278A1B2e2271',
  );
  const [privateKey, setPrivateKey] = useState(
    '0xd349236494413e4f5f043e040146d5efc21ce2980ecf75f4509a0d993058ccec',
  );
  const [mnemonicPhrase, setMnemonicPhrase] = useState(
    'remain prefer dentist suffer rookie sustain garden twelve filter wreck virtual leaf',
  );
  const [, setPassword] = useState('');
  const onAddingWallet = async () => {
    if (publicKey === '' || publicKey == null) {
    } else if (privateKey === '' || privateKey == null) {
    } else if (mnemonicPhrase === '' || mnemonicPhrase == null) {
    } else {
      await setWalletData({
        privateKey: privateKey,
        publicKey: publicKey,
        seedPhrase: mnemonicPhrase,
        password: '',
      });
      uponWalletAdded(false);
    }
  };
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.sendAmountInputContainer}>
        <Text style={styles.inputLabel}>Public Key*</Text>
        <TextInput
          autoCorrect={false}
          spellCheck={false}
          selectable={true}
          style={styles.input}
          selectTextOnFocus={true}
          placeholderTextColor={theme.COLORS.WHITE}
          placeholder="Enter Public Key"
          onChangeText={setPublicKey}
        />
        <View style={styles.inputDivider} />
        <Text style={styles.inputLabel}>Priavte Key*</Text>
        <TextInput
          autoCorrect={false}
          spellCheck={false}
          selectable={true}
          style={styles.input}
          selectTextOnFocus={true}
          placeholderTextColor={theme.COLORS.WHITE}
          placeholder="Enter Private Key"
          onChangeText={setPrivateKey}
        />
        <View style={styles.inputDivider} />
        <Text style={styles.inputLabel}>Mnemonic*</Text>
        <TextInput
          autoCorrect={false}
          spellCheck={false}
          selectable={true}
          style={styles.input}
          selectTextOnFocus={true}
          placeholderTextColor={theme.COLORS.WHITE}
          placeholder="Enter Mnemonic"
          onChangeText={setMnemonicPhrase}
        />
        <View style={styles.inputDivider} />
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          autoCorrect={false}
          spellCheck={false}
          selectable={true}
          style={styles.input}
          selectTextOnFocus={true}
          placeholderTextColor={theme.COLORS.WHITE}
          placeholder="Enter password"
          onChangeText={setPassword}
        />
        <View style={styles.inputDivider} />
        <View>
          <Button
            height={60}
            onPress={() => onAddingWallet()}
            title="Add New Wallet"
            color={theme.APP_COLOR_3}
            textStyle={styles.addWalletButtonText}
            buttonStyle={styles.buttonStyle}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default NewWallet;
