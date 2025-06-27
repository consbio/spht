import { morph } from '../utils'
import { SET_COLOR_SCHEME } from '../actions/advanced'

const defaultState = {
  colorScheme: 0,
}

const advanced = (state = defaultState, action) => {
  switch (action.type) {
    case SET_COLOR_SCHEME:
      return morph(state, { colorScheme: action.index })
  }

  return state
}

export default advanced
