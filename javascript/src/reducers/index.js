import { combineReducers } from 'redux'
import map from './map'
import configuration from './runConfiguration'
import advanced from './advanced'
import report from './report'
import error from './error'

export default combineReducers({
  map,
  configuration,
  advanced,
  report,
  error,
})
