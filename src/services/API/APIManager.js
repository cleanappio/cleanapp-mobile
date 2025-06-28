import { getJSONData, postJSONData } from './CoreAPICalls';
import { settings as s } from './Settings';

// === API v.2

export const updateOrCreateUser = async (publicAddress, avatar, refKey, referral) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
      avatar: avatar,
      ref_key: refKey,
      referral: referral,
    }
    const response = await postJSONData(s.v2api.updateOrCreateUser, data);
    const ret = {
      ok: response.ok
    }
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
}

export const updatePrivacyAndTOC = async (publicAddress, privacy, agreeTOC) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
      privacy: privacy,
      agree_toc: agreeTOC || '',
    }
    const response = await postJSONData(s.v2api.updatePrivacyAndToc, data);
    const ret = {
      ok: response.ok
    }
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
}

export const report = async (publicAddress, latitude, longitude, relX, relY, image, annotation = '') => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
      latitude: latitude,
      longitude: longitude,
      x: relX,
      y: relY,
      image: image,
    }
    
    // Add annotation if provided
    if (annotation && annotation.trim()) {
      data.annotation = annotation.trim();
    }
    
    const response = await postJSONData(s.v2api.report, data);
    const ret = {
      ok: response.ok
    }
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
}

export const getReportsOnMap = async (publicAddress, latMin, lonMin, latMax, lonMax, latCenter, lonCenter) => {
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
    }
    const response = await postJSONData(s.v2api.getMap, data);
    const ret = {
      ok: response.ok
    }
    if (response.ok) {
      ret.reports = await response.json()
        .then((reports) => { return reports; });
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
}

export const readReport = async (publicAddress, reportSeq) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
      seq: reportSeq,
    }
    const response = await postJSONData(s.v2api.readReport, data);
    const ret = {
      ok: response.ok
    }
    if (response.ok) {
      ret.report = await response.json()
        .then((reports) => { return reports; });
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret;
  } catch (err) {
    console.log(err);
  }
}

export const fetchReferral = async (key) => {
  try {
    const data = {
      version: '2.0',
      refkey: key,
    }
    const response = await postJSONData(s.v2api.readReferral, data);
    const ret = {
      ok: response.ok
    }
    if (response.ok) {
      ret.refid = await response.json()
        .then((response) => response.refvalue);
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
}

export const generateReferral = async (publicAddress) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
    }
    const response = await postJSONData(s.v2api.generateReferral, data);
    const ret = {
      ok: response.ok
    }
    if (response.ok) {
      ret.refid = await response.json()
        .then((response) => response.refvalue);
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret
  } catch (err) {
    return null;
  }
}

export const getTeams = async (publicAddress) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
    }
    const response = await postJSONData(s.v2api.getTeams, data);
    const ret = {
      ok: response.ok
    }
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
    return ret
  } catch (err) {
    return null;
  }
}

export const getTopScores = async (publicAddress) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
    }
    const response = await postJSONData(s.v2api.getTopScores, data);
    const ret = {
      ok: response.ok
    }
    if (response.ok) {
      ret.records = await response.json()
        .then((response) => response.records);
    } else {
      if (response.error) {
        ret.error = response.error;
      } else if (response.status) {
        ret.error = response.statusText;
      }
    }
    return ret
  } catch (err) {
    return null;
  }
}

export const getRewardStats = async (publicAddress) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
    }
    const response = await postJSONData(s.v2api.getStats, data);
    const ret = {
      ok:response.ok
    }
    if (response.ok) {
      ret.stats = await response.json()
        .then((response) => response);
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
}

export const getBlockchainLink = async (publicAddress) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
    }
    const response = await postJSONData(s.v2api.getBlockchainLink, data);
    const ret = {
      ok:response.ok
    }
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
}

export const createOrUpdateArea = async (area) => {
  try {
    const data = {
      version: '2.0',
      area: area,
    }
    const response = await postJSONData(s.v2api.createOrUpdateArea, data);
    const ret = {
      ok: response.ok
    }
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
}

export const getAreas = async (latMin, lonMin, latMax, lonMax) => {
  try {
    const params = {
      sw_lat: `${latMin}`,
      sw_lon: `${lonMin}`,
      ne_lat: `${latMax}`,
      ne_lon: `${lonMax}`,
    }
    const response = await getJSONData(s.v2api.getArea, params);
    const ret = {
      ok: response.ok
    }
    if (response.ok) {
      ret.areas = await response.json()
        .then((response) => response);
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
}