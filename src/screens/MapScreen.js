import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import MapboxGL from '@rnmapbox/maps';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import Config from 'react-native-config';
import {
  getCoordinatesFromLocation,
  getMapSearchItems,
  getReverseGeocodingData,
} from '../services/API/MapboxAPI';
import {TextInput} from 'react-native';
import {fontFamilies} from '../utils/fontFamilies';
import {theme} from '../services/Common/theme';
import SearchIcon from '../assets/ico_search_large.svg';
import {Tooltip} from 'react-native-elements';
import BottomSheetDialog from '../components/BotomSheetDialog';
import Ripple from '../components/Ripple';
import {useTranslation} from 'react-i18next';
import {useStateValue} from '../services/State/State';
import {
  getImage,
  searchImagesByLocation,
  update_annotation,
} from '../services/API/APIManager';
import MarkerGreen from '../assets/marker_green.svg';
import MarkerBlue from '../assets/marker_blue.svg';
import {getLocation} from '../functions/geolocation';
import {actions} from '../services/State/Reducer';
import {setMapLocation} from '../services/DataManager';

const offsetMultiplier = 0.00001;

const DetailView = memo(
  ({
    isVisible = true,
    onClose = () => {},
    latitude = 0,
    longitude = 0,
    locality = '',
    city = '',
    image_id = '',
  }) => {
    const [image, setImage] = useState(null);
    useEffect(() => {
      if (image_id) {
        getSingleImage(image_id);
      }
    }, [image_id]);

    const getSingleImage = async (imageId) => {
      let result = await getImage(imageId);
      const fileReaderInstance = new FileReader();
      fileReaderInstance.readAsDataURL(result);
      fileReaderInstance.onload = () => {
        setImage(fileReaderInstance.result);
      };
    };

    return (
      <View
        style={{
          width: '100%',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          backgroundColor: theme.APP_COLOR_1,
          padding: 16,
        }}>
        <View style={styles.row}>
          <Text style={styles.txt12}>{locality}</Text>
          <Text style={styles.txt12}>{city}</Text>
        </View>
        <Image
          source={{uri: image}}
          style={styles.detailImage}
          resizeMode="cover"
        />
      </View>
    );
  },
);

const Balloon = ({title = ''}) => {
  return (
    <View style={styles.balloonContainer}>
      <View style={styles.balloonBox}>
        <Text style={styles.balloonText}>{title}</Text>
      </View>
      <View style={styles.balloonArrow} />
    </View>
  );
};

const MapView = ({onMarkerPress = () => {}, selectedMarker = null}) => {
  const [coordinates, setCoordinates] = useState({
    zoomLevel: 17,
    coordinates: [0, 0],
  });
  const [reportData, setReportData] = useState({});
  const [searchText, setSearchText] = useState('');
  const [searchItems, setSearchItems] = useState([]);
  const [{mapLocation, reports}, dispatch] = useStateValue();
  const [searchLocText, setSearchLocText] = useState('');
  const [zoomLevel, setZoomLevel] = useState(17);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapLocationRef = useRef(coordinates);
  const reportsRef = useRef(reportData);
  const camera = useRef(null);

  const {t} = useTranslation();

  const fetchImages = async (latitude, longitude, range = 1) => {
    searchImagesByLocation({
      latitude: latitude,
      longitude: longitude,
      range: 100,
    }).then((data) => {
      if (data.result) {
        data.result.forEach(async (ele) => {
          if (ele.city === '') {
            const formdata = new FormData();
            formdata.append('entity_id', ele.image_id);
            const resp = await update_annotation(formdata);
          }
        });

        setReportData((prevData) => {
          const newData = {};
          data.result.forEach((ele) => {
            const key = `${ele.longitude}-${ele.latitude}`;
            if (newData[`${key}`]) {
              if (
                newData[`${key}`].findIndex(
                  (prevEle) => prevEle.image_id === ele.image_id,
                ) === -1
              ) {
                newData[`${key}`].push(ele);
              }
            } else {
              newData[`${key}`] = [];
              newData[`${key}`].push(ele);
            }
          });

          return newData;
        });
      }
    });
  };

  const saveMapLocation = async (_mapLocation) => {
    if (_mapLocation.coordinates[0] === 0 && _mapLocation.coordinates[1] === 0)
      return;

    dispatch({
      type: actions.SET_MAP_LOCATION,
      mapLocation: _mapLocation,
    });
    setMapLocation(_mapLocation);
  };

  const saveReports = async (_reports) => {
    dispatch({
      type: actions.SET_REPORTS,
      reports: _reports,
    });
  };

  const onRegionDidChange = async (e) => {
    if (e.geometry && e.geometry.coordinates) {
      const latitude = e.geometry.coordinates[1];
      const longitude = e.geometry.coordinates[0];
      setCoordinates({
        zoomLevel: e.properties.zoomLevel,
        coordinates: [longitude, latitude],
      });
      fetchImages(latitude, longitude);
    }
  };

  useEffect(() => {
    mapLocationRef.current = coordinates; // save userCheck state value to ref
  }, [coordinates]);

  useEffect(() => {
    reportsRef.current = reportData;
  }, [reportData]);

  useEffect(() => {
    if (reports) {
      setReportData((prevReports) => {
        return {...prevReports, ...reports};
      });
    }
  }, [reports]);

  useEffect(() => {
    if (mapLocation.coordinates[0] === 0 && mapLocation.coordinates[1] === 0) {
      //load user location
      getLocation().then((location) => {
        saveMapLocation({
          ...mapLocation,
          coordinates: [location.longitude, location.latitude],
        });
      });
    } else {
      fetchImages(mapLocation.coordinates[1], mapLocation.coordinates[0]);
    }
  }, [mapLocation]);

  const selectSuggestion = async (text) => {
    Keyboard.dismiss();
    setSearchLocText((prev) => text);
    if (text) {
      getCoordinatesFromLocation(text).then((data) => {
        if (data !== null) {
          saveMapLocation({
            ...mapLocation,
            coordinates: data,
          });
        }
      });
    }
    setSearchItems([]);
  };

  const gotoLocation = async (e) => {
    Keyboard.dismiss();
    const text = e.nativeEvent.text;
    setSearchLocText((prev) => text);
    if (text) {
      getCoordinatesFromLocation(text).then((data) => {
        if (data !== null) {
          saveMapLocation({
            ...mapLocation,
            coordinates: data,
          });
        }
      });
    }
    setSearchItems([]);
  };

  const findSearchItemLocation = (text) => {
    if (text.length > 2) {
      getMapSearchItems(text).then((data) => {
        if (data) {
          setSearchItems(data);
        }
      });
    } else {
      setSearchItems([]);
    }
  };

  useEffect(() => {
    return () => {
      saveMapLocation(mapLocationRef.current);
      saveReports(reportsRef.current);
    };
  }, []);

  const SearchItemsSeperator = () => {
    return <View style={styles.seperator}></View>;
  };

  const RenderSearchItemView = ({item}) => (
    <Ripple onPress={() => selectSuggestion(item)}>
      <Text style={styles.searchItemText}>{item} </Text>
    </Ripple>
  );
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.heading}>{t('mapscreen.maps')}</Text>
        <View style={styles.inputBox}>
          <SearchIcon />
          <TextInput
            autoCorrect={false}
            spellCheck={false}
            text={searchLocText}
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={theme.COLORS.TEXT_GREY_50P}
            onChangeText={(text) => {
              findSearchItemLocation(text);
            }}
            onSubmitEditing={gotoLocation}
          />
        </View>
        {searchItems && searchItems.length > 0 && (
          <FlatList
            style={styles.searchlist}
            data={searchItems}
            renderItem={RenderSearchItemView}
            keyExtractor={(item, index) => `${item}_${index}`}
            ItemSeparatorComponent={SearchItemsSeperator}
          />
        )}
      </View>
      <MapboxGL.MapView
        styleURL={Config.MAPBOX_STYLE_MONOCHROME}
        style={styles.map}
        onRegionDidChange={onRegionDidChange}>
        <MapboxGL.UserLocation
          androidRenderMode={'gps'}
          visible={true}
          showsUserHeadingIndicator={true}
        />
        <MapboxGL.Camera
          ref={camera}
          zoomLevel={mapLocation.zoomLevel}
          centerCoordinate={mapLocation.coordinates}
          animationMode="moveTo"
        />
        {Object.keys(reportData).map((elekey) =>
          reportData[elekey].map((element, index) => {
            const latitude = element.latitude;
            const longitude = element.longitude + offsetMultiplier * index;
            return (
              <MapboxGL.PointAnnotation
                id={`flag-${elekey}-${index}`}
                key={`flag-${elekey}-${index}`}
                coordinate={[longitude, latitude]}
                onSelected={() => onMarkerPress(element, longitude, latitude)}>
                <MarkerGreen />
              </MapboxGL.PointAnnotation>
            );
          }),
        )}
        {selectedMarker && (
          <MapboxGL.MarkerView
            id={'marker'}
            coordinate={[selectedMarker.longitude, selectedMarker.latitude]}>
            <Balloon title={`${selectedMarker.locality}`} />
          </MapboxGL.MarkerView>
        )}
      </MapboxGL.MapView>
    </View>
  );
};

const MapScreen = (props) => {
  const slidingPanel = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const onMarkerPress = useCallback(
    (feature, longitude, latitude) => {
      setSelectedMarker({...feature, longitude, latitude});
      slidingPanel.current.show();
    },
    [slidingPanel],
  );

  const onDismissSlide = async () => {
    setSelectedMarker(null);
  };

  return (
    <View style={styles.page}>
      <MapView onMarkerPress={onMarkerPress} selectedMarker={selectedMarker} />
      <SlidingUpPanel
        ref={slidingPanel}
        onBottomReached={onDismissSlide}
        draggableRange={{top: 272, bottom: 0}}
        showBackdrop={false}>
        {selectedMarker && (
          <DetailView
            isVisible={true}
            latitude={selectedMarker.latitude}
            longitude={selectedMarker.longitude}
            locality={selectedMarker.locality}
            city={selectedMarker.city}
            image_id={selectedMarker.image_id}
          />
        )}
      </SlidingUpPanel>
    </View>
  );
};
const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: '100%',
    width: '100%',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    width: 60,
    backgroundColor: 'transparent',
    height: 70,
  },
  textContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    paddingHorizontal: 5,
    flex: 1,
  },
  balloon: {
    marginTop: -50,
  },
  searchContainer: {
    width: '100%',
    marginTop: 34,
    paddingHorizontal: 16,
    zIndex: 1,
    position: 'absolute',
  },
  heading: {
    fontFamily: fontFamilies.Default,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: theme.COLORS.TEXT_GREY,
  },
  searchlist: {
    marginTop: 3,
    backgroundColor: theme.APP_COLOR_1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchItemText: {
    paddingVertical: 16,
    color: theme.COLORS.TEXT_GREY,
    fontSize: 12,
    fontFamily: fontFamilies.Default,
    fontWeight: '400',
  },
  seperator: {
    width: '100%',
    height: 1,
    backgroundColor: theme.COLORS.BORDER,
  },
  inputBox: {
    marginTop: 16,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.APP_COLOR_1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: theme.COLORS.TEXT_GREY,
    fontSize: 12,
    lineHeight: 16,
    paddingVertical: 4,
    fontFamily: fontFamilies.Default,
    fontWeight: '400',
    width: '100%',
  },
  balloonContainer: {
    marginTop: -80,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balloonBox: {
    backgroundColor: theme.COLORS.TEXT_GREY,
    zIndex: 1,
    borderRadius: 8,
    paddingHorizontal: 21,
    paddingVertical: 2,
  },
  balloonText: {
    color: theme.APP_COLOR_1,
    fontSize: 12,
    lineHeight: 36,
    fontWeight: '500',
    fontFamily: fontFamilies.Default,
  },
  balloonArrow: {
    zIndex: 0,
    transform: [{rotateZ: '45deg'}],
    width: 16,
    height: 16,
    backgroundColor: theme.COLORS.TEXT_GREY,
    marginTop: -8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txt12: {
    color: theme.COLORS.TEXT_GREY,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 15,
    fontFamily: fontFamilies.Default,
  },
  detailImage: {
    marginTop: 8,
    borderRadius: 8,
    width: Dimensions.get('screen').width - 40,
    height: Dimensions.get('screen').height - 350,
  },
});
export default MapScreen;
