import { Dimensions } from 'react-native'
import { fetchReferral, generateReferral } from '../services/API/APIManager';
import { getReferral, getReferralKey, getWalletAddress, setReferral, setReferralKey } from '../services/DataManager';
import publicIP from 'react-native-public-ip';

export const retrieveReferral = async () => {
  var key = await getReferralKey();
  var refid = await getReferral();
  if (!key) {
    const dimensions = Dimensions.get('screen');
    ip = await publicIP();

    key = ip + ':' + dimensions.width + ':' + dimensions.height;
    await setReferralKey(key);
  }
  if (!refid) {
    refResponse = await fetchReferral(key);
    refid = refResponse.refid;
  }
  await setReferral(refResponse.refid);
  return [key, refid];
}

export const generateReferralUrl = async() => {
  const publicAddress = await getWalletAddress();
  const response = await generateReferral(publicAddress);
  if (!response.ok) {
    return null;
  }
  return `https://app.cleanapp.io/ref?refid=${response.refid}`
}