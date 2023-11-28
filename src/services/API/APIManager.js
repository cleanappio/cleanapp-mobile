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

export const updateOrCreateUser = async (public_address, avatar, referral) => {
  console.log('+++++++++++++++++++');
  console.log('+++++++++++++++++++');
  console.log('updateOrCreateUser', public_address, avatar, referral);
  console.log('+++++++++++++++++++');
  console.log('+++++++++++++++++++');
  try {
    const data = {
      version: '2.0',
      id: public_address,
      avatar: avatar,
      referral: referral,
    }
    const response = await postJSONData(s.v2api.updateOrCreateUser, data);
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

export const updatePrivacyAndTOC = async (public_address, privacy, agreeTOC) => {
  try {
    const data = {
      version: '2.0',
      id: public_address,
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

export const report = async (public_address, latitude, longitude, image) => {
  try {
    const data = {
      version: '2.0',
      id: public_address,
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

export const getMap = async (public_address, latTop, lonLeft, latBottom, lonRight) => {
  try {
    const data = {
      version: '2.0',
      id: public_address,
      vport: {
        lattop: latTop,
        lonleft: lonLeft,
        latbottom: latBottom,
        lonright: lonRight,
      }
    }
    const response = await postJSONData(s.v2api.getMap, data);
    const ret = {
      ok: response.ok
    }
    if (response.ok) {
      ret.pins = await response.json()
        .then((pins) => pins);
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

export const generateReferral = async(public_address) => {
  try {
    const data = {
      version: '2.0',
      id: public_address,
    }
    console.log(data);
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

// === Deprecated API v.1

export const getImage = async (imageId) => {
  console.log('========= getImage');
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
  console.log('========= getLabelImage');
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
  console.log('========= storeUserResponse');
  try {
    const response = await postUserData(s.taxonomy.storeUserResponse, data);
    return response;
  } catch (err) {
    return null;
  }
};

export const userLogin = async (public_address, signature) => {
  console.log('========= userLogin');
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
  console.log('========= userRegister');
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
  console.log('========= requestUserName');
  try {
    let data = {public_address: public_address};
    const username = await postData(s.auth.user_name, data);
    if (username && username.username) {
    }
    return username;
  } catch (err) {}
  return null;
};

export const changeUserName = async (public_address, name) => {
  console.log('========= changeUserName');
  try {
    let data = {public_address: public_address, username: name};
    const response = await postData(s.auth.change_user_name, data);
    return response;
  } catch (err) {
    return null;
  }
};

export const userLogout = async () => {
  console.log('========= userLogout');
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
  console.log('========= queryMetadata');
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
  console.log('========= getImageById');
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
  console.log('========= getNonse');
  try {
    const response = await getData(
      s.auth.get_nounce.replace('$[public_address]', public_address),
    );
    console.log(response);
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
  console.log('========= verifyImage');
  try {
    const response = await postUserData(s.metadata.verifyImage, data);
    return response;
  } catch (err) {
    return null;
  }
};

export const uploadImage = async (data) => {
  console.log('========= uploadImage');
  try {
    const response = await postUserData(s.taxonomy.uploadImage, data, true);
    return response;
  } catch (err) {
    return null;
  }
};

export const annotateImage = async (data) => {
  console.log('========= annotateImage');
  try {
    console.log(data);
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
  console.log('========= reportImages');
  const data = {photos: [...photos]};
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
  console.log('========= annotate');
  try {
    const response = await postUserData(s.metadata.annotate, data);
    return response;
  } catch (err) {}
  return null;
};

export const saveUsageFlag = async (data) => {
  console.log('========= saveUserFlag');
  try {
    const response = await postUserData(s.auth.usageFlag, data);
    return response;
  } catch (err) {
    return null;
  }
};

export const getRomanNumberStats = async () => {
  console.log('========= getRomanNumberStats');
  try {
    const response = await getUserData(s.taxonomy.getRomanNumberStats);
    return response;
  } catch (err) {
    return null;
  }
};

export const getReferralId = async () => {
  console.log('========= getReferralId');
  try {
    const response = await getUserData(s.user.referral_id);
    return response;
  } catch (err) {
    return null;
  }
};

export const getUserRanks = async () => {
  console.log('========= getUserRanks');
  try {
    const response = await getUserData(s.queryView.userRank);
    return response;
  } catch (err) {}
  return null;
};

export const createGuild = async ({
  profile_image,
  name = '',
  description = '',
  invited_users = [],
}) => {
  console.log('========= sreateGuild');
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

export const joinGuild = async ({guild_id = ''}) => {
  console.log('========= jopinGuild');
  try {
    const response = await getUserData(
      s.guild.joinGuild.replace('$[GUILD_ID]', guild_id),
    );
    return response;
  } catch (err) {}
  return null;
};

export const leaveGuild = async ({guild_id = ''}) => {
  console.log('========= leaveGuild');
  try {
    const response = await getUserData(
      s.guild.leaveGuild.replace('$[GUILD_ID]', guild_id),
    );
    return response;
  } catch (err) {}
  return null;
};

export const getGuildList = async () => {
  console.log('========= getGuildList');
  try {
    const response = await getUserData(s.guild.getGuildList);
    return response;
  } catch (err) {}
  return null;
};

export const getUserRank = async () => {
  console.log('========= getUserRank');
  try {
    const response = await getUserData(s.guild.userrank);
    return response;
  } catch (err) {}
  return null;
};

export const setDataSharingOption = async (option) => {
  console.log('========= setDataSharingOption');
  try {
    const response = await postUserData(s.metadata.shareDataLive, {
      data_sharing_option: option,
    });
    return response;
  } catch (err) {}
  return null;
};

export const getDataSharingOption = async () => {
  console.log('========= getDatSharingOption');
  try {
    const response = await getUserData(s.metadata.shareDataLive);
    return response;
  } catch (err) {}
  return null;
};

export const startTutorial = async () => {
  console.log('========= startTutorial');
  try {
    const response = await getUserData(s.other.startTutorial);
    return response;
  } catch (err) {}
  return null;
};

export const searchImagesByLocation = async ({
  latitude,
  longitude,
  range = 1,
}) => {
  console.log('========= searchImageByLocation');
  try {
    const response = await getUserData(
      s.metadata.searchImagesByLocation
        .replace('$[latitude]', latitude)
        .replace('$[longitude]', longitude)
        .replace('$[range]', range),
    );
    return response;
  } catch (err) {}

  return null;
};

export const getTeamStatus = async () => {
  console.log('========= getTeamStatus');
  try {
    const response = await getUserData(s.other.team_status);
    return response;
  } catch (err) {}
  return null;
};

export const getGuildImage = async (guildId) => {
  console.log('========= getGuildImage');
  try {
    const response = await getFile(
      s.guild.getGuildImage.replace('$[GUILD_ID]', guildId),
    );
    return response;
  } catch (err) {}
  return null;
};

export const get_reward_status = async () => {
  console.log('========= get_reward_status');
  try {
    const response = await getUserData(s.reward.get_reward_status);
    return response;
  } catch (err) {}
  return null;
};

export const get_claim_time = async () => {
  console.log('========= get_claim_time');
  try {
    const response = await getUserData(s.reward.next_claim_time);
    return response;
  } catch (err) {}
  return null;
};

export const update_annotation = async (data) => {
  console.log('========= update_annotation');
  try {
    const response = await postUserData(
      s.taxonomy.updateAnnotation,
      data,
      true,
    );
    return response;
  } catch (err) {}
  return null;
}