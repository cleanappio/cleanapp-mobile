export const osmSearch = async (query) => {
  const urlParams = new URLSearchParams({
    q: query,
    format: 'geojson',
    polygon_geojson: 1,
    addressdetails: 1,
  });
  const osmSearchUrl = `https://nominatim.openstreetmap.org/search?${urlParams}`;
  try {
    const response = await fetch(osmSearchUrl);
    return response.json();
  } catch (err) {
    console.error(err);
  }
  return null;
}
