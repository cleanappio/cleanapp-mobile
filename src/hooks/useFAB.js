import {useStateValue} from '../services/State/State';
import {actions} from '../services/State/Reducer';

export const useFAB = () => {
  try {
    const [{fabShow}, dispatch] = useStateValue();

    const showFAB = () => {
      dispatch({
        type: actions.SET_FAB_SHOW,
        fabShow: true,
      });
    };

    const hideFAB = () => {
      dispatch({
        type: actions.SET_FAB_SHOW,
        fabShow: false,
      });
    };

    const toggleFAB = () => {
      dispatch({
        type: actions.SET_FAB_SHOW,
        fabShow: !fabShow,
      });
    };

    return {
      fabShow,
      showFAB,
      hideFAB,
      toggleFAB,
    };
  } catch (error) {
    console.error('Error in useFAB hook:', error);
    // Return default values if there's an error
    return {
      fabShow: false,
      showFAB: () => {},
      hideFAB: () => {},
      toggleFAB: () => {},
    };
  }
};
