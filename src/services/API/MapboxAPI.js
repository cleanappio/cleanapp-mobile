import {MAPBOX_ACCESS_TOKEN} from '../../../env';

export const getReverseGeocodingData = async (
  coordinates,
  isReverse = false,
) => {
  let searchParams = new URLSearchParams({
    access_token: MAPBOX_ACCESS_TOKEN,
    language: 'en',
    limit: 1,
  });
  let response = await fetch(
    isReverse
      ? `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?` +
          searchParams
      : `https://api.mapbox.com/search/v1/reverse/${coordinates[0]},${coordinates[1]}?` +
          searchParams,
  );
  let result = await response.json();
  let resData = isReverse
    ? result?.features[0]?.text
    : result?.features[0]?.properties?.feature_name;
  return result;
};

export const getMapSearchItems = async (text) => {
  try {
    let response = await fetch(
      `https://api.mapbox.com/search/v1/suggest/${text}?` +
        new URLSearchParams({
          access_token: MAPBOX_ACCESS_TOKEN,
          session_token: '',
          language: 'en',
        }),
    );
    let result = await response.json();
    return result;
  } catch (err) {
    // error on map search item api call
  }

  return [];
};

export const getMapSearchItem = async (item) => {
  try {
    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item?.action?.body),
    };
    let response = await fetch(
      'https://api.mapbox.com/search/v1/retrieve?' +
        new URLSearchParams({
          access_token: MAPBOX_ACCESS_TOKEN,
          session_token: '',
        }),
      options,
    );
    let result = await response.json();
    return result;
  } catch (err) {
    // error occur in map search item api call
  }
  return null;
};
