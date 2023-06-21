import PropTypes from 'prop-types';
import React, {createContext, useContext, useReducer} from 'react';

export const StateContext = createContext();
export const StateProvider = ({reducer, initialState, children}) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);
StateProvider.propTypes = {
  reducer: PropTypes.func.isRequired,
  initialState: PropTypes.object.isRequired,
  children: PropTypes.node,
};
export const useStateValue = () => useContext(StateContext);
