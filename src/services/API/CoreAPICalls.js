import Config from 'react-native-config';
import { settings as s } from './Settings';

const getEndpointUrl = (path) => {
  var baseUrl = s.baseLocalUrl;
  switch (Config.APP_MODE) {
    case 'local':
      baseUrl = s.baseLocalUrl;
      break;
    case 'dev':
      baseUrl = s.baseDevUrl;
      break;
    case 'prod':
      baseUrl = s.baseProdUrl;
      break;
  }
  return `${baseUrl}/${path}`
}

export const postJSONData = async (path, data) => {
  try {
    const url = getEndpointUrl(path);
    const config = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
    const response = await fetch(url, config)
      .then((res) => res);
    return response;
  } catch (err) {
    return { ok: false, error: err };
  }
};
