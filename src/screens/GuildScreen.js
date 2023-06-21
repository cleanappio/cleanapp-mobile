import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, TextInput} from 'react-native';
import {fontFamilies} from '../utils/fontFamilies';
import {theme} from '../services/Common/theme';
import {Text} from 'react-native';
import SearchIcon from '../assets/ico_search.svg';
import {FlatList} from 'react-native-gesture-handler';
import RenderStat from '../components/RenderStat';
import Ripple from '../components/Ripple';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
const test_leaderboard_guilds = [
  {
    username: 'The ETHerius',
    value: 12345,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Altcoin Gang',
    value: 12344,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'CyberBytes',
    value: 12343,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Cryptoholics',
    value: 12342,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'CoinLoco',
    value: 12341,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Ace Crypto',
    value: 12340,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Blockdot',
    value: 12339,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Gorecovery',
    value: 12338,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Cryptoblen',
    value: 12337,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Koinox',
    value: 12336,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'The ETHerius',
    value: 12345,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Altcoin Gang',
    value: 12344,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'CyberBytes',
    value: 12343,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Cryptoholics',
    value: 12342,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'CoinLoco',
    value: 12341,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Ace Crypto',
    value: 12340,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Blockdot',
    value: 12339,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Gorecovery',
    value: 12338,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Cryptoblen',
    value: 12337,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
  {
    username: 'Koinox',
    value: 12336,
    desc: 'Welcome to Apex Launchers guild. Inactive people will be kicked out.\n\n\nLorem ipsum dolor sit amet consectetur. Nunc faucibus id dictum amet iaculis sed ut nunc mauris. Non eu senectus nec elementum et gravida. Nisl enim eget elementum nisl ut quis. Sapien diam sit libero tellus blandit at in. Urna ipsum id volutpat aliquet feugiat etiam venenatis. Et id ac diam ac feugiat quis tempus viverra iaculis.\n\n\nLets clean the world !',
    members: 67,
  },
];

const GuildScreen = () => {
  const [guildlist, setGuildlist] = useState(test_leaderboard_guilds);
  const navigation = useNavigation();
  const {t} = useTranslation();

  const openCreateGuildScreen = () => {
    navigation.navigate('CreateGuild');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('guildscreen.joinaguild')}</Text>
        <View style={styles.searchContainer}>
          <SearchIcon />
          <TextInput
            autoCorrect={false}
            spellCheck={false}
            underlineColor="transparent"
            activeUnderlineColor={'transparent'}
            style={{
              height: 30,
              marginLeft: 6,
              minWidth: 50,
              backgroundColor: 'transparent',
              color: theme.COLORS.TEXT_GREY,
            }}
            placeholderTextColor={theme.COLORS.TEXT_GREY}
            placeholder={t('guildscreen.search')}
            clearButtonMode="always"
          />
        </View>
      </View>
      <FlatList
        style={styles.list}
        data={guildlist}
        keyExtractor={(item, index) => index}
        renderItem={RenderStat}
        nestedScrollEnabled
      />
      <View style={styles.btnBlock}>
        <Text style={styles.text}>{t('guildscreen.or')}</Text>
        <Ripple
          style={styles.btn}
          containerStyle={styles.btnContainer}
          onPress={() => {
            openCreateGuildScreen();
          }}>
          <Text style={styles.btnText}>{t('guildscreen.createyourguild')}</Text>
        </Ripple>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamilies.Default,
    color: theme.COLORS.TEXT_GREY,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
  },
  text: {
    marginVertical: 15,
    fontFamily: fontFamilies.Default,
    color: theme.COLORS.TEXT_GREY,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  btnBlock: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainer: {
    borderRadius: 8,
    width: '100%',
  },
  btn: {
    width: '100%',
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: theme.COLORS.TEXT_GREY,
  },
});

export default GuildScreen;
