import React, {useState} from 'react';
import {Text, View, ScrollView, TextInput} from 'react-native';
import Button from '../components/Button';
import {theme} from '../services/Common/theme';
import {styles} from '../styles/wallet';
import {withTranslation} from 'react-i18next';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {BalanceBox} from '../components/BalanceBox';

const portfolioOptions = [
  {
    portfolio: '24h Portfolio',
    percentValue: '(+15.53%)',
  },
  {
    portfolio: '1w Portfolio ',
    percentValue: '(+9.22%)',
  },
  {
    portfolio: '1m Portfolio',
    percentValue: '(+11.74%)',
  },
  {
    portfolio: '3m Portfolio ',
    percentValue: '(-1.61%)',
    danger: true,
  },
];

const Wallet = ({t}) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState(
    portfolioOptions[0],
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.quicraContainer}>
        <View style={styles.oceanPortfolioContainer}>
          <View>
            <BalanceBox />
          </View>
          <View>
            <Menu renderer={renderers.ContextMenu}>
              <MenuTrigger
                customStyles={{
                  triggerOuterWrapper: styles.menuTriggerContainer,
                }}>
                <View style={styles.menuTrigger}>
                  <View style={styles.portfolioContainer}>
                    <Text style={styles.portfolioText}>
                      {selectedPortfolio.portfolio}
                    </Text>
                    <Text
                      style={
                        selectedPortfolio.danger
                          ? styles.percentTextDanger
                          : styles.percentText
                      }>
                      {selectedPortfolio.percentValue}
                    </Text>
                  </View>
                  <EntypoIcon
                    size={20}
                    name="chevron-small-down"
                    color={theme.COLORS.WHITE}
                  />
                </View>
              </MenuTrigger>
              <MenuOptions
                customStyles={{optionsContainer: styles.menuOptionsContainer}}>
                {portfolioOptions &&
                  portfolioOptions.length > 0 &&
                  portfolioOptions.map((item, index) => (
                    <>
                      <MenuOption
                        style={styles.menuOption}
                        onSelect={() => setSelectedPortfolio(item)}>
                        <View>
                          <Text style={styles.portfolioText}>
                            {item.portfolio}
                          </Text>
                          <Text
                            style={
                              item.danger
                                ? styles.percentTextDanger
                                : styles.percentText
                            }>
                            {item.percentValue}
                          </Text>
                        </View>
                      </MenuOption>
                      {index < portfolioOptions.length - 1 && (
                        <View style={styles.menuOptionDivider} />
                      )}
                    </>
                  ))}
              </MenuOptions>
            </Menu>
          </View>
        </View>
      </View>
      <View style={styles.sendAmountInputContainer}>
        <Text style={styles.inputLabel}>{t('walletActions.sendTo')}</Text>
        <TextInput
          autoCorrect={false}
          spellCheck={false}
          selectable={true}
          style={styles.input}
          selectTextOnFocus={true}
          placeholderTextColor={theme.COLORS.WHITE}
          placeholder={t('walletActions.destinationAddress')}
        />
        <View style={styles.inputDivider} />
        <Text style={styles.inputLabel}>Amount</Text>
        <TextInput
          autoCorrect={false}
          spellCheck={false}
          selectable={true}
          style={styles.input}
          selectTextOnFocus={true}
          placeholderTextColor={theme.COLORS.WHITE}
          placeholder={t('walletActions.amountToSend')}
        />
        <Text style={styles.sendAmountDollarText}>= 12 USD</Text>
      </View>
      <Button
        height={55}
        title="Send"
        onPress={() => {}}
        color={theme.APP_COLOR_2}
        textStyle={styles.buttonText}
        buttonStyle={styles.buttonStyle}
      />
    </ScrollView>
  );
};

export default withTranslation()(Wallet);
