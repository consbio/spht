import { FETCH_REPORT, RECEIVE_REPORT } from '../actions/report'
import { morph } from '../utils'

const defaultState = {
  reportIsFetching: false,
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_REPORT:
      return morph(state, { reportIsFetching: true })

    case RECEIVE_REPORT:
      return morph(state, { reportIsFetching: false })
  }

  return state
}
