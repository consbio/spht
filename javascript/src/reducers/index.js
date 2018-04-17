import { createStore, combineReducers } from 'redux'
import map from './map'
import configuration from './runConfiguration'

export default createStore(combineReducers({
    map,
    configuration
}))
