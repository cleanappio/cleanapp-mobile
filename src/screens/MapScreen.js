import React, {useCallback, useEffect, useRef, useState} from 'react';
import MapboxGL from '@rnmapbox/maps';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import {MAPBOX_STYLE_MONOCHROME} from '../../env';
import {
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
const test_image1 = require('../assets/test_marker1.jpg');
const test_image2 = require('../assets/test_marker2.jpg');
const test_markers = [
  {position: [-74.020257, 40.774479], image: test_image1},
  {position: [-74.023257, 40.775479], image: test_image1},
  {position: [-74.022257, 40.776479], image: test_image1},
  {position: [-74.021257, 40.773479], image: test_image1},
  {position: [-74.025257, 40.772479], image: test_image1},
  {position: [-74.026257, 40.771479], image: test_image1},
];

const MapScreen = (props) => {
  const slidingPanel = useRef(null);
  const [coordinates, setCoordinates] = useState([-74.020257, 40.774479]);
  const [data, setData] = useState(test_markers);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchItems, setSearchItems] = useState([]);

  const {t} = useTranslation();

  useState(() => {
    if (searchText.length > 2) {
      getMapSearchItems(searchText).then((data) => {
        if (data) {
          setSearchItems(data);
        }
      });
    }
  }, [searchText]);

  const onMarkerPress = useCallback(
    (feature) => {
      setSelectedMarker(feature);
      slidingPanel.current.show();
    },
    [slidingPanel],
  );

  useEffect(() => {
    getReverseGeocodingData([-74.026257, 40.771479], false).then((data) => {});
    getReverseGeocodingData([-74.026257, 40.771479], true).then((data) => {});
  }, []);

  /**
   * https://dev.to/ajmal_hasan/mapbox-geocoding-directions-integration-with-react-native-mapbox-49i6
   * @param {*} param0
   * @returns
   */
  const SearchLocationInput = ({}) => {
    return (
      <View style={styles.inputBox}>
        <SearchIcon />
        <TextInput
          autoCorrect={false}
          spellCheck={false}
          style={styles.searchInput}
          placeholder="Bowery, New York"
          placeholderTextColor={theme.COLORS.TEXT_GREY_50P}
          //onChangeText={setSearchText}
        />
      </View>
    );
  };

  const SearchItemsSeperator = () => {
    return <></>;
  };

  const SearchContainer = ({}) => {
    return (
      <View style={styles.searchContainer}>
        <Text style={styles.heading}>{t('mapscreen.maps')}</Text>
        <FlatList
          style={styles.searchlist}
          data={searchItems}
          renderItem={({item}) => (
            <Text style={{padding: 10}}>{item.name} </Text>
          )}
          keyExtractor={(item) => item.name}
          ItemSeparatorComponent={SearchItemsSeperator}
          ListHeaderComponent={SearchLocationInput}
        />
      </View>
    );
  };

  const DetailView = ({
    isVisible = true,
    onClose = () => {},
    item = {
      location: 'Christie St, 67B',
      city: 'New York',
    },
  }) => {
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
          <Text style={styles.txt12}>{item.location}</Text>
          <Text style={styles.txt12}>{item.city}</Text>
        </View>
        <Image
          source={test_image1}
          style={styles.detailImage}
          resizeMode="cover"
        />
      </View>
    );
  };

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
        <SearchContainer />
        <MapboxGL.MapView styleURL={MAPBOX_STYLE_MONOCHROME} style={styles.map}>
          <MapboxGL.Camera zoomLevel={17} centerCoordinate={coordinates} />
          {data.map((element, index) => (
            <MapboxGL.PointAnnotation
              coordinate={element.position}
              onSelected={() => onMarkerPress(element)}
            />
          ))}
          {selectedMarker && (
            <MapboxGL.MarkerView
              id={'marker'}
              coordinate={selectedMarker.position}>
              <Balloon title={'Christie, St 67B'} />
            </MapboxGL.MarkerView>
          )}
        </MapboxGL.MapView>
      </View>
      <SlidingUpPanel
        ref={slidingPanel}
        draggableRange={{top: 272, bottom: 0}}
        showBackdrop={false}>
        <DetailView isVisible={false} />
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
    marginTop: 16,
  },
  inputBox: {
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
    marginTop: -110,
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
    width: '100%',
  },
});
export default MapScreen;
