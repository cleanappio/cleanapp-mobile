import Config from 'react-native-config';

export const getReverseGeocodingData = async (
  coordinates,
  isReverse = false,
) => {
  let searchParams = new URLSearchParams({
    access_token: Config.MAPBOX_ACCESS_TOKEN,
    language: 'en',
    limit: 1,
  });
  const url = isReverse
    ? `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?` +
    searchParams
    : `https://api.mapbox.com/search/v1/reverse/${coordinates[0]},${coordinates[1]}?` +
    searchParams;
  const response = await fetch(url);
  const result = await response.json();
  return result;
};

export const getCoordinatesFromLocation = async (location) => {
  let searchParams = new URLSearchParams({
    access_token: Config.MAPBOX_ACCESS_TOKEN,
    language: 'en',
    limit: 1,
  });
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      location,
    )}.json?` + searchParams;
    const response = await fetch(url);

    if (response) {
      const { features } = await response.json();
      if (features.length > 0) {
        const [longitude, latitude] = features[0].center;
        return [longitude, latitude];
      }
    }
  } catch (err) { }
  return null;
};

export const getMapSearchItems = async (text) => {
  try {
    const url =
      `https://api.mapbox.com/search/v1/suggest/${text}?` +
      new URLSearchParams({
        access_token: Config.MAPBOX_ACCESS_TOKEN,
        session_token: '',
        language: 'en',
      });

    let response = await fetch(url);
    const { suggestions } = await response.json();
    const result = suggestions.map((ele) => {
      return ele.feature_name;
    });
    return result.sort();
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
    const url = 'https://api.mapbox.com/search/v1/retrieve?' +
      new URLSearchParams({
        access_token: Config.MAPBOX_ACCESS_TOKEN,
        session_token: '',
      });

    let response = await fetch(
      url,
      options,
    );
    let result = await response.json();
    return result;
  } catch (err) {
    // error occur in map search item api call
  }
  return null;
};
