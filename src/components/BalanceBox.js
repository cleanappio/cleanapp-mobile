import React, {useState, useEffect} from 'react';
import {Text, View, RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {styles} from '../styles/wallet';
import {theme} from '../services/Common/theme';
import {
  retrievedContracts,
  retrievedCurrTokens,
} from '../functions/walletactions';
import {currWalletBals} from '../functions/walletactions';
import {POOL_ADDRESS} from '../../env';
import {web3} from '../web3/utils';
import minABI from '../abis/minABI.json';
import {retrievedCoins} from '../functions/walletactions';

export const BalanceBox = () => {
  const [walletBal, setWalletBal] = useState('0');
  const [symbol, setSymbol] = useState('');

  useEffect(() => {
    const init = async () => {
      const balances = await currWalletBals(web3, minABI, POOL_ADDRESS);
      const coins = await retrievedCoins(web3, minABI, POOL_ADDRESS);

      if (coins && balances) {
        setWalletBal(balances);
        setSymbol(coins);
      }
    };
    init();
  }, []);

  return (
    <>
      <ScrollView>
        <View style={styles.quicraContainer}>
          <Text style={styles.oceanText}>
            {walletBal.ethBal} <Text style={styles.percentText}> {'ETH'}</Text>
          </Text>
          <Text style={styles.oceanText}>
            {walletBal.oceanBal}{' '}
            <Text style={styles.percentText}> {symbol.oceanSymbol}</Text>
          </Text>
          <View style={styles.oceanPortfolioContainer}>
            <Text style={styles.oceanText}>
              {walletBal.tokenBal}{' '}
              <Text style={styles.percentText}> {symbol.tokenSymbol}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
};
