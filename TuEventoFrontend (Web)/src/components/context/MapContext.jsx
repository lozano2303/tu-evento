import React, { createContext, useContext, useReducer } from "react";

const MapContext = createContext();

const initialState = {
  elements: [],
  selectedId: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_ELEMENTS":
      return { ...state, elements: action.payload };
    case "ADD_ELEMENT":
      return { ...state, elements: [...state.elements, action.payload] };
    case "UPDATE_ELEMENT":
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.payload.id ? { ...el, ...action.payload.props } : el
        ),
      };
    case "DELETE_ELEMENT":
      return {
        ...state,
        elements: state.elements.filter(el => el.id !== action.payload),
        selectedId: state.selectedId === action.payload ? null : state.selectedId,
      };
    case "SET_SELECTED":
      return { ...state, selectedId: action.payload };
    default:
      return state;
  }
}

export function MapProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <MapContext.Provider value={{ state, dispatch }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapState() {
  return useContext(MapContext).state;
}

export function useMapDispatch() {
  return useContext(MapContext).dispatch;
}
