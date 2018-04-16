// const defaultConfiguration = {
//     species: null,
//     distribution: 'current',
//     climateModel: 'rcp8.5',
//     future: null
// }

// export default (state = defaultConfiguration, action) => {
//     let runConfiguration = () => {
//         switch(action.type) {
//             case 'SELECT_SPECIES':
//                 return Object.assign({}, state, action.species)
//         }
//     }
//
//     state = runConfiguration()
//
//     return state
// }


export const currentSpecies = (state = 'gorilla', action) => {
    switch (action.type) {
        case 'SELECT_SPECIES':
            return action.species
    }
    return state
}
