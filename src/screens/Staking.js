import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import Button from '../components/Button';
import CopyTextBox from '../components/CopyTextBox';
import {theme} from '../services/Common/theme';
import CButton from '../components/CButton';
import ApproveLiquidity from '../components/ApproveLiquidity';
import AddDTLiquidity from '../components/AddDTLiquidity';
import getCurrentTokens from '../components/AddDTLiquidity';
import Joinswap from '../components/Joinswap';
import JoinswapExternAmountIn from '../components/JoinswapExternAmountIn';
import * as StakesUtil from '../components/AddDTLiquidity';
import {contracts, web3} from '../web3/utils';
import {OceanPool} from '../components/OceanPool';
import {fontFamilies} from '../utils/fontFamilies';

const Staking = () => {
  const credentials = [
    {
      oneLine: false,
      label: 'Memoric Phrase',
      value:
        'following guitar strings colors rainbow cranial nerves planets hello twitter follow kiss',
    },
  ];

  const UnStakeDT = async () => {
    try {
      const ocean = new OceanPool();
      await ocean.removeDTLiquidity(
        contracts.walletAddress,
        contracts.newPool2,
        '20',
        '0.5',
      );
    } catch (error) {}
  };

  const StakeDT = async () => {
    try {
      //StakesUtil.AddDTLiquidity(contracts.walletAddress, contracts.oceanRinkeby, web3.utils.toHex(1e18))
      // StakesUtil.getCurrentTokens(contracts.oceanRinkeby) // get pool tokens (walletAddress is not accepted)
      // StakesUtil.getDTAddress(contracts.oceanRinkeby)
      // StakesUtil.getReserve( contracts.oceanRinkeby, contracts.phecorRinkeby )
      // StakesUtil.getMaxAddLiquidity(contracts.oceanRinkeby, contracts.phecorRinkeby)
      // StakesUtil.joinswapExternAmountIn(contracts.wallet,contracts.oceanRinkeby,contracts.phecorRinkeby,
      // web3.Utils.toHex(5e18), web3.Utils.toHex(1e18))
      // JoinswapExternAmountIn(contracts.walletAddress,contracts.oceanRinkeby,contracts.phecorRinkeby,
      // web3.utils.toBN(40), web3.utils.toBN(5))
      // AddDTLiquidity(contracts.walletAddress, contracts.oceanRinkeby, web3.utils.toHex(1e18))
      // Joinswap(contracts.walletAddress, contracts.oceanRinkeby,contracts.phecorRinkeby,
      // '50000000000000000000' , '0')
      // ApproveLiquidity(contracts.walletAddress,contracts.oceanRinkeby,contracts.phecorRinkeby,web3.utils.toHex(1e18))

      /**
       * //invalid pool addresses:
       * 1. contracts.phecorRinkeby: 0xe793...
       * 2. contracts.quicraLiqPool: 0xAAB9...
       * 3. contracts.oceanRinkeby: 0x8967...
       * //valid pool addresses
       * 1. 0xAa5226ACc808112E84249eD625cEB96b45AFD2Ac (pool contract created by newBPool() function)
       * 2: 0xc1d3b57309a066fae7aa170e94c501a4793d01ffe503c437e4a712d719c3483a
       */
      const ocean = new OceanPool();
      await ocean.addDTLiquidity(
        contracts.walletAddress,
        contracts.newPool2,
        '50',
      );
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.rows}>
        <View>
          <Text />
          <Text style={styles.quickra}>0 QUICRA-0 </Text>
          <Text style={styles.ocean}> 0 ETH </Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.txtPortfolio}> 24h Portfolio</Text>
          <Text style={styles.txtOceanDelta}> (+15.53%) </Text>
        </View>
      </View>
      <View>
        <Text style={styles.bigTextView}>Password</Text>
        <View style={styles.parent}>
          <Text numberOfLines={1} style={{marginTop: '4%', width: 100}}>
            this.state.pword
          </Text>
          <CButton text="this.state.pword" />
        </View>
      </View>
      <Button
        color="#f2f2f2"
        title="Stake"
        buttonStyle={{
          borderRadius: 25,
          width: '70%',
          alignSelf: 'center',
        }}
        onPress={() => StakeDT()}
        textStyle={{
          fontSize: 19,
          fontWeight: '600',
          color: theme.APP_COLOR,
          fontFamily: fontFamilies.DefaultBold,
        }}
      />
      <Button
        color="#f2f2f2"
        title="UnStake"
        buttonStyle={{
          borderRadius: 25,
          width: '70%',
          alignSelf: 'center',
        }}
        onPress={() => UnStakeDT()}
        textStyle={{
          fontSize: 19,
          fontWeight: '600',
          color: theme.APP_COLOR,
          fontFamily: fontFamilies.DefaultBold,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bigTextView: {
    fontFamily: 'Cochin',
    fontSize: 15,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    marginTop: '2%',
    paddingTop: '5%',
    paddingHorizontal: '4%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: theme.COLORS.WHITE,
  },
  rows: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickra: {
    fontSize: 27,
    fontWeight: '600',
    lineHeight: 33,
    color: theme.APP_COLOR,
    fontFamily: fontFamilies.DefaultBold,
  },
  ocean: {
    color: '#8C98A9',
    fontFamily: fontFamilies.DefaultBold,
    fontSize: 20,
    fontWeight: '600',
  },
  txtPortfolio: {
    color: theme.COLORS.BLACK,
    fontSize: 16,
    fontFamily: fontFamilies.Default,
  },
  txtOceanDelta: {
    color: '#84c380',
    fontSize: 20,
    fontFamily: fontFamilies.DefaultBold,
  },
  containers: {
    flex: 2,
    backgroundColor: '#9999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapperStyle: {
    backgroundColor: '#00000000',
    borderBottomColor: '#000000',
    borderBottomWidth: 1,
  },
  buttons: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
    borderColor: '#ffffff',
    borderWidth: 1,
    shadowColor: 'rgba(0,0,0,.12)',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    justifyContent: 'space-between',
  },
});

export default Staking;
