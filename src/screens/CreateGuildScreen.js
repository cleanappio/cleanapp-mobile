import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import {launchImageLibrary} from 'react-native-image-picker';
import {FlatList} from 'react-native-gesture-handler';

import SearchIcon from '../assets/ico_search.svg';
import RenderStat from '../components/RenderStat';
import Ripple from '../components/Ripple';
import {fontFamilies} from '../utils/fontFamilies';
import {theme} from '../services/Common/theme';

import UploadIcon from '../assets/ico_upload.svg';
import CancelIcon from '../assets/ico_xcircle.svg';
import {Chip} from 'react-native-paper';
import XIcon from '../assets/ico_x.svg';
import {useTranslation} from 'react-i18next';
import {createGuild} from '../services/API/APIManager';

const CreateGuildScreen = () => {
  const [guildName, setGuildName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const [guildDesc, setGuildDesc] = useState('');
  const [guildUsers, setGuildUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(false);

  const guilddescInput = useRef(null);
  const guildnameInput = useRef(null);
  const guilduserInput = useRef(null);

  const {t} = useTranslation();

  const navigation = useNavigation();

  const onCreateGuild = async () => {
    if (loading) return;

    if (guildName === '') {
      Alert.alert(t('createyourguild.guildnameempty'));
      return;
    }

    if (guildDesc === '') {
      Alert.alert(t('createyourguild.guilddescempty'));
      return;
    }

    if (imageFile === null) {
      Alert.alert(t('createyourguild.profileimageempty'));
    }
    setLoading(true);

    const guildResponse = await createGuild({
      name: guildName,
      description: guildDesc,
      profile_image: {...imageFile, name: 'profile.jpg'},
      invited_users: guildUsers,
    });

    if (guildResponse) {
      if (guildResponse.messages) {
        Alert.alert(guildResponse.messages[0]);
      } else {
        navigation.navigate('Leaderboard');
      }
    }
    setLoading(false);
  };

  const addUser = () => {
    if (
      currentUser &&
      guildUsers.findIndex((ele) => ele === currentUser) === -1
    ) {
      setGuildUsers([...guildUsers, currentUser]);
      setCurrentUser('');
    }
  };

  const deleteUser = (user) => {
    if (guildUsers.findIndex((ele) => ele === user) > -1) {
      const filteredUsers = guildUsers.filter((ele) => ele !== user);
      setGuildUsers([...filteredUsers]);
    }
  };

  const uploadFiles = async () => {
    if (!profileImage) {
      const options = {
        mediaType: 'photo',
      };
      const result = await launchImageLibrary(options);

      if (result && result.assets.length > 0) {
        setImageFile(result.assets[0]);
        setProfileImage(result.assets[0].fileName);
      }
    } else {
      setProfileImage('');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('createyourguild.createyourguild')}
            </Text>
          </View>
          <View style={styles.block}>
            <Text style={styles.heading}>{t('createyourguild.guildName')}</Text>
            <TextInput
              ref={guildnameInput}
              autoCorrect={false}
              spellCheck={false}
              style={styles.textInput}
              onChangeText={setGuildName}
              placeholderTextColor={theme.COLORS.TEXT_GREY_30P}
              placeholder={t('createyourguild.yourname')}
              returnKeyType="next"
              onSubmitEditing={() => {
                uploadFiles();
              }}
            />
          </View>

          <View style={styles.block}>
            <Text style={styles.heading}>
              {t('createyourguild.guildprofileimage')}
            </Text>
            <View
              style={{
                marginTop: 6,
                borderRadius: 8,
                borderStyle: 'dotted',
                borderColor: theme.COLORS.BTN_BG_BLUE,
                borderWidth: 1.5,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                height: 56,
                backgroundColor: profileImage
                  ? theme.COLORS.BTN_BG_BLUE_30P
                  : 'transparent',
              }}>
              <Text
                style={{...styles.fileText, width: '90%'}}
                numberOfLines={1}
                ellipsizeMode={'tail'}>
                {profileImage ? profileImage : t('createyourguild.selectfile')}
              </Text>
              <Ripple onPress={uploadFiles}>
                {profileImage ? <CancelIcon /> : <UploadIcon />}
              </Ripple>
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.heading}>{t('createyourguild.guilddesc')}</Text>
            <TextInput
              ref={guilddescInput}
              autoCorrect={false}
              spellCheck={false}
              style={{...styles.textInput, height: 100}}
              multiline={true}
              keyboardType="default"
              numberOfLines={5}
              textAlignVertical="top"
              onChangeText={setGuildDesc}
              placeholderTextColor={theme.COLORS.TEXT_GREY_30P}
              placeholder={t('createyourguild.welcommessagerules')}
              //returnKeyType="next"
              onBlur={() => {
                Keyboard.dismiss();
              }}
              onSubmitEditing={() => {
                //guilduserInput.current.focus();
              }}
            />
          </View>

          <View style={styles.block}>
            <Text style={styles.heading}>
              {t('createyourguild.inviteusers')}
            </Text>
            <View
              style={{
                ...styles.textInputContainerWithBtn,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
              }}>
              <TextInput
                ref={guilduserInput}
                autoCorrect={false}
                spellCheck={false}
                value={currentUser}
                onChangeText={setCurrentUser}
                style={styles.textInputrWithBtn}
                placeholderTextColor={theme.COLORS.TEXT_GREY_30P}
                placeholder={t('createyourguild.usernamewalletaddress')}
                returnKeyType="next"
                onSubmitEditing={() => {
                  addUser();
                }}
              />
              <Ripple
                onPress={addUser}
                containerStyle={{...styles.btnContainerSmall}}
                style={{...styles.btnSmall}}>
                <Text style={styles.btnText}>{t('createyourguild.add')}</Text>
              </Ripple>
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.heading}>
              {t('createyourguild.invitedusers')}
            </Text>
            <View style={styles.tagsContainer}>
              {guildUsers.map((user) => (
                <Chip
                  style={styles.chip}
                  closeIcon={() => <XIcon />}
                  onPress={() => {
                    deleteUser(user);
                  }}
                  onClose={() => {
                    deleteUser(user);
                  }}>
                  <Text style={styles.chipText}>{user}</Text>
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.block}>
            <Ripple
              style={styles.btn}
              containerStyle={styles.btnContainer}
              disabled={loading}
              onPress={() => {
                onCreateGuild();
              }}>
              <Text style={styles.btnText}>
                {t('createyourguild.createyourguild')}
              </Text>
            </Ripple>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
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
  heading: {
    fontFamily: fontFamilies.Default,
    color: theme.COLORS.TEXT_GREY,
    fontWeight: '500',
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
  btnContainerSmall: {
    borderRadius: 8,
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    width: 56,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSmall: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: fontFamilies.Default,
    fontSize: 16,
    fontWeight: '500',
    color: theme.COLORS.TEXT_GREY,
  },
  block: {
    marginTop: 16,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.COLORS.TEXT_GREY_30P,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 6,
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    lineHeight: 16,
  },
  textInputContainerWithBtn: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.COLORS.TEXT_GREY_30P,
    marginTop: 6,
    height: 56,
  },
  textInputrWithBtn: {
    paddingVertical: 16,
    color: theme.COLORS.TEXT_GREY,
    fontFamily: fontFamilies.Default,
    width: '80%',
    fontSize: 12,
    lineHeight: 16,
  },
  fileText: {
    fontFamily: fontFamilies.Default,
    fontSize: 14,
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
    height: 25,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 14,
    color: theme.COLORS.TEXT_GREY,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
  },
});

export default CreateGuildScreen;
