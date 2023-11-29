import { Dimensions } from 'react-native'
import { fetchReferral, generateReferral } from '../services/API/APIManager';
import { getWalletAddress } from '../services/DataManager';
import publicIP from 'react-native-public-ip';

export const retrieveReferral = async () => {
  const dimensions = Dimensions.get('screen');
  ip = await publicIP();

  const key = ip + ':' + dimensions.width + ':' + dimensions.height;
  refResponse = await fetchReferral(key);
  return refResponse.refid;
}

export const generateReferralUrl = async() => {
  const publicAddress = await getWalletAddress();
  const response = await generateReferral(publicAddress);
  if (!response.ok) {
    return null;
  }
  return `https://app.cleanapp.io/ref?refid=${response.refid}`
}