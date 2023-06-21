const actionTypes = {
  WEB3_INITIALIZED: 'WEB3_INITIALIZED',
  UPDATE_ACCOUNT: 'UPDATE_ACCOUNT',
  UPDATE_SEEDPHRASE: 'UPDATE_SEEDPHRASE',
};

export const web3Initialized = (results) => {
  return {
    type: actionTypes.WEB3_INITIALIZED,
    payload: results,
  };
};

export const STPupdateAccounts = (account0) => (dispatch) => {
  dispatch({
    type: actionTypes.UPDATE_ACCOUNT,
    payload: account0,
  });
};

export const STPupdateSeedPhrase = (seedPhrase) => (dispatch) => {
  dispatch({
    type: actionTypes.UPDATE_SEEDPHRASE,
    payload: seedPhrase,
  });
};
