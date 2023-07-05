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
import {getImage, searchImagesByLocation} from '../services/API/APIManager';
import MarkerGreen from '../assets/marker_green.svg';
import MarkerBlue from '../assets/marker_blue.svg';

const MapScreen = (props) => {
  const slidingPanel = useRef(null);
  const [coordinates, setCoordinates] = useState([0, 0]);
  const [data, setData] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchItems, setSearchItems] = useState([]);
  const [{userLocation}, dispatch] = useStateValue();
  const [searchLocText, setSearchLocText] = useState('');
  const camera = useRef(null);

  const {t} = useTranslation();

  const onMarkerPress = useCallback(
    (feature) => {
      setSelectedMarker(feature);
      slidingPanel.current.show();
    },
    [slidingPanel],
  );

  const fetchImages = async (latitude, longitude, range = 1) => {
    searchImagesByLocation({
      latitude: latitude,
      longitude: longitude,
      range: 1,
    }).then((data) => {
      if (data.result) {
        setData(data.result);
      }
    });
  };

  const onRegionDidChange = async (e) => {
    if (e.geometry && e.geometry.coordinates) {
      const latitude = e.geometry.coordinates[1];
      const longitude = e.geometry.coordinates[0];
      fetchImages(latitude, longitude);
    }
  };

  const onDismissSlide = async () => {
    setSelectedMarker(null);
  };

  const selectSuggestion = async (text) => {
    if (text) {
      getCoordinatesFromLocation(text).then((data) => {
        if (data !== null) {
          setCoordinates(data);
        }
      });
    }
    setSearchItems([]);
  };

  const gotoLocation = async (e) => {
    const text = e.nativeEvent.text;
    if (text) {
      getCoordinatesFromLocation(text).then((data) => {
        if (data !== null) {
          setCoordinates(data);
        }
      });
    }
  };

  useEffect(() => {
    if (searchLocText.length > 2) {
      getMapSearchItems(searchLocText).then((data) => {
        if (data) {
          setSearchItems(data);
        }
      });
    } else {
      setSearchItems([]);
    }
  }, [searchLocText]);

  useEffect(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      setCoordinates([userLocation.longitude, userLocation.latitude]);
    }
  }, [userLocation]);

  useEffect(() => {
    fetchImages(userLocation.latitude, userLocation.longitude);
  }, []);

  const SearchItemsSeperator = () => {
    return <View style={styles.seperator}></View>;
  };

  const RenderSearchItemView = ({item}) => (
    <Ripple onPress={() => selectSuggestion(item)}>
      <Text style={styles.searchItemText}>{item} </Text>
    </Ripple>
  );

  const DetailView = memo(
    ({
      isVisible = true,
      onClose = () => {},
      item = {
        latitude: 0,
        longitude: 0,
        locality: '',
        city: '',
        image_id: '',
      },
    }) => {
      const [image, setImage] = useState(null);
      useEffect(() => {
        if (item) {
          getSingleImage(item.image_id);
        }
      }, [item]);

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
          {item && (
            <View style={styles.row}>
              <Text style={styles.txt12}>{item.locality}</Text>
              <Text style={styles.txt12}>{item.city}</Text>
            </View>
          )}
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

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Text style={styles.heading}>{t('mapscreen.maps')}</Text>
          <View style={styles.inputBox}>
            <SearchIcon />
            <TextInput
              autoCorrect={false}
              spellCheck={false}
              style={styles.searchInput}
              placeholder="Bowery, New York"
              placeholderTextColor={theme.COLORS.TEXT_GREY_50P}
              onChangeText={setSearchLocText}
              onSubmitEditing={gotoLocation}
            />
          </View>
          {searchItems && searchItems.length > 0 && (
            <FlatList
              style={styles.searchlist}
              data={searchItems}
              renderItem={RenderSearchItemView}
              keyExtractor={(item) => item}
              ItemSeparatorComponent={SearchItemsSeperator}
            />
          )}
        </View>
        <MapboxGL.MapView
          styleURL={Config.MAPBOX_STYLE_MONOCHROME}
          style={styles.map}
          onRegionDidChange={onRegionDidChange}>
          <MapboxGL.Camera
            ref={camera}
            zoomLevel={17}
            centerCoordinate={coordinates}
            animationMode="moveTo"
          />
          {data.map((element, index) => (
            <MapboxGL.PointAnnotation
              id={`flag-${index}`}
              key={`flag-${index}`}
              coordinate={[element.longitude, element.latitude]}
              onSelected={() => onMarkerPress(element)}>
              <MarkerGreen />
            </MapboxGL.PointAnnotation>
          ))}
          {selectedMarker && (
            <MapboxGL.MarkerView
              id={'marker'}
              coordinate={[selectedMarker.longitude, selectedMarker.latitude]}>
              <Balloon title={`${selectedMarker.locality}`} />
            </MapboxGL.MarkerView>
          )}
        </MapboxGL.MapView>
      </View>
      <SlidingUpPanel
        ref={slidingPanel}
        onBottomReached={onDismissSlide}
        draggableRange={{top: 272, bottom: 0}}
        showBackdrop={false}>
        <DetailView isVisible={true} item={selectedMarker} />
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
    fontFamily: fontFamilies.Default,
    fontWeight: '400',
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
