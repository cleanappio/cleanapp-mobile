import Config from 'react-native-config';
import {
  getData,
  getFile,
  postData,
  getUserData,
  postUserData,
  postJSONData,
} from './CoreAPICalls';
import { settings as s } from './Settings';

// === API v.2

export const updateOrCreateUser = async (publicAddress, avatar, referral) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
      avatar: avatar,
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
      agree_toc: agreeTOC,
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

export const report = async (publicAddress, latitude, longitude, image) => {
  try {
    const data = {
      version: '2.0',
      id: publicAddress,
      latitude: latitude,
      longitude: longitude,
      x: 0,
      y: 0,
      image: image,
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

export const readReport = async (reportSeq) => {
  try {
    const data = {
      version: '2.0',
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
      resp_json = await response.json();
      ret.green = resp_json.green;
      ret.blue = resp_json.blue;
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

// === Deprecated API v.1

export const getImage = async (imageId) => {
  try {
    const response = await getFile(
      s.taxonomy.getImage.replace('$[image_id]', imageId),
    );
    return response;
  } catch (err) {
    return null;
  }
};

export const getLabelImage = async (label) => {
  try {
    const response = await getFile(
      s.taxonomy.getLabelImage.replace('$[label_id]', label),
    );
    return response;
  } catch (err) {
    return null;
  }
};

export const storeUserResponse = async (data) => {
  try {
    const response = await postUserData(s.taxonomy.storeUserResponse, data);
    return response;
  } catch (err) {
    return null;
  }
};

export const userLogin = async (publicAddress, signature) => {
  try {
    let data = {
      public_address: public_address,
      signature: signature,
      source: Config.APP_SOURCE_NAME,
    };
    const response = await postData(s.auth.login, data);
    return response;
  } catch (err) {
    return null;
  }
};

export const userRegister = async (public_address, referral_id = '') => {
  try {
    let data = {
      public_address: public_address,
      source: Config.APP_SOURCE_NAME,
    };
    if (referral_id) {
      data.referral_id = referral_id;
    }
    const response = await postData(s.auth.register, data);
    // naming logic changed to onboard
    const username = await postData(s.auth.user_name, data);
    if (username && username.username) {
      response.username = username.username;
    }
    return response;
  } catch (err) {
    return null;
  }
};
export const requestUserName = async (public_address) => {
  try {
    let data = { public_address: public_address };
    const username = await postData(s.auth.user_name, data);
    if (username && username.username) {
    }
    return username;
  } catch (err) { }
  return null;
};

export const changeUserName = async (public_address, name) => {
  try {
    let data = { public_address: public_address, username: name };
    const response = await postData(s.auth.change_user_name, data);
    return response;
  } catch (err) {
    return null;
  }
};

export const userLogout = async () => {
  try {
    const response = await getUserData(s.auth.logout);
    return response;
  } catch (err) {
    return null;
  }
};

/**
 * Verification APIs
 */
/**
 * queryMetadata
 * @param {*} page
 * @param {*} type (optional) BoundingBox, TextTag, Anonymization
 * @param {*} tags (optional) ["birdhouse"]
 * @param {*} fields (optional) ["image_id","descriptions","tags"],
 *
 * @returns
 *
 */
//{"page":1,"page_size":100,"result":[{"descriptions":[],"image_id":"df970b07070d3800","tag_data":["meme bounty"]},{"descriptions":[],"image_id":"ff0f004440fffb04","tag_data":["nft+art bounty"]},{"descriptions":[],"image_id":"e0f0f0e0f8fcfedf","tag_data":["nft+art bounty"]},{"descriptions":[],"image_id":"20f8f86cf8f86600","tag_data":["nft+art bounty"]},}]}
export const queryMetadata = async (data) => {
  //const data = {page: page, status: status, fields: fields, type: type};
  //check if tags empty, then what result?

  try {
    const response = await postUserData(s.metadata.queryMetadata, data);
    return response;
  } catch (err) {
    return null;
  }
};

export const getImageById = async (imageId) => {
  try {
    const response = await getFile(
      s.metadata.getImageById.replace('$[image_id]', imageId),
    );
    return response;
  } catch (err) {
    return null;
  }
};

export const getNounce = async (public_address) => {
  try {
    const response = await getData(
      s.auth.get_nounce.replace('$[public_address]', public_address),
    );
    return response;
  } catch (err) {
    return null;
  }
};

/**
 * {annotation: {tags: [], description: ""}
 * image_id: "003c3c7c7c7c3c3c"
 * verification: {tags: {up_votes: [], down_votes: []}, descriptions: {up_votes: ["Peonies flower"], down_votes: []}}}
 */
// export const verifyImage = async (image_id, annotation, verification) => {
export const verifyImage = async (data) => {
  // const data = {
  //   image_id: image_id,
  //   annotation: annotation,
  //   verification: verification,
  // };
  try {
    const response = await postUserData(s.metadata.verifyImage, data);
    return response;
  } catch (err) {
    return null;
  }
};

export const uploadImage = async (data) => {
  try {
    const response = await postUserData(s.taxonomy.uploadImage, data, true);
    return response;
  } catch (err) {
    return null;
  }
};

export const annotateImage = async (data) => {
  try {
    const response = await postUserData(s.taxonomy.annotateImage, data);
    return response;
  } catch (err) {
    return null;
  }
};

/**
 * POST
 * {photos: [{photo_id: "fffff1000010787c"}]}
 */
export const reportImages = async (photos) => {
  const data = { photos: [...photos] };
  try {
    const response = await postUserData(s.metadata.reportImages, data);
    return response;
  } catch (err) {
    return null;
  }
};

/**
 *
 * {
 *  image_id:"f7f080000080f8fc",
 *  annotations: [{type: "box", tag: "food bounty", x: 0.017901029601219743, y: 0.245839636913767, width: 0.9639395801815431,height: 0.3282904689863842}, ...]
 * }
 */
export const annotate = async (data) => {
  try {
    const response = await postUserData(s.metadata.annotate, data);
    return response;
  } catch (err) { }
  return null;
};

export const saveUsageFlag = async (data) => {
  try {
    const response = await postUserData(s.auth.usageFlag, data);
    return response;
  } catch (err) {
    return null;
  }
};

export const getRomanNumberStats = async () => {
  try {
    const response = await getUserData(s.taxonomy.getRomanNumberStats);
    return response;
  } catch (err) {
    return null;
  }
};

export const getReferralId = async () => {
  try {
    const response = await getUserData(s.user.referral_id);
    return response;
  } catch (err) {
    return null;
  }
};

export const getUserRanks = async () => {
  try {
    const response = await getUserData(s.queryView.userRank);
    return response;
  } catch (err) { }
  return null;
};

export const createGuild = async ({
  profile_image,
  name = '',
  description = '',
  invited_users = [],
}) => {
  const req = new FormData();
  req.append('file', profile_image);
  req.append('name', name);
  req.append('description', description);
  req.append('invited_users', invited_users);
  try {
    const response = await postUserData(s.guild.createGuild, req, true);
    return response;
  } catch (err) {
    return null;
  }
};

export const joinGuild = async ({ guild_id = '' }) => {
  try {
    const response = await getUserData(
      s.guild.joinGuild.replace('$[GUILD_ID]', guild_id),
    );
    return response;
  } catch (err) { }
  return null;
};

export const leaveGuild = async ({ guild_id = '' }) => {
  try {
    const response = await getUserData(
      s.guild.leaveGuild.replace('$[GUILD_ID]', guild_id),
    );
    return response;
  } catch (err) { }
  return null;
};

export const getGuildList = async () => {
  try {
    const response = await getUserData(s.guild.getGuildList);
    return response;
  } catch (err) { }
  return null;
};

export const getUserRank = async () => {
  try {
    const response = await getUserData(s.guild.userrank);
    return response;
  } catch (err) { }
  return null;
};

export const setDataSharingOption = async (option) => {
  try {
    const response = await postUserData(s.metadata.shareDataLive, {
      data_sharing_option: option,
    });
    return response;
  } catch (err) { }
  return null;
};

export const getDataSharingOption = async () => {
  try {
    const response = await getUserData(s.metadata.shareDataLive);
    return response;
  } catch (err) { }
  return null;
};

export const startTutorial = async () => {
  try {
    const response = await getUserData(s.other.startTutorial);
    return response;
  } catch (err) { }
  return null;
};

export const getTeamStatus = async () => {
  try {
    const response = await getUserData(s.other.team_status);
    return response;
  } catch (err) { }
  return null;
};

export const getGuildImage = async (guildId) => {
  try {
    const response = await getFile(
      s.guild.getGuildImage.replace('$[GUILD_ID]', guildId),
    );
    return response;
  } catch (err) { }
  return null;
};

export const get_reward_status = async () => {
  try {
    const response = await getUserData(s.reward.get_reward_status);
    return response;
  } catch (err) { }
  return null;
};

export const get_claim_time = async () => {
  try {
    const response = await getUserData(s.reward.next_claim_time);
    return response;
  } catch (err) { }
  return null;
};

export const update_annotation = async (data) => {
  try {
    const response = await postUserData(
      s.taxonomy.updateAnnotation,
      data,
      true,
    );
    return response;
  } catch (err) { }
  return null;
}