import { getUrls } from './Settings';

export const postJSONData = async (path, data) => {
  try {
    const url = `${getUrls().apiUrl}/${path}`;
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
