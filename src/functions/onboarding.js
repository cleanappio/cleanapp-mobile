import {
  updateOrCreateUser,
  updatePrivacyAndTOC,
} from '../services/API/APIManager';
import {
  setFirstRun,
  setPrivacyAndTermsAccepted,
  setPrivacySetting,
  setUserName,
  setTeam,
} from '../services/DataManager';
import { GetOrCreateLocalWallet } from './login';
import { retrieveReferral } from './referral';
import { createLocalWallet } from './walletconnect';

export const onboard = async () => {
  const walletAddress = await createLocalWallet();
  if (walletAddress === null) {
    return false;
  }

  const [refKey, referral] = await retrieveReferral();
  
  const walletRet = await GetOrCreateLocalWallet();

  if (!walletRet) {
    return false;
  }

  const avatar = walletAddress;
  data = await updateOrCreateUser(walletAddress, avatar, refKey, referral);
  if (data && data.ok) {
    if (data.dup_avatar) {
      Alert.alert(
        t('onboarding.Error'),
        t('onboarding.ErrSameUsernameExists'),
        [{ text: t('onboarding.Ok'), type: 'cancel' }],
      );
      return;
    } else {
      await setUserName({ userName: avatar });
      await setTeam(data.team);
    }
  } else {
    Alert.alert(
      t('onboarding.Error'),
      String(data.error),
      [{ text: t('onboarding.Ok'), type: 'cancel' }],
    );
    return false;
  }

  const privacy = 0;
  const agreeTOC = true;
  await setPrivacySetting(privacy);
  await setPrivacyAndTermsAccepted(agreeTOC);
  await updatePrivacyAndTOC(
    walletAddress,
    privacy === 0 ? 'share_data_live' : 'not_share_data_live',
    agreeTOC ? 'ACCEPTED' : 'REJECTED',
  );
  setFirstRun(true);

  return true;
}