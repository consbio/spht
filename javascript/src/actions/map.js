export const SET_MAP_CENTER = 'SET_MAP_CENTER'
export const SET_MAP_ZOOM = 'SET_MAP_ZOOM'
export const SET_MAP_POINT = 'SET_MAP_POINT'
export const SET_MAP_Y = 'SET_MAP_Y'
export const SET_MAP_X = 'SET_MAP_X'
export const SET_LAYER_OPACITY = 'SET_LAYER_OPACITY'
export const SET_BASEMAP = 'SET_BASEMAP'

export const setMapCenter = (center) => {
  return {
    type: SET_MAP_CENTER,
    center,
  }
}

export const setMapZoom = (zoom) => {
  return {
    type: SET_MAP_ZOOM,
    zoom,
  }
}

export const setMapPoint = (x, y) => {
  return {
    type: SET_MAP_POINT,
    point: { x: x, y: y },
  }
}

export const setMapLat = (y) => {
  return {
    type: SET_MAP_Y,
    y: y,
  }
}

export const setMapLon = (x) => {
  return {
    type: SET_MAP_X,
    x: x,
  }
}

export const setLayerOpacity = (input) => {
  return {
    type: SET_LAYER_OPACITY,
    layerOpacity: input,
  }
}

export const setBasemap = (basemap) => {
  return {
    type: SET_BASEMAP,
    basemap,
  }
}
