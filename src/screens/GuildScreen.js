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
import {getGuildList, joinGuild} from '../services/API/APIManager';
import RenderGuildListItem from '../components/RenderGuildListItem';

const GuildScreen = () => {
  const [guildlist, setGuildlist] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const navigation = useNavigation();
  const {t} = useTranslation();

  const openCreateGuildScreen = () => {
    navigation.navigate('CreateGuild');
  };

  const onToggle = (id) => {
    setSelectedId((prevId) => {
      if (prevId === id) {
        return null;
      }
      return id;
    });
  };

  const onJoinGuild = (id) => {
    joinGuild({guild_id: id}).then((resp) => {
      navigation.navigate('Leaderboard');
    });
  }

  useEffect(() => {
    getGuildList().then((guildListResponse) => {
      if (guildListResponse && guildListResponse.length > 0) {
        setGuildlist(guildListResponse);
      }
    });
  }, []);

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
        renderItem={({item, index}) =>
          RenderGuildListItem({
            item,
            index,
            isRank: false,
            selectedId,
            onToggle: onToggle,
            joinGuild: onJoinGuild
          })
        }
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
