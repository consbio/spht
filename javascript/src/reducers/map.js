import { morph } from '../utils'
import {
  SET_MAP_CENTER,
  SET_MAP_ZOOM,
  SET_MAP_POINT,
  SET_MAP_X,
  SET_MAP_Y,
  SET_LAYER_OPACITY,
  SET_BASEMAP,
} from '../actions/map'

const defaultState = {
  center: [55.0, -112.0],
  zoom: 4,
  point: null,
  layerOpacity: 0.7,
  basemap: {
    url: '//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    options: {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16,
      subdomains: ['server', 'services'],
    },
  },
}

const map = (state = defaultState, action) => {
  let { point } = state
  if (point === null) {
    point = { x: null, y: null }
  }

  switch (action.type) {
    case SET_MAP_CENTER:
      return morph(state, { center: action.center })

    case SET_MAP_ZOOM:
      return morph(state, { zoom: action.zoom })

    case SET_MAP_POINT:
      return morph(state, { point: action.point })

    case SET_MAP_X:
      return morph(state, { point: morph(point, { x: action.x }) })

    case SET_MAP_Y:
      return morph(state, { point: morph(point, { y: action.y }) })

    case SET_LAYER_OPACITY:
      return morph(state, { layerOpacity: action.layerOpacity })

    case SET_BASEMAP:
      return morph(state, { basemap: action.basemap })
  }

  return state
}

export default map
