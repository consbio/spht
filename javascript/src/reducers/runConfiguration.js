import { morph } from '../utils'

const defaultConfiguration = {
    species: "none",
    distribution: '1961_1990',
    model:  {   rcp45_2025: false,
                rcp85_2025: false,
                rcp45_2055: false,
                rcp85_2055: false,
                rcp45_2085: false,
                rcp85_2085: false
            }
}

const configuration = (state = defaultConfiguration, action) => {
    switch(action.type) {
        case 'SELECT_SPECIES':
            return morph(state, { species: action.species })
        case 'SELECT_DISTRIBUTION':
            return morph(state, { distribution: action.distribution })
        case 'SELECT_MODEL':
            switch (action.model) {
                case 'rcp45_2025':
                    return morph(state, { model: Object.assign(state.model, {rcp45_2025: !state.model.rcp45_2025}) })
                case 'rcp85_2025':
                    return morph(state, { model: Object.assign(state.model, {rcp85_2025: !state.model.rcp85_2025}) })
                case 'rcp45_2055':
                    return morph(state, { model: Object.assign(state.model, {rcp45_2055: !state.model.rcp45_2055}) })
                case 'rcp85_2055':
                    return morph(state, { model: Object.assign(state.model, {rcp85_2055: !state.model.rcp85_2055}) })
                case 'rcp45_2085':
                    return morph(state, { model: Object.assign(state.model, {rcp45_2085: !state.model.rcp45_2085}) })
                case 'rcp85_2085':
                    return morph(state, { model: Object.assign(state.model, {rcp85_2085: !state.model.rcp85_2085}) })
            }

    }

    return state
}

export default configuration
