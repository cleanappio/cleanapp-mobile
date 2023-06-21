export const validateEmail = (email) => {
  const re =
    /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validatePhoneNumber = (phoneNumber) => {
  const re = /^[3]{1}[0-9]{9}$/;
  return re.test(String(phoneNumber).toLowerCase());
};

export const validateCnic = (cnic) => {
  const re = /^[0-9]{5}[-]{1}[0-9]{7}[-]{1}[0-9]{1}$/;
  return re.test(String(cnic).toLowerCase());
};

export const validateZipCode = (zipcode) => {
  const re = /^[0-9]{5}$/;
  return re.test(String(zipcode).toLowerCase());
};
