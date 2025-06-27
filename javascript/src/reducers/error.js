import { SET_ERROR, CLEAR_ERROR } from '../actions/error'
import { morph } from '../utils'

const defaultState = {
  error: null,
  details: null,
  showModal: false,
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case SET_ERROR:
      return morph(state, {
        error: action.error,
        details: action.details,
        showModal: true,
      })

    case CLEAR_ERROR:
      return morph(state, { error: null, details: null, showModal: false })
  }

  return state
}
