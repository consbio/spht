import { createStore, combineReducers } from 'redux'
import map from './map'
import { currentSpecies } from './runConfiguration'

export default createStore(combineReducers({
    map,
    species: currentSpecies
}))
