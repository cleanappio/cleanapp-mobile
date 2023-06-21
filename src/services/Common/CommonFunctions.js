export const formatCurrency = (value) => {
  return `PKR ${parseFloat(value)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, '$&,')}/-`;
};

//calculate upload points cumulated formula
export const calcUploadsCumu = (value) => {
  return value * (20 / 1000000);
};

//calculate Annotation Desc cumulated points formula
export const calcAnnoDescCumu = (value) => {
  return (value * 2 * 20) / (2 * 3000000 + 7000000);
};

//calculate Annotation Tag cumulated points formula
export const calcAnnoTagCumu = (value) => {
  return (value * 20) / (2 * 3000000 + 7000000);
};

//calculate Verification cumulated points formula
export const calcVeriCumu = (value) => {
  return (value * 20) / (20 * (3000000 + 7000000));
};
