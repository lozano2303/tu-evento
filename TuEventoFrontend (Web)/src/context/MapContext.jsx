"use client"

import { createContext, useContext, useReducer } from "react"

const MapStateContext = createContext()
const MapDispatchContext = createContext()

const mapReducer = (state, action) => {
  switch (action.type) {
    case "SET_ELEMENTS":
      return { ...state, elements: action.payload }
    case "SET_SELECTED":
      return { ...state, selectedId: action.payload }
    default:
      return state
  }
}

export const MapProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mapReducer, {
    elements: [],
    selectedId: null,
  })

  return (
    <MapStateContext.Provider value={state}>
      <MapDispatchContext.Provider value={dispatch}>{children}</MapDispatchContext.Provider>
    </MapStateContext.Provider>
  )
}

export const useMapState = () => {
  const context = useContext(MapStateContext)
  if (!context) {
    throw new Error("useMapState must be used within MapProvider")
  }
  return context
}

export const useMapDispatch = () => {
  const context = useContext(MapDispatchContext)
  if (!context) {
    throw new Error("useMapDispatch must be used within MapProvider")
  }
  return context
}
