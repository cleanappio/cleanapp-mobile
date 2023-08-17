/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {theme} from '../services/Common/theme';
import {fontFamilies} from '../utils/fontFamilies';
import Ripple from '../components/Ripple';
import Share, {Social} from 'react-native-share';
import {getUserName, getWalletAddress} from '../services/DataManager';
import {
  changeUserName,
  getGuildList,
  getGuildImage,
  getTeamStatus,
  getUserRank,
  getUserRanks,
  leaveGuild,
} from '../services/API/APIManager';
import {actions} from '../services/State/Reducer';
import {useStateValue} from '../services/State/State';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {setUserName} from '../services/DataManager';
import LinearGradient from 'react-native-linear-gradient';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import PlusCircleIcon from '../assets/ico_plus_circle.svg';
import RenderStat from '../components/RenderStat';
import {Chip} from 'react-native-paper';
import BottomSheetDialog from '../components/BotomSheetDialog';
import RenderGuildListItem from '../components/RenderGuildListItem';
import {Row} from '../components/Row';

import MemberIcon from '../assets/ico_member.svg';

const Tab = ({title, icon, value, isSelected, setTab}) => {
  return (
    <Ripple
      style={StyleSheet.flatten([
        styles.tab,
        isSelected ? styles.tabActive : {},
      ])}
      onPress={() => setTab(value, title)}>
      {icon}
      <Text style={styles.tabText}>{title}</Text>
      <View
        style={{
          ...styles.indicator,
          backgroundColor: isSelected ? theme.COLORS.TEXT_GREY : 'transparent',
        }}
      />
    </Ripple>
  );
};

export const Leaderboard = (props) => {
  const {t} = useTranslation();
  const [{}, dispatch] = useStateValue();
  const navigation = useNavigation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userName, setName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [allRankMode, setAllRankMode] = useState(false);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState(false);
  const nameRef = useRef(null);
  const [userIndex, setUserIndex] = useState(-1);
  const [userGuildIndex, setUserGuildIndex] = useState(-1);

  const [leaderboardPlayers, setLeaderboardPlayers] = useState([]);
  const [leaderboardGuilds, setLeaderboardGuilds] = useState([]);
  const [joined, setJoined] = useState(false);
  const [created, setCreated] = useState(false);

  const [blueStat, setBlueStat] = useState(0);
  const [greenStat, setGreenStat] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [bottomSheetOpened, setBottomSheetOpened] = useState(false);
  const [teamStatus, setTeamStatus] = useState(null);
  const [userTeam, setUserTeam] = useState('');

  const onOpenMenu = () => {
    setIsMenuOpen(true);
  };

  const onCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const fetchData = async () => {
    const wallet = await getWalletAddress();
    if (wallet) {
      setWalletAddress(wallet);
    }

    getUserRank().then((userrankResponse) => {
      if (userrankResponse && userrankResponse.length > 0) {
        setLeaderboardPlayers(userrankResponse);
        const _index = userrankResponse.findIndex(
          (user) => user.public_address === wallet,
        );
        if (_index !== -1) {
          setUserIndex(_index);
        }
      }
    });

    getGuildList().then((guildListResponse) => {
      if (guildListResponse && guildListResponse.length > 0) {
        setLeaderboardGuilds(guildListResponse);
        const _index = guildListResponse.findIndex(
          (guild) =>
            guild.members.findIndex((member) => member === wallet) !== -1,
        );
        if (_index !== -1) {
          setUserGuildIndex(_index);
          setJoined(true);
        }
      }
    });
    getTeamStatus().then((teamResponse) => {
      if (teamResponse) {
        if (teamResponse.data) {
          teamResponse.data.forEach((ele) => {
            if (ele.name === 'blue') setBlueStat(ele.point);
            if (ele.name === 'green') setGreenStat(ele.point);
          });
        }

        if (teamResponse.user_data && teamResponse.user_data.team) {
          setUserTeam(teamResponse.user_data.team);
        }
      }
    });

    getUserName().then((data) => {
      setName(data.userName);
      setNewName(data.userName);
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const openGuildDetail = () => {
    setBottomSheetOpened(true);
  };

  const onCloseBottomSheet = () => {
    setBottomSheetOpened(false);
  };

  const onLeaveGuild = () => {
    if (userGuildIndex > -1) {
      const guild_id = leaderboardGuilds[userGuildIndex]._id;
      leaveGuild({guild_id: guild_id}).then((resp) => {
        onCloseBottomSheet();
        setUserGuildIndex(-1);
        setJoined(false);
        fetchData();
      });
    }
  };

  const LeaderboardPlayers = () => {
    return (
      <>
        <FlatList
          data={leaderboardPlayers.slice(0, 7)}
          keyExtractor={(item, index) => index}
          renderItem={RenderStat}
          nestedScrollEnabled
        />
        <View
          style={{
            width: '100%',
          }}>
          <LinearGradient
            end={{x: 0, y: 0.5}}
            start={{x: 1, y: 0.5}}
            colors={[
              theme.COLORS.GREEN_ITEM_BG_END,
              theme.COLORS.GREEN_ITEM_BG_START,
              theme.COLORS.GREEN_ITEM_BG_END,
            ]}
            style={{
              width: '100%',
              height: 1,
            }}
          />
          {leaderboardPlayers && (
            <RenderStat
              isSelf={true}
              item={leaderboardPlayers[userIndex]}
              index={userIndex}
            />
          )}
          <LinearGradient
            end={{x: 0, y: 0.5}}
            start={{x: 1, y: 0.5}}
            colors={[
              theme.COLORS.GREEN_ITEM_BG_END,
              theme.COLORS.GREEN_ITEM_BG_START,
              theme.COLORS.GREEN_ITEM_BG_END,
            ]}
            style={{
              width: '100%',
              height: 1,
            }}
          />
        </View>
      </>
    );
  };

  const GuildDetail = ({
    isVisible = false,
    onLeaveGuild = () => {},
    onClose = () => {},
    userItem = {
      members: [],
      name: '',
      description: '',
      profile_image: '',
    },
  }) => {
    const [image, setImage] = useState(null);

    const getSingleImage = async (imageId) => {
      let result = await getGuildImage(imageId);
      const fileReaderInstance = new FileReader();
      fileReaderInstance.readAsDataURL(result);
      fileReaderInstance.onload = () => {
        setImage(fileReaderInstance.result);
      };
    };

    useEffect(() => {
      if (userItem) {
        getSingleImage(userItem._id);
      }
    }, [userItem]);

    if (userItem === null) return null;

    return (
      <BottomSheetDialog
        isVisible={isVisible}
        onClose={onClose}
        title={userItem.name}>
        <View style={{marginTop: 22}}>
          {image && (
            <ImageBackground
              style={{
                borderRadius: 8,
                width: Dimensions.get('screen').width - 40,
                height: ((Dimensions.get('screen').width - 40) * 9) / 16,
                alignItems: 'baseline',
                justifyContent: 'flex-end',
                paddingVertical: 7,
                paddingHorizontal: 10,
              }}
              resizeMode={'cover'}
              source={{uri: image}}>
              <Row>
                <View style={{flexDirection: 'row'}}>
                  <MemberIcon />
                  <Text style={{...styles.txt16, marginLeft: 4}}>
                    {userItem.members.length}
                  </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.txt12}>
                    {`Total$Cat  `}
                    <Text style={styles.txt16}>{userItem.rewards}</Text>
                  </Text>
                </View>
              </Row>
            </ImageBackground>
          )}
        </View>
        <Text style={styles.guild_desc}>{userItem.description}</Text>
        <View style={{marginTop: 22}}>
          <Text style={styles.guild_desc}>{'Users'}</Text>
        </View>
        <View style={styles.tagsContainer}>
          {userItem.members.map((user) => (
            <Chip title={user} style={styles.chip} textStyle={styles.chipText}>
              {user}
            </Chip>
          ))}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 24,
          }}>
          <Ripple
            onPress={onClose}
            containerStyle={{
              flex: 0.5,
            }}
            style={{
              paddingVertical: 14,
              backgroundColor: theme.COLORS.BG,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily: fontFamilies.Default,
                color: theme.COLORS.WHITE,
                fontSize: 16,
                fontWeight: '500',
              }}>
              {'Back'}
            </Text>
          </Ripple>
          <Ripple
            onPress={onLeaveGuild}
            containerStyle={{
              flex: 0.45,
            }}
            style={{
              paddingVertical: 14,
              backgroundColor: theme.COLORS.BTN_BG_RED,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily: fontFamilies.Default,
                color: theme.COLORS.WHITE,
                fontSize: 16,
                fontWeight: '500',
              }}>
              {'Leave Guild'}
            </Text>
          </Ripple>
        </View>
      </BottomSheetDialog>
    );
  };

  const LeaderboardGuilds = () => {
    return (
      <>
        <FlatList
          style={{marginTop: 24}}
          data={leaderboardGuilds.slice(0, 7)}
          keyExtractor={(item, index) => index}
          renderItem={RenderGuildListItem}
          nestedScrollEnabled
        />
        <View
          style={{
            width: '100%',
          }}>
          <LinearGradient
            end={{x: 0, y: 0.5}}
            start={{x: 1, y: 0.5}}
            colors={[
              theme.COLORS.GREEN_ITEM_BG_END,
              theme.COLORS.GREEN_ITEM_BG_START,
              theme.COLORS.GREEN_ITEM_BG_END,
            ]}
            style={{
              width: '100%',
              height: 1,
            }}
          />
          {joined && userGuildIndex > -1 ? (
            <RenderGuildListItem
              onToggle={openGuildDetail}
              index={userGuildIndex}
              item={leaderboardGuilds[userGuildIndex]}
            />
          ) : (
            <Ripple
              style={{
                paddingVertical: 16,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                setJoined(true);
                navigation.navigate('GuildList');
              }}>
              <Text
                style={{
                  fontFamily: fontFamilies.Default,
                  color: theme.COLORS.TEXT_GREY,
                  fontSize: 14,
                }}>
                {t('leaderboard.joinaguild')}
              </Text>
              <PlusCircleIcon />
            </Ripple>
          )}

          <LinearGradient
            end={{x: 0, y: 0.5}}
            start={{x: 1, y: 0.5}}
            colors={[
              theme.COLORS.GREEN_ITEM_BG_END,
              theme.COLORS.GREEN_ITEM_BG_START,
              theme.COLORS.GREEN_ITEM_BG_END,
            ]}
            style={{
              width: '100%',
              height: 1,
            }}
          />
        </View>
      </>
    );
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={{marginTop: 25}}>
            <View style={{...styles.card, paddingHorizontal: 0}}>
              <Text style={{...styles.title, marginLeft: 16}}>
                {t('leaderboard.social')}
              </Text>
              {(joined || created) && (
                <View style={styles.guildstatcontainer}>
                  <Text style={styles.guildstat}>
                    {joined
                      ? t('leaderboard.guildjoined')
                      : t('leaderboard.guildcreated')}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.statusContainer}>
              <LinearGradient
                end={{x: 0, y: 0.5}}
                start={{x: 1, y: 0.5}}
                colors={[
                  theme.COLORS.GRADIENT_BLUE_BEGIN,
                  theme.COLORS.GRADIENT_BLUE_END,
                ]}
                style={{
                  ...styles.statusbar_left,
                  marginRight: 10,
                  flex:
                    blueStat + greenStat === 0
                      ? 1
                      : blueStat / (blueStat + greenStat),
                }}>
                <View style={styles.blueBall} />
              </LinearGradient>
              <LinearGradient
                end={{x: 1, y: 0.5}}
                start={{x: 0, y: 0.5}}
                colors={[
                  theme.COLORS.GRADIENT_GREEN_BEGIN,
                  theme.COLORS.GRADIENT_GREEN_END,
                ]}
                style={{
                  ...styles.statusbar_right,
                  marginLeft: 10,
                  flex:
                    blueStat + greenStat === 0
                      ? 1
                      : greenStat / (blueStat + greenStat),
                }}>
                <View style={styles.greenBall} />
              </LinearGradient>
            </View>
          </View>
          <View
            style={{
              ...styles.card,
              marginTop: 11,
              borderBottomWidth: 0.4,
              borderBottomColor: theme.COLORS.TEXT_GREY,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingBottom: 32,
            }}>
            <View style={styles.statContainer}>
              <Text style={styles.statTitle}>
                {t('leaderboard.teamblue')}
                {userTeam === 'blue' ? `  (Your team)` : ''}
              </Text>
              <Text style={styles.blueStat}>{`${blueStat} ${t(
                'leaderboard.cats',
              )}`}</Text>
            </View>
            <View style={styles.statContainer}>
              <Text style={{...styles.statTitle, textAlign: 'right'}}>
                {userTeam === 'green' ? `(Your team)   ` : ''}
                {t('leaderboard.teamgreen')}
              </Text>
              <Text
                style={{
                  ...styles.greenStat,
                  textAlign: 'right',
                }}>{`${greenStat} ${t('leaderboard.cats')}`}</Text>
            </View>
          </View>

          <View
            style={{
              ...styles.card,
              marginTop: 32,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text style={styles.leaderboard_title}>
              {t('leaderboard.leaderboard')}
            </Text>
            <Text style={styles.leaderboard_title}>
              {t('leaderboard.global')}
            </Text>
          </View>
          <View style={styles.tabContainer}>
            <Tab
              title={t('leaderboard.players')}
              isSelected={selectedIndex === 0}
              setTab={() => {
                setSelectedIndex(0);
              }}
            />
            <Tab
              title={t('leaderboard.guilds')}
              isSelected={selectedIndex === 1}
              setTab={() => {
                setSelectedIndex(1);
              }}
            />
          </View>

          {selectedIndex === 0 && <LeaderboardPlayers />}
          {selectedIndex === 1 && <LeaderboardGuilds />}
        </View>
      </ScrollView>
      <GuildDetail
        isVisible={bottomSheetOpened}
        onClose={onCloseBottomSheet}
        onLeaveGuild={onLeaveGuild}
        userItem={
          userGuildIndex > -1 ? leaderboardGuilds[userGuildIndex] : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.BG,
  },

  card: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  inputContainer: {
    backgroundColor: theme.APP_COLOR_2,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  inputText: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '400',
  },

  inputTextReadOnly: {
    paddingVertical: 15,
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '400',
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: theme.APP_COLOR_2,
  },
  headerText: {
    fontFamily: fontFamilies.Default,
    textTransform: 'uppercase',
    color: theme.COLORS.WHITE,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 21,
  },
  subHeaderText: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '400',
    color: theme.COLORS.TULIP_TREE,
    marginTop: 4,
    marginBottom: 16,
  },
  tabContainer: {
    marginTop: 22,
    flexDirection: 'row',
    width: '100%',
    padding: 2,
    borderRadius: 8,
    justifyContent: 'space-evenly',
  },
  tab: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {},
  tabText: {
    marginLeft: 8,
    color: theme.COLORS.TEXT_GREY,
    fontSize: 12,
    lineHeight: 20,
    fontFamily: fontFamilies.Default,
    fontWeight: '400',
  },
  indicator: {
    backgroundColor: theme.COLORS.TEXT_GREY,
    height: 3,
    borderRadius: 3,
    marginTop: 11,
    width: '100%',
  },
  icon: {
    width: 26,
    height: 26,
  },
  listContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rank: {
    width: '15%',
    color: theme.COLORS.WHITE,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
  },
  name: {
    marginLeft: 7,
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
  },
  count: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: theme.APP_COLOR_2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  txt9: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontSize: 9,
    lineHeight: 24,
    fontWeight: '400',
  },
  txt12: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 24,
  },
  txt16: {
    color: theme.COLORS.WHITE,
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
  txtTip: {
    fontSize: 12,
    color: 'white',
    fontWeight: '400',
    lineHeight: 15,
    marginTop: 24,
  },
  sortTip: {
    fontSize: 12,
    color: theme.COLORS.TULIP_TREE,
    fontWeight: '400',
    lineHeight: 15,
    fontStyle: 'italic',
    fontFamily: fontFamilies.Default,
  },

  menuBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: Dimensions.get('window').width - 58,
  },
  menuText: {
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: 'white',
    textTransform: 'none',
  },
  menuButtonOuter: {
    backgroundColor: theme.APP_COLOR_2,
    width: Dimensions.get('window').width - 58,
    borderRadius: 8,
    marginTop: 4,
  },
  menuOption: {
    //    width: '100%'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: theme.APP_COLOR,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    margin: 6,
    marginRight: 10,
  },
  buttonCancel: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    margin: 6,
    marginLeft: 10,
    backgroundColor: 'red',
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: 'gray',
    width: 165,
    height: 40,
    borderRadius: 7,
    padding: 0,
    marginTop: 11,
    lineHeight: 15.1,
    fontFamily: fontFamilies.DefaultLight,
    color: theme.COLORS.BLACK,
    textAlign: 'center',
  },
  inputDivider: {
    height: 1,
    marginVertical: 18,
    backgroundColor: theme.COLORS.TULIP_TREE,
  },
  inputLabel: {
    fontSize: 12,
    lineHeight: 11.5,
    fontFamily: fontFamilies.DefaultBold,
    textTransform: 'uppercase',
    color: theme.COLORS.BLACK,
  },
  buttonsRow: {
    flexDirection: 'row',
  },

  title: {
    fontFamily: fontFamilies.Default,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: theme.COLORS.TEXT_GREY,
  },

  statusContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statusbar_left: {
    height: 21,
    borderTopRightRadius: 45,
    borderBottomRightRadius: 45,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 5,
  },
  statusbar_right: {
    height: 21,
    borderTopLeftRadius: 45,
    borderBottomLeftRadius: 45,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 5,
  },
  statContainer: {},
  statTitle: {
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 15,
    marginBottom: 6,
  },
  blueStat: {
    color: theme.COLORS.BLUE_TEAM_BG,
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  greenStat: {
    color: theme.COLORS.GREEN_TEAM_BG,
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  greenBall: {
    width: 14,
    height: 14,
    borderRadius: 14,
    backgroundColor: theme.COLORS.GREEN_CIRCLE,
  },
  blueBall: {
    width: 14,
    height: 14,
    borderRadius: 14,
    backgroundColor: theme.COLORS.BLUE_CIRCLE,
  },
  leaderboard_title: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '400',
    color: theme.COLORS.TEXT_GREY,
  },
  guildstatcontainer: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE_30P,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  guildstat: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '300',
    color: theme.COLORS.TEXT_GREY,
  },

  sheetContainer: {
    flex: 1,
    backgroundColor: theme.APP_COLOR_1,
    paddingVertical: 22,
    paddingHorizontal: 16,
    zIndex: 999,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  guildName: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
    color: theme.COLORS.TEXT_GREY,
  },
  guild_desc: {
    marginTop: 20,
    fontFamily: fontFamilies.Default,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.COLORS.TEXT_GREY,
  },
  tagsContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  chip: {
    marginVertical: 5,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: theme.COLORS.BTN_BG_BLUE,
    backgroundColor: theme.COLORS.BTN_BG_BLUE_30P,
    alignItems: 'center',
    height: 21,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 14,
    color: theme.COLORS.TEXT_GREY,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
  },
});
