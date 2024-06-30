import { getUrls, settings } from './Settings';

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
    var response;
    for (const i = 0; i < settings.apiSettings.sendingAttempts; i++) {
      response = await fetch(url, config)
        .then((res) => res);
      if (response.ok) {
        return response;
      }
    }
    return response;  // Fetch failed after all attempts, returning failure response
  } catch (err) {
    return { ok: false, error: err };
  }
};
