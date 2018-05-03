import { morph } from '../utils'
import { SET_MAP_POINT, SET_MAP_X, SET_MAP_Y, SET_LAYER_OPACITY } from '../actions/map'

const defaultState = {
    point: null,
    layerOpacity: 0.70
}

const map = (state = defaultState, action) => {
    let { point } = state
    let { layerOpacity } = state
    if (point === null) {
        point = {x: null, y: null}
    }

    switch (action.type) {
        case SET_MAP_POINT:
            return morph(state, {point: action.point})

        case SET_MAP_X:
            return morph(state, {point: morph(point, {x: action.x})})

        case SET_MAP_Y:
            return morph(state, {point: morph(point, {y: action.y})})

        case SET_LAYER_OPACITY:
            return morph(state, {layerOpacity: action.layerOpacity})
    }

    return state
}

export default map
