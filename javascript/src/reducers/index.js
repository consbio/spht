import { createStore, combineReducers } from 'redux'
import map from './map'
import configuration from './runConfiguration'
import advanced from './advanced'

export default createStore(combineReducers({
    map,
    configuration,
    advanced
}))
