import { morph } from '../utils'
import { SET_MAP_POINT, SET_MAP_X, SET_MAP_Y } from '../actions/map'

const defaultState = {
    point: null
}

const map = (state = defaultState, action) => {
    let { point } = state
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
    }

    return state
}

export default map
