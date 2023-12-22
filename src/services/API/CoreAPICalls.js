import {settings as s} from './Settings';
import {setLastActivity} from '../DataManager';
import {getAuthToken, setAuthToken} from '../DataManager';

// === API 2.0

const getEndpoint20Url = (path) => `${s.baseLocalUrl}${path}`

export const postJSONData = async (path, data) => {
  try {
    const url = getEndpoint20Url(path);
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
    return {ok: false, error: err};
  }
};
