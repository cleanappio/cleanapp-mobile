import {settings as s} from './Settings';
import {setLastActivity} from '../DataManager';
import {getAuthToken, setAuthToken} from '../DataManager';

const getEndpointUrl = (ep) => `${s.baseUrl}${ep}`;

export const getData = async (relativeUrl) => {
  try {
    setLastActivity();
    const url = getEndpointUrl(relativeUrl);
    const config = {
      method: 'get',
    };
    const response = await fetch(url, config);
    const result = await response.json();
    return result;
  } catch (err) {
    return null;
  }
};

export const getUserData = async (relativeUrl, data) => {
  try {
    await setLastActivity();
    const refreshToken = await refreshTokenAPI(s.auth.refreshToken);
    const url = getEndpointUrl(relativeUrl);
    const config = {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken.access_token}`,
      },
    };
    const response = await fetch(url, config);
    const result = await response.json();
    return result;
  } catch (err) {
    return null;
  }
};

export const getFile = async (relativeUrl) => {
  try {
    setLastActivity();
    const url = getEndpointUrl(relativeUrl);
    const refreshToken = await refreshTokenAPI(s.auth.refreshToken);
    const config = {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken.access_token}`,
      },
    };
    const response = await fetch(url, config);
    const result = await response.blob();
    return result;
  } catch (err) {
    return null;
  }
};

export const postData = async (
  relativeUrl,
  data = null,
  isFormData = false,
) => {
  setLastActivity();
  const url = getEndpointUrl(relativeUrl);
  const config = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (data) {
    config.body = isFormData ? data : JSON.stringify(data);
  }
  try {
    const response = await fetch(url, config)
      .then((res) => res.json())
      .then((res) => res)
      .catch((error) => error);
    return response;
  } catch (err) {
    return null;
  }
};

export const refreshTokenAPI = async (relativeUrl) => {
  try {
    setLastActivity();
    const authToken = await getAuthToken();
    const url = getEndpointUrl(s.auth.refreshToken);
    const config = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken.refresh_token}`,
      },
    };
    const response = await fetch(url, config)
      .then((res) => res.json())
      .then((res) => res)
      .catch((error) => error);

    await setAuthToken({
      refresh_token: authToken.refresh_token,
      access_token: response.access_token,
    });
    return response;
  } catch (err) {
    return null;
  }
};

export const postUserData = async (
  relativeUrl,
  data = null,
  isFormData = false,
) => {
  setLastActivity();
  const authToken = await refreshTokenAPI();
  const url = getEndpointUrl(relativeUrl);
  const config = {
    method: 'post',
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      Authorization: `Bearer ${authToken.access_token}`,
    },
  };
  if (data) {
    config.body = isFormData ? data : JSON.stringify(data);
  }
  try {
    const response = await fetch(url, config)
      .then((res) => res.json())
      .then((res) => res)
      .catch((error) => error);
    return response;
  } catch (err) {
    return null;
  }
};

export const putData = async (relativeUrl, data = null, isFormData = false) => {
  setLastActivity();
  const url = getEndpointUrl(relativeUrl);
  const config = {
    method: 'put',
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
  };
  if (data) {
    config.body = isFormData ? data : JSON.stringify(data);
  }
  try {
    const response = await fetch(url, config)
      .then((res) => res.json())
      .then((res) => res)
      .catch((error) => error);
    return response;
  } catch (err) {
    return null;
  }
};
