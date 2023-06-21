import moment from 'moment/moment';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import CButton from '../components/CButton';
import {theme} from '../services/Common/theme';
import {getWalletAddress} from '../services/DataManager';
import {getTransactions} from '../utils/EtherscanUtil';
import {fontFamilies} from '../utils/fontFamilies';
import {getWeb3} from '../web3/getWeb3';

export const WalletTransactions = (props) => {
  const [txs, setTxs] = useState([]);
  const [web3, setWeb3] = useState(null);
  const {t} = useTranslation();

  const [walletAddress, setWalletAddress] = useState('');

  const fetchTransactions = async () => {
    const wallet = await getWalletAddress();
    if (wallet) {
      setWalletAddress(wallet);
    }
    const response = await getTransactions(wallet);
    if (response && response.result) {
      setTxs(response.result);
    }
  };

  useEffect(() => {
    setWeb3(getWeb3);
    fetchTransactions();
  }, []);

  const TransactionCard = (props) => {
    const {item} = props;

    const {timeStamp, from, to, value} = item;

    const copyValue = JSON.stringify(item);

    const tokenAmount = web3.utils.fromWei(value, 'ether');

    const direction = walletAddress === from ? 'SEND TO' : 'RECEIVE FROM';
    const counterAddress = walletAddress === from ? to : from;

    const timeBefore = moment.unix(timeStamp).fromNow();
    return (
      <View style={styles.cardContainer}>
        <Text style={{...styles.cardHeader}}>{direction}</Text>
        <Text style={styles.cardBody}>{counterAddress}</Text>

        <Text style={{...styles.cardHeader, marginTop: 12}}>{'AMOUNT'}</Text>
        <Text style={styles.cardBody}>
          <Text style={styles.cardVal}>{tokenAmount}</Text>
          {' PTOY'}
        </Text>
        <Text style={{...styles.cardBody, marginTop: 12}}>{timeBefore}</Text>
        <View style={styles.copyButtonContainer}>
          <CButton text={copyValue} onCopied={(copyValue) => copyValue} />
        </View>
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={txs}
      renderItem={TransactionCard}
      ItemSeparatorComponent={() => <View style={{height: 16}} />}
      keyExtractor={(item, index) => index}
      nestedScrollEnabled
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    width: '100%',
    flex: 1,
  },
  cardContainer: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.BORDER_GOLD,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  cardHeader: {
    fontFamily: fontFamilies.DefaultBold,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 12,
    color: theme.COLORS.BORDER_GOLD,
  },

  cardVal: {
    fontFamily: fontFamilies.DefaultBold,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 16,
    color: theme.COLORS.WHITE,
  },
  cardBody: {
    fontFamily: fontFamilies.Default,
    fontWeight: '300',
    fontSize: 11,
    lineHeight: 16,
    color: theme.COLORS.WHITE,
  },
  copyButtonContainer: {
    position: 'absolute',
    top: 11,
    right: 16,
  },
});
