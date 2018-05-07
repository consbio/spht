export const SET_MAP_POINT = 'SET_MAP_POINT'
export const SET_MAP_Y = 'SET_MAP_Y'
export const SET_MAP_X = 'SET_MAP_X'
export const SET_LAYER_OPACITY = 'SET_LAYER_OPACITY'

export const setMapPoint = (x, y) => {
    return {
        type: SET_MAP_POINT,
        point: {x: x, y: y}
    }
}

export const setMapLat = y => {
    return {
        type: SET_MAP_Y,
        y: y
    }
}

export const setMapLon = x => {
    return {
        type: SET_MAP_X,
        x: x
    }
}

export const setLayerOpacity = input => {
    return {
        type: SET_LAYER_OPACITY,
        layerOpacity: input
    }
}
