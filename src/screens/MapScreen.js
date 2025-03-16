import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import MapboxGL from '@rnmapbox/maps';
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SlidingUpPanel from 'rn-sliding-up-panel';
import Config from 'react-native-config';
import {
  getCoordinatesFromLocation,
  getMapSearchItems,
} from '../services/API/MapboxAPI';
import { fontFamilies } from '../utils/fontFamilies';
import { theme } from '../services/Common/theme';
import SearchIcon from '../assets/ico_search_large.svg';
import EditIcon from '../assets/ico_edit.svg';
import ShowPolygonsIcon from '../assets/polygon-svgrepo-com.svg';
import Ripple from '../components/Ripple';
import { useTranslation } from 'react-i18next';
import { useStateValue } from '../services/State/State';
import {
  getAreas,
  getReportsOnMap,
  readReport,
} from '../services/API/APIManager';
import MarkerGreen from '../assets/marker_green.svg';
import MarkerBlue from '../assets/marker_blue.svg';
import MarkerCircleBlue from '../assets/marker_circle_blue.svg';
import MarkerCircleGreen from '../assets/marker_circle_green.svg';
import { getLocation } from '../functions/geolocation';
import { actions } from '../services/State/Reducer';
import { getWalletAddress, setMapLocation } from '../services/DataManager';
import { AggregatedMarker } from '../components/AggregatedMarker';
import { createOrUpdateArea } from '../services/API/APIManager';
import { osmSearch } from '../services/API/OSMApi';

const offsetMultiplier = 0.00001;
const heatmapThresholdLevel = 11;

const DetailView = memo(
  ({
    image_id = '',
  }) => {
    const [image, setImage] = useState(null);
    const [avatar, setAvatar] = useState('');
    useEffect(() => {
      if (image_id) {
        getSingleImage(image_id);
      }
    }, [image_id]);

    const getSingleImage = async (imageId) => {
      const walletAddress = await getWalletAddress();
      let result = await readReport(walletAddress, imageId);
      if (result && result.ok) {
        setImage(`data:plain/text;base64,${result.report.image}`);
        if (result.report.avatar) {
          setAvatar(result.report.avatar)
        }
      }
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
          <Text style={styles.txt12}>{avatar}</Text>
        </View>
        <Image
          source={{ uri: image }}
          style={styles.detailImage}
          resizeMode="contain"
        />
      </View>
    );
  },
);

const Balloon = ({ title = '' }) => {
  return (
    <View style={styles.balloonContainer}>
      <View style={styles.balloonBox}>
        <Text style={styles.balloonText}>{title}</Text>
      </View>
      <View style={styles.balloonArrow} />
    </View>
  );
};

const MapView = ({ onMarkerPress = () => { }, selectedMarker = null }) => {
  const [coordinates, setCoordinates] = useState({
    zoomLevel: 17,
    coordinates: [0, 0],
  });
  const [reportData, setReportData] = useState({});
  const [areaData, setAreaData] = useState([]);
  const [areaHeatmapData, setAreaHeatmapData] = useState(null);
  const [resultFeature, setResultFeature] = useState(null);
  const [featureToSave, setFeatureToSave] = useState(null);
  const [searchItems, setSearchItems] = useState([]);
  const [{ mapLocation, reports }, dispatch] = useStateValue();
  const [searchLocText, setSearchLocText] = useState('');
  const [savedRegion, setSavedRegion] = useState(null);
  const mapLocationRef = useRef(coordinates);
  const reportsRef = useRef(reportData);
  const areaRef = useRef(areaData);
  const camera = useRef(null);
  const [showPolygons, setShowPolygons] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [customPolygon, setCustomPolygon] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [polygonName, setPolygonName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const mapRef = useRef(null);

  const { t } = useTranslation();

  const fetchImages = async (latMin, lonMin, latMax, lonMax, latCenter, lonCenter) => {
    const walletAddress = await getWalletAddress();
    getReportsOnMap(
      walletAddress,
      latMin,
      lonMin,
      latMax,
      lonMax,
      latCenter,
      lonCenter
    ).then((data) => {
      if (data.ok) {
        if (data.reports) {
          setReportData((_prevData) => {
            const newData = {};
            data.reports.forEach((report) => {
              const key = `${report.longitude}-${report.latitude}`;
              newData[`${key}`] = [];
              newData[`${key}`].push(report);
            });
            return newData;
          });
        }
      }
    });
    getAreas(
      latMin,
      lonMin,
      latMax,
      lonMax
    ).then((data) => {
      if (data.ok) {
        if (data.areas) {
          annotatedAreas = data.areas.map((area) => {
            if (area.id) {
              area.coordinates.properties.cleanapp_id = area.id;
            }
            return area;
          });
          setAreaData(annotatedAreas);
          const heatmapData = {
            type: 'FeatureCollection',
            features: [...annotatedAreas.map((area) => area.coordinates)]
          }
          setAreaHeatmapData(heatmapData);
        }
      }
    }).error((err) => {
      console.error('Error fetching areas', err);
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
    if (savedRegion &&
      savedRegion.geometry.coordinates[0] === e.geometry.coordinates[0] &&
      savedRegion.geometry.coordinates[1] === e.geometry.coordinates[1] &&
      savedRegion.properties.zoomLevel === e.properties.zoomLevel) {
      return;
    }
    setSavedRegion(e);
    if (e.geometry && e.geometry.coordinates) {
      const latCenter = e.geometry.coordinates[1];
      const lonCenter = e.geometry.coordinates[0];
      const latMin = e.properties.visibleBounds[1][1];
      const lonMin = e.properties.visibleBounds[1][0];
      const latMax = e.properties.visibleBounds[0][1];
      const lonMax = e.properties.visibleBounds[0][0];
      setCoordinates({
        zoomLevel: e.properties.zoomLevel,
        coordinates: [lonCenter, latCenter],
      });
      setCustomPolygon([]);
      fetchImages(latMin, lonMin, latMax, lonMax, latCenter, lonCenter);
    }
  };

  useEffect(() => {
    mapLocationRef.current = coordinates; // save userCheck state value to ref
  }, [coordinates]);

  useEffect(() => {
    reportsRef.current = reportData;
  }, [reportData]);

  useEffect(() => {
    areaRef.current = areaData;
  }, [areaData]);

  useEffect(() => {
    if (reports) {
      setReportData((prevReports) => {
        return { ...prevReports, ...reports };
      });
    }
  }, [reports]);

  useEffect(() => {
    if (!mapLocation.coordinates[0] || !mapLocation.coordinates[1]) {
      // load user location
      getLocation().then((location) => {
        if (location) {
          saveMapLocation({
            ...mapLocation,
            coordinates: [location.longitude, location.latitude],
          });
        }
      });
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

  const getLocationFromFeature = (feature) => {
    if (!feature || feature.type != 'Feature' || (feature.geometry.type !== 'MultiPolygon' && feature.geometry.type !== 'Polygon')) {
      throw new Error('Input must be a valid GeoJSON Polygon or MultiPolygon Feature');
    }

    const [minX, minY, maxX, maxY] = feature.bbox;

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const dx = Math.abs(maxX - minX) * 1.5;

    return {
      coordinates: [cx, cy],
      zoomLevel: Math.log2(180 / dx)
    };
  }

  const gotoLocation = async (e) => {
    Keyboard.dismiss();
    const text = e.nativeEvent.text;
    setSearchLocText((prev) => text);
    if (text) {
      osmSearch(text).then((foundFeature) => {
        if (foundFeature != null) {
          if (foundFeature.type === 'FeatureCollection') {
            const location = getLocationFromFeature(foundFeature.features[0]);
            saveMapLocation(location);
  
            setResultFeature(foundFeature.features[0]);
          } else {
            console.log('Expected GeoJSON of type feature, got:', foundFeature.type);
          }
        }
      });
  
      // getCoordinatesFromLocation(text).then((data) => {
      //   if (data !== null) {
      //     saveMapLocation({
      //       ...mapLocation,
      //       coordinates: data,
      //     });
      //   }
      // });
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

  const RenderSearchItemView = ({ item }) => (
    <Ripple onPress={() => selectSuggestion(item)}>
      <Text style={styles.searchItemText}>{item} </Text>
    </Ripple>
  );

  const startDrawing = () => {
    setIsDrawing(!isDrawing);
    setCustomPolygon([]);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    customPolygon.push(customPolygon[0]);
    setFeatureToSave({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [customPolygon]
      },
      properties: {}
    });
    console.log('Drawn feature:', featureToSave);
    setIsModalVisible(true);
  };

  const onTouchMove = async ({nativeEvent}) => {
    if (isDrawing) {
      if (!mapRef.current) return;
      try {
        // Get the screen point from the touch event
        const { locationX, locationY } = nativeEvent;
  
        // Convert the screen coordinates to LatLng
        const latLng = await mapRef.current.getCoordinateFromView([locationX, locationY]);
  
        setCustomPolygon([...customPolygon, latLng]);
      } catch (error) {
        console.error('Error converting point:', error);
      }
    }
  };

  const onTouchEnd = async () => {
    if (isDrawing) {
      endDrawing();
    }
  };

  const findArea = (id) => {
    if (!id) {
      return null;
    }
    for (const area of areaData) {
      if (area.id == id) {
        return area;
      }
    }
    return null;
  }

  const savePolygon = () => {
    var area = findArea(featureToSave.properties.cleanapp_id);
    if (area) {
      area.name = polygonName;
      area.contact_emails = [
        {
          email: contactEmail,
          consent_report: true
        }
      ];
    } else {
      area = {
        name: polygonName,
        is_custom: true,
        contact_emails: [
          {
            email: contactEmail,
            consent_report: true
          }
        ],
        coordinates: featureToSave,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    createOrUpdateArea(area).then((response) => {
      if (response.ok) {
        console.log('Polygon saved successfully');
      } else {
        console.error('Error saving polygon');
      }
    });
    setIsModalVisible(false);
    setPolygonName('');
    setContactEmail('');
  };

  const cancelPolygon = () => {
    setIsModalVisible(false);
    setResultFeature(null);
    setPolygonName('');
    setContactEmail('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
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
              setResultFeature(null);
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
        ref={mapRef}
        styleURL={Config.MAPBOX_STYLE_MONOCHROME}
        style={styles.map}
        zoomEnabled={!isDrawing}
        scrollEnabled={!isDrawing}
        pitchEnabled={!isDrawing}
        rotateEnabled={!isDrawing}
        onRegionDidChange={onRegionDidChange}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
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
        {customPolygon.length > 0 && (
          <MapboxGL.ShapeSource id="polygon" shape={{
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [customPolygon]
            }
          }}>
            <MapboxGL.FillLayer id="polygonFill" style={{ fillColor: 'rgba(219, 33, 213, 0.5)' }} />
            <MapboxGL.LineLayer id="polygonLine" style={{ lineColor: 'rgba(219, 33, 213, 1)', lineWidth: 3 }} />
          </MapboxGL.ShapeSource>
        )}
        {showPolygons && coordinates.zoomLevel > heatmapThresholdLevel && areaData.map((area, index) => {
          return (
            <MapboxGL.ShapeSource
              id={`area-${index}`}
              key={`area-${index}`}
              shape={area.coordinates}
              onPress={(e) => {
                setPolygonName(area.name);
                setFeatureToSave(e.features[0]);
                setIsModalVisible(true);
              }}
            >
              <MapboxGL.FillLayer
                id={`areaFill-${index}`}
                style={{ fillColor: 'rgba(219, 33, 213, 0.3)' }}
              />
              <MapboxGL.LineLayer
                id={`areaLine-${index}`}
                style={{ lineColor: 'rgb(219, 33, 213)', lineWidth: 1 }}
              />
            </MapboxGL.ShapeSource>
          );
        }
        )}
        {resultFeature && (
          <MapboxGL.ShapeSource
            id={`found`}
            key={`found`}
            shape={resultFeature}
            onPress={(e) => {
              if (resultFeature.properties.name) {
                setPolygonName(resultFeature.properties.name);
              }
              setFeatureToSave(e.features[0]);
              setIsModalVisible(true);
            }}
          >
            <MapboxGL.FillLayer
              id={`foundFill`}
              style={{ fillColor: 'rgba(255, 127, 0, 0.5)' }}
            />
            <MapboxGL.LineLayer
              id={`foundLine`}
              style={{ lineColor: 'rgb(255, 0, 0)', lineWidth: 1 }}
            />
          </MapboxGL.ShapeSource>
        )}
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
                {element.count === 1 && element.team === 1 && !element.own && <MarkerBlue />}
                {element.count === 1 && element.team === 2 && !element.own && <MarkerGreen />}
                {element.count === 1 && element.team === 1 && element.own && <MarkerCircleBlue />}
                {element.count === 1 && element.team === 2 && element.own && <MarkerCircleGreen />}
                {element.count > 1 && <AggregatedMarker
                  bgColor={theme.COLORS.SILVER_SAND}
                  numColor={theme.COLORS.BLACK}
                  count={element.count}
                />}
              </MapboxGL.PointAnnotation>
            );
          }),
        )}
        {selectedMarker && selectedMarker.avatar && (
          <MapboxGL.MarkerView
            id={'marker'}
            coordinate={[selectedMarker.longitude, selectedMarker.latitude]}>
            <Balloon title={`${selectedMarker.locality}`} />
          </MapboxGL.MarkerView>
        )}
        {showPolygons && coordinates.zoomLevel <= heatmapThresholdLevel && (
          <MapboxGL.ShapeSource
            id="heatmapSource"
            shape={areaHeatmapData}
          >
            <MapboxGL.HeatmapLayer
              id="heatmapLayer"
              style={{
                heatmapColor: [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(219, 33, 213, 0.0)',
                  0.2, 'rgba(219, 33, 213, 0.2)',
                  0.4, 'rgba(219, 33, 213, 0.4)',
                  0.6, 'rgba(219, 33, 213, 0.5)',
                  0.8, 'rgba(219, 33, 213, 0.6)',
                  1, 'rgba(219, 33, 213, 0.8)'
                ],
                heatmapOpacity: 0.6,
                heatmapWeight: [
                  'interpolate',
                  ['linear'],
                  ['get', 'weight'],
                  0, 0,
                  1, 1
                ],
                heatmapRadius: [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 2,
                  9, 20
                ],
              }}
            />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>
      <TouchableOpacity
        style={[styles.showPolygonButton, showPolygons && styles.activeButton]}
        onPress={() => {setShowPolygons(!showPolygons)}}
      >
        <ShowPolygonsIcon />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.drawButton, isDrawing && styles.activeButton]}
        onPress={startDrawing}
      >
        <EditIcon />
      </TouchableOpacity>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <Text style={styles.saveHeader}>Save Polygon</Text>
          <TextInput
            placeholder="Polygon Name"
            value={polygonName}
            onChangeText={setPolygonName}
            style={styles.input}
          />
          <TextInput
            placeholder="Contact Email"
            value={contactEmail}
            onChangeText={setContactEmail}
            style={styles.input}
            inputMode='email'
            keyboardType='email-address'
            autoCapitalize='none'
          />
          <Pressable
            style={{ ...styles.btnBlue, width: 320 }}
            onPress={savePolygon}
          >
            <Text style={styles.btnBlueText}>{'Save'}</Text>
          </Pressable>
          <Pressable
            style={{ ...styles.btnBlue, width: 320 }}
            onPress={cancelPolygon}
          >
            <Text style={styles.btnBlueText}>{'Cancel'}</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const MapBoxMapScreen = (props) => {
  const slidingPanel = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const onMarkerPress = useCallback(
    (feature, longitude, latitude) => {
      if (feature.count > 1) {
        return;
      }
      setSelectedMarker({ ...feature, longitude, latitude });
      slidingPanel.current.show();
    },
    [slidingPanel],
  );

  const onDismissSlide = async () => {
    setSelectedMarker(null);
  };

  return (
    <View style={styles.page}>
      <MapView
        onMarkerPress={onMarkerPress}
        selectedMarker={selectedMarker}
      />
      <SlidingUpPanel
        ref={slidingPanel}
        onBottomReached={onDismissSlide}
        draggableRange={{
          top: Dimensions.get('screen').height - 250,
          bottom: 0,
        }}
        showBackdrop={true}>
        {selectedMarker && (
          <DetailView
            image_id={selectedMarker.report_id}
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
    transform: [{ rotateZ: '45deg' }],
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
    height: Dimensions.get('screen').height - 300,
  },
  showPolygonButton: {
    position: 'absolute',
    bottom: 95,
    right: 11,
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: 'rgba(16, 113, 209, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'rgb(127, 176, 255)',
  },
  drawButton: {
    position: 'absolute',
    bottom: 45,
    right: 11,
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: 'rgba(16, 113, 209, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  saveHeader: {
    padding: 10,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold' 
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderStyle: 'solid',
    borderColor: 'gray',
    borderWidth: 1,
    color: 'white',
  },
  btnBlue: {
    backgroundColor: theme.COLORS.BTN_BG_BLUE,
    borderRadius: 8,
    paddingVertical: 8,
    marginVertical: 10,
  },
  btnBlueText: {
    textAlign: 'center',
    fontFamily: fontFamilies.Default,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: theme.COLORS.WHITE,
  },
});
export default MapBoxMapScreen;
