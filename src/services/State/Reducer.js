export const actions = {
  SET_USER: 'SET_USER',
  SET_ALERT_SETTINGS: 'SET_ALERT_SETTINGS',
  SET_PROGRESS_SETTINGS: 'SET_PROGRESS_SETTINGS',
  SET_OVERALL: 'SET_OVERALL',
  SET_SHOW_VIDEOCALL_MODAL: 'SET_SHOW_VIDEOCALL_MODAL',
  SET_APPOINTMENT_BOOKED: 'SET_APPOINTMENT_BOOKED',
  SET_NEW_MESSAGE: 'SET_NEW_MESSAGE',
  SET_AUTH_TOKEN: 'SET_AUTH_TOKEN',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_DATAUSAGE: 'SET_DATAUSAGE',
  SET_VERIFYSETTING: 'SET_VERIFYSETTING',
  SET_SHOW_LANDING_PAGE_WALKTHROUGH: 'SET_SHOW_LANDING_PAGE_WALKTHROUGH',
  SET_SHOW_UPLOAD_IMAGE_WALKTHROUGH: 'SET_SHOW_UPLOAD_IMAGE_WALKTHROUGH',
  SET_SHOW_VERIFY_IMAGE_WALKTHROUGH: 'SET_SHOW_VERIFY_IMAGE_WALKTHROUGH',
  SET_SHOW_ANNOTATE_IMAGE_WALKTHROUGH: 'SET_SHOW_ANNOTATE_IMAGE_WALKTHROUGH',
  SET_WALKTHROUGH_CURRENT_STEP: 'SET_WALKTHROUGH_CURRENT_STEP',
  EXIT_WALKTHROUGH: 'EXIT_WALKTHROUGH',
  SET_CURRENCYSETTING: 'SET_CURRENCYSETTING',
  SET_CAMERA_ACTION: 'SET_CAMERA_ACTION',
  SET_USER_LOCATION: 'SET_USER_LOCATION',
  SET_FAB_SHOW: 'SET_FAB_SHOW',
  SET_CACHE_VAULT: 'SET_CACHE_VAULT',
  SET_MAP_LOCATION: 'SET_MAP_LOCATION',
  SET_REPORTS: 'SET_REPORTS',
  SET_GUILDS: 'SET_GUILDS',
  SET_PLAYERS: 'SET_PLAYERS',
};

export const reducer = (state, action) => {
  switch (action.type) {
    case actions.SET_USER:
      return {
        ...state,
        user: action.user,
      };
    case actions.SET_PROGRESS_SETTINGS: {
      return {
        ...state,
        progressSettings: {show: action.show, promise: null},
      };
    }
    case actions.SET_OVERALL: {
      return {
        ...state,
        overall: {promise: null},
      };
    }
    case actions.SET_ALERT_SETTINGS:
      return {
        ...state,
        alertSettings: {settings: action.alertSettings, promise: null},
      };
    case actions.SET_SHOW_VIDEOCALL_MODAL:
      return {
        ...state,
        showVideoCallModal: action.showVideoCallModal,
      };
    case actions.SET_APPOINTMENT_BOOKED:
      return {
        ...state,
        appointmentBooked: action.appointmentBooked,
      };
    case actions.SET_NEW_MESSAGE:
      return {
        ...state,
        newMessage: action.newMessage,
      };
    case actions.SET_AUTH_TOKEN:
      return {
        ...state,
        authInfo: action.authInfo,
      };
    case actions.SET_LANGUAGE:
      return {
        ...state,
        selectedLanguage: action.selectedLanguage,
      };
    case actions.SET_DATAUSAGE:
      return {
        ...state,
        dataUsageSettings: action.dataUsageSettings,
      };
    case actions.SET_VERIFYSETTING:
      return {
        ...state,
        verifySettings: action.verifySettings,
      };
    case actions.SET_SHOW_LANDING_PAGE_WALKTHROUGH:
      return {
        ...state,
        showLandingPageWalkthrough: true,
      };
    case actions.SET_SHOW_UPLOAD_IMAGE_WALKTHROUGH:
      return {
        ...state,
        showUploadImagePageWalkthrough: true,
      };
    case actions.SET_SHOW_VERIFY_IMAGE_WALKTHROUGH:
      return {
        ...state,
        showVerifyImagePageWalkthrough: true,
      };
    case actions.SET_SHOW_ANNOTATE_IMAGE_WALKTHROUGH:
      return {
        ...state,
        showAnnotateImagePageWalkthrough: true,
      };
    case actions.SET_WALKTHROUGH_CURRENT_STEP:
      return {
        ...state,
        walkthroughCurrentStep: action.walkthroughCurrentStep,
      };
    case actions.EXIT_WALKTHROUGH:
      return {
        ...state,
        showLandingPageWalkthrough: false,
        showUploadImagePageWalkthrough: false,
        showVerifyImagePageWalkthrough: false,
        showAnnotateImagePageWalkthrough: false,
        walkthroughCurrentStep: 0,
      };

    case actions.SET_CURRENCYSETTING:
      return {
        ...state,
        currencySettings: action.currencySettings,
      };

    case actions.SET_CAMERA_ACTION:
      return {
        ...state,
        cameraAction: action.cameraAction,
      };

    case actions.SET_USER_LOCATION:
      return {
        ...state,
        userLocation: action.userLocation,
      };

    case actions.SET_FAB_SHOW:
      return {
        ...state,
        fabShow: action.fabShow,
      };
    case actions.SET_CACHE_VAULT:
      return {
        ...state,
        cacheVault: action.cacheVault,
      };

    case actions.SET_MAP_LOCATION:
      return {
        ...state,
        mapLocation: action.mapLocation,
      };

    case actions.SET_REPORTS:
      return {
        ...state,
        reports: action.reports,
      };

    case actions.SET_GUILDS:
      return {
        ...state,
        guilds: action.guilds,
      };

    case actions.SET_PLAYERS:
      return {
        ...state,
        players: action.players,
      };

    default:
      return state;
  }
};
