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
