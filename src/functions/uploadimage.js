import {actions} from '../services/State/Reducer';
import {uploadImage, annotateImage} from '../services/API/APIManager';
import DocumentPicker from 'react-native-document-picker';

export const onPickFile = async (
  files = [],
  setFiles = () => {},
  fileUploadResponses = [],
  setFileUploadResponses = () => {},
  setUploadingImageIndex = () => {},
) => {
  try {
    const pickedFiles = await DocumentPicker.pickMultiple({
      type: [DocumentPicker.types.images],
    });
    if (pickedFiles && pickedFiles.length > 0) {
      const allFiles = files.slice();
      pickedFiles.forEach((file) => allFiles.push(file));
      setFiles(allFiles);
      uploadMultipleFiles(
        pickedFiles,
        fileUploadResponses,
        setFileUploadResponses,
        setUploadingImageIndex,
      );
    }
  } catch (err) {}
};

export const handleChangeDescription = (
  val,
  index,
  descriptions,
  setDescriptions,
) => {
  let allDescriptions = descriptions.slice();
  allDescriptions[index] = val;
  setDescriptions(allDescriptions);
};

export const handleChangeTags = (val, index, tags, setTags) => {
  let allTags = tags.slice();
  allTags[index] = val;
  setTags(allTags);
};

export const handlePiiSelect = (val, index, pii, setPii) => {
  let allPiiTags = pii.slice();
  let allSelectedOptions = (allPiiTags[index] || []).slice();
  if (allSelectedOptions.includes(val)) {
    allSelectedOptions = allSelectedOptions.filter((o) => o !== val);
  } else {
    allSelectedOptions.push(val);
  }
  allPiiTags[index] = allSelectedOptions;
  setPii(allPiiTags);
};

export const handleBountySelect = (val, index, bounties, setBounties) => {
  let allBountyTags = bounties.slice();
  let allSelectedOptions = (allBountyTags[index] || []).slice();
  if (allSelectedOptions.includes(val)) {
    allSelectedOptions = allSelectedOptions.filter((o) => o !== val);
  } else {
    allSelectedOptions.push(val);
  }
  allBountyTags[index] = allSelectedOptions;
  setBounties(allBountyTags);
};

export const verifyFields = (
  dispatch = () => {},
  fileUploadResponses = [],
  descriptions = '',
  tags = [],
  setSelectedIndex = () => {},
) => {
  for (const [index, fileUploadResponse] of fileUploadResponses.entries()) {
    if (fileUploadResponse && fileUploadResponse.id) {
      let message = '';
      if (message) {
        setSelectedIndex(index);
        dispatch({
          type: actions.SET_ALERT_SETTINGS,
          alertSettings: {
            show: true,
            type: 'error',
            title: 'Fields Required',
            message: message,
            showConfirmButton: true,
            confirmText: 'Ok',
          },
        });
        return false;
      }
    }
  }
  return true;
};

const uploadMultipleFiles = async (
  pickedFiles = [],
  fileUploadResponses = [],
  setFileUploadResponses = () => {},
  setUploadingImageIndex = () => {},
) => {
  try {
    if (pickedFiles && pickedFiles.length > 0) {
      const allFileUploadResponses = fileUploadResponses.slice();
      for (const [index, file] of pickedFiles.entries()) {
        setUploadingImageIndex(
          fileUploadResponses && fileUploadResponses.length > 0
            ? fileUploadResponses.length + index
            : index,
        );
        const res = await uploadSingleFile(file);
        allFileUploadResponses.push(res);
        setFileUploadResponses(allFileUploadResponses);
      }
      setUploadingImageIndex(null);
    }
  } catch (err) {}
};

export const uploadSingleFile = async (file = {}) => {
  try {
    const filedata = new FormData();
    filedata.append('file', file);
    const result = await uploadImage(filedata);
    if (result) {
      return result;
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
};

export const getSuccess = (fileUploadResponses = [], index = 0) => {
  if (fileUploadResponses && fileUploadResponses[index]) {
    if (fileUploadResponses[index].id) {
      return true;
    } else if (fileUploadResponses[index].message) {
      return false;
    } else if (
      fileUploadResponses[index].status &&
      fileUploadResponses[index].status === 'failed' &&
      fileUploadResponses[index].messages &&
      fileUploadResponses[index].messages.length > 0
    ) {
      return false;
    }
  } else {
    return false;
  }
};

export const getError = (fileUploadResponses = [], index = 0) => {
  if (fileUploadResponses && fileUploadResponses[index]) {
    if (fileUploadResponses[index].id) {
      return '';
    } else if (fileUploadResponses[index].message) {
      return fileUploadResponses[index].message;
    } else if (
      fileUploadResponses[index].status &&
      fileUploadResponses[index].status === 'failed' &&
      fileUploadResponses[index].messages &&
      fileUploadResponses[index].messages.length > 0
    ) {
      return fileUploadResponses[index].messages.join(', ');
    }
  } else {
    return '';
  }
};

export const onRemove = (
  files = [],
  setFiles = () => {},
  fileUploadResponses = [],
  setFileUploadResponses = () => {},
  itemIndexToRemove = -1,
) => {
  try {
    let allFiles = files.slice();
    let allFileUploadResponses = fileUploadResponses.slice();
    allFiles = allFiles.filter((_, index) => index !== itemIndexToRemove);
    allFileUploadResponses = allFileUploadResponses.filter(
      (_, index) => index !== itemIndexToRemove,
    );
    setFiles(allFiles);
    setFileUploadResponses(allFileUploadResponses);
  } catch (err) {}
};

export const canProceed = (fileUploadResponses = []) => {
  try {
    for (const fileUploadResponse of fileUploadResponses) {
      if (fileUploadResponse.id) {
        return true;
      }
    }
    return false;
  } catch (err) {
    return false;
  }
};

export const submitMultipleImageTags = async (
  dispatch = () => {},
  setLoading = () => {},
  fileUploadResponses = [],
  navigation = {},
  descriptions = '',
  tags = [],
  commonTags = [],
  piiTags = [],
  bountyTags = [],
) => {
  try {
    setLoading(true);
    if (fileUploadResponses && fileUploadResponses.length > 0) {
      for (const [index, fileUploadResponse] of fileUploadResponses.entries()) {
        const allTags = [
          ...(tags[index] || []),
          ...(commonTags || []),
          ...(piiTags[index] || []),
          ...(bountyTags[index] || []),
        ];
        if (fileUploadResponse && fileUploadResponse.id) {
          const res = await submitSingleImageTags(
            fileUploadResponse.id,
            descriptions[index],
            allTags,
          );
          if (!res) {
            dispatch({
              type: actions.SET_ALERT_SETTINGS,
              alertSettings: {
                show: true,
                type: 'error',
                title: 'Error Occured',
                message:
                  'This Operation Could Not Be Completed. Please Try Again Later.',
                showConfirmButton: true,
                confirmText: 'Ok',
              },
            });
            return;
          }
        }
      }
      dispatch({
        type: actions.SET_ALERT_SETTINGS,
        alertSettings: {
          show: false,
          type: 'success',
          title: 'Success!',
          message: 'Description & Tags Submitted',
          showConfirmButton: true,
          confirmText: 'Ok',
        },
      });
      navigation.navigate('LandingPage');
    }
  } catch (err) {
    dispatch({
      type: actions.SET_ALERT_SETTINGS,
      alertSettings: {
        show: true,
        type: 'error',
        title: 'Error Occured',
        message:
          'This Operation Could Not Be Completed. Please Try Again Later.',
        showConfirmButton: true,
        confirmText: 'Ok',
      },
    });
  } finally {
    setLoading(false);
  }
};

export const submitSingleImageTags = async (
  imageId = '',
  description = '',
  tags = [],
) => {
  try {
    const req = {
      image_id: imageId,
      description: description,
      tags: tags,
    };
    const result = await annotateImage(req);
    if (result && result.status && result.status === 'success') {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};
