import {getJSONData, postJSONData} from './CoreAPICalls';
import {settings as s, getUrls} from './Settings';
import {getMapLocation} from '../DataManager';
import MatchReportsLogger from '../../utils/MatchReportsLogger';

// === API v.2

export const updateOrCreateUser = async (
  publicAddress,
  avatar,
  refKey,
  referral,
) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
      avatar: avatar,
      ref_key: refKey,
      referral: referral,
    };
    const response = await postJSONData(s.v2api.updateOrCreateUser, data);
    const ret = {
      ok: response.ok,
    };
    if (response.ok) {
      resp_json = await response.json();
      ret.team = resp_json.team;
      ret.dup_avatar = resp_json.dup_avatar;
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    return null;
  }
};

export const updatePrivacyAndTOC = async (publicAddress, privacy, agreeTOC) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
      privacy: privacy,
      agree_toc: agreeTOC || '',
    };
    const response = await postJSONData(s.v2api.updatePrivacyAndToc, data);
    const ret = {
      ok: response.ok,
    };
    if (!response.ok) {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    return null;
  }
};

export const report = async (
  publicAddress,
  latitude,
  longitude,
  relX,
  relY,
  image,
  annotation = '',
) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
      latitude: latitude,
      longitude: longitude,
      x: relX,
      y: relY,
      image: image,
    };

    // Add annotation if provided
    if (annotation && annotation.trim()) {
      data.annotation = annotation.trim();
    }

    const response = await postJSONData(s.v2api.report, data);
    const ret = {
      ok: response.ok,
    };
    if (response.ok) {
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    return null;
  }
};

export const getReportsOnMap = async (
  publicAddress,
  latMin,
  lonMin,
  latMax,
  lonMax,
  latCenter,
  lonCenter,
) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
      vport: {
        latmin: latMin,
        lonmin: lonMin,
        latmax: latMax,
        lonmax: lonMax,
      },
      center: {
        lat: latCenter,
        lon: lonCenter,
      },
    };
    const response = await postJSONData(s.v2api.getMap, data);
    const ret = {
      ok: response.ok,
    };
    if (response.ok) {
      ret.reports = await response.json().then(reports => {
        return reports;
      });
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    return null;
  }
};

export const readReport = async (publicAddress, reportSeq) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
      seq: reportSeq,
    };
    const response = await postJSONData(s.v2api.readReport, data);
    const ret = {
      ok: response.ok,
    };
    if (response.ok) {
      ret.report = await response.json().then(reports => {
        return reports;
      });
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    return null;
  }
};

export const fetchReferral = async key => {
  try {
    const data = {
      version: '2.0',
      refkey: key,
    };
    const response = await postJSONData(s.v2api.readReferral, data);
    const ret = {
      ok: response.ok,
    };
    if (response.ok) {
      ret.refid = await response.json().then(response => response.refvalue);
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    return null;
  }
};

export const generateReferral = async publicAddress => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
    };
    const response = await postJSONData(s.v2api.generateReferral, data);
    const ret = {
      ok: response.ok,
    };
    if (response.ok) {
      ret.refid = await response.json().then(response => response.refvalue);
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    return null;
  }
};

export const getTeams = async publicAddress => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
    };
    const response = await postJSONData(s.v2api.getTeams, data);
    const ret = {
      ok: response.ok,
    };
    if (response.ok) {
      respJson = await response.json();
      ret.green = respJson.green;
      ret.blue = respJson.blue;
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    return null;
  }
};

export const getTopScores = async publicAddress => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
    };
    const response = await postJSONData(s.v2api.getTopScores, data);
    const ret = {
      ok: response.ok,
    };
    if (response.ok) {
      ret.records = await response.json().then(response => response.records);
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    return null;
  }
};

export const getRewardStats = async publicAddress => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
    };
    const response = await postJSONData(s.v2api.getStats, data);
    const ret = {
      ok: response.ok,
    };
    if (response.ok) {
      ret.stats = await response.json().then(response => response);
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    return null;
  }
};

export const getBlockchainLink = async publicAddress => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
    };
    const response = await postJSONData(s.v2api.getBlockchainLink, data);
    const ret = {
      ok: response.ok,
    };
    if (response.ok) {
      respJson = await response.json();
      ret.blockchainLink = respJson.blockchain_link;
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    return null;
  }
};

export const createOrUpdateArea = async area => {
  try {
    const data = {
      version: '2.0',
      area: area,
    };
    const response = await postJSONData(s.v2api.createOrUpdateArea, data);
    const ret = {
      ok: response.ok,
    };
    if (!response.ok) {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
  } catch (err) {
    return null;
  }
};

export const getAreas = async (latMin, lonMin, latMax, lonMax) => {
  try {
    const params = {
      sw_lat: `${latMin}`,
      sw_lon: `${lonMin}`,
      ne_lat: `${latMax}`,
      ne_lon: `${lonMax}`,
    };
    const response = await getJSONData(s.v2api.getArea, params);
    const ret = {
      ok: response.ok,
    };
    if (response.ok) {
      ret.areas = await response.json().then(response => response);
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getReportsByLatLon = async (lat, lon) => {
  try {
    const params = {
      latitude: `${lat}`,
      longitude: `${lon}`,
      radius_km: '0.5',
      n: '10',
      lang: 'en',
    };

    // const url = `${s.v3api.getReportsByLatLon}?${new URLSearchParams(params).toString()}`;
    const url = `${getUrls().liveUrl}/api/v3/reports/by-latlng-lite?latitude=${lat}&longitude=${lon}&radius_km=0.5&n=10&lang='en'`;
    console.log('URL', url);
    const response = await fetch(url);
    console.log('Response', response);
    const ret = {
      ok: response.ok,
      reports: undefined,
      error: undefined,
    };
    if (response.ok) {
      ret.reports = await response.json().then(response => response);
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }

    console.log('Ret', ret);
    return ret;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getReportsById = async (userId) => {
  try {
    const url = `${getUrls().liveUrl}/api/v3/reports/by-id?id=${userId}`;
    
    const response = await fetch(url);
    
    const ret = {
      ok: response.ok,
      reports: undefined,
      error: undefined,
    };
    
    if (response.ok) {
      ret.reports = await response.json().then(data => data);
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }

    return ret;
  } catch (err) {
    console.error('Error fetching reports by ID:', err);
    return {
      ok: false,
      error: err.message || 'Unknown error occurred',
      reports: undefined,
    };
  }
};

export const matchReports = async (
  publicAddress,
  latitude,
  longitude,
  image,
  annotation = '',
) => {
  const startTime = Date.now();
  const processId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Log process start
    MatchReportsLogger.logProcessStart({
      processId,
      publicAddress,
      latitude,
      longitude,
      imageSize: image ? image.length : 0,
      annotation,
    });

    // Validate input data
    const validationErrors = [];
    if (!publicAddress) validationErrors.push('publicAddress is required');
    if (!latitude || typeof latitude !== 'number')
      validationErrors.push('latitude must be a valid number');
    if (!longitude || typeof longitude !== 'number')
      validationErrors.push('longitude must be a valid number');
    if (!image || typeof image !== 'string')
      validationErrors.push('image must be a valid base64 string');

    MatchReportsLogger.logDataValidation(
      {
        publicAddress,
        latitude,
        longitude,
        image,
        annotation,
      },
      validationErrors,
    );

    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Prepare request data
    const data = {
      version: '2.0',
      id: publicAddress,
      latitude: latitude,
      longitude: longitude,
      x: 0.5,
      y: 0.5,
      image: image,
      annotation: annotation,
    };

    // Log API request
    MatchReportsLogger.logApiRequest(data, s.v3api.matchReport);

    const apiStartTime = Date.now();
    const config = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      `https://processing.cleanapp.io/api/v3/match_report`,
      config,
    );
    const apiDuration = Date.now() - apiStartTime;

    // Log API response
    MatchReportsLogger.logApiResponse(
      response,
      s.v3api.matchReport,
      apiDuration,
    );

    const ret = {
      ok: response.ok,
      processId,
    };

    if (response.ok) {
      const responseData = await response.json();
      ret.success = responseData.success;
      ret.message = responseData.message;
      ret.results = responseData.results || [];

      // Log process success
      const totalDuration = Date.now() - startTime;
      MatchReportsLogger.logProcessSuccess(ret, totalDuration);

      // Log performance metrics
      MatchReportsLogger.logPerformanceMetrics({
        totalDuration,
        apiCallDuration: apiDuration,
        dataProcessingDuration: totalDuration - apiDuration,
        imageSize: image.length,
        matchCount: ret.results.length,
      });
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }

      // Log process error
      const totalDuration = Date.now() - startTime;
      MatchReportsLogger.logProcessError(
        new Error(ret.error || 'API call failed'),
        {processId, response},
        totalDuration,
      );
    }

    return ret;
  } catch (err) {
    const totalDuration = Date.now() - startTime;

    // Log process error
    MatchReportsLogger.logProcessError(
      err,
      {
        processId,
        publicAddress,
        latitude,
        longitude,
        imageSize: image ? image.length : 0,
        annotation,
      },
      totalDuration,
    );

    return {
      ok: false,
      error: err.message || 'Unknown error occurred',
      processId,
    };
  }
};
