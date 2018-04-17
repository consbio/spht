const defaultConfiguration = {
    species: null,
    distribution: '1981_2010',
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
            return Object.assign({}, state, { species: action.species })
        case 'SELECT_DISTRIBUTION':
            return Object.assign({}, state, { distribution: action.distribution })
        case 'SELECT_MODEL':
            switch (action.model) {
                case 'rcp45_2025':
                    return Object.assign({}, state, { model: Object.assign(state.model, {rcp45_2025: !state.model.rcp45_2025}) })
                case 'rcp85_2025':
                    return Object.assign({}, state, { model: Object.assign(state.model, {rcp85_2025: !state.model.rcp85_2025}) })
                case 'rcp45_2055':
                    return Object.assign({}, state, { model: Object.assign(state.model, {rcp45_2055: !state.model.rcp45_2055}) })
                case 'rcp85_2055':
                    return Object.assign({}, state, { model: Object.assign(state.model, {rcp85_2055: !state.model.rcp85_2055}) })
                case 'rcp45_2085':
                    return Object.assign({}, state, { model: Object.assign(state.model, {rcp45_2085: !state.model.rcp45_2085}) })
                case 'rcp85_2085':
                    return Object.assign({}, state, { model: Object.assign(state.model, {rcp85_2085: !state.model.rcp85_2085}) })
            }

    }

    return state
}

export default configuration
