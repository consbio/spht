import { morph } from '../utils'

// lariocc_cna_v750_8gcms_ssp370_2041_2070_10x_crop_500.nc

const defaultConfiguration = {
  species: null,
  distribution: '1961_1990',
  model: {
    ssp370_2011_2040: false,
    ssp585_2011_2040: false,
    ssp370_2041_2070: false,
    ssp585_2041_2070: false,
    ssp370_2071_2100: false,
    ssp585_2071_2100: false,
  },
}

const configuration = (state = defaultConfiguration, action) => {
  switch (action.type) {
    case 'SELECT_SPECIES':
      return morph(state, { species: action.species })
    case 'SELECT_DISTRIBUTION':
      return morph(state, { distribution: action.distribution })
    case 'SELECT_MODEL':
      switch (action.model) {
        case 'ssp370_2011_2040':
          return morph(state, {
            model: morph(state.model, {
              ssp370_2011_2040: !state.model.ssp370_2011_2040,
            }),
          })
        case 'ssp585_2011_2040':
          return morph(state, {
            model: morph(state.model, {
              ssp585_2011_2040: !state.model.ssp585_2011_2040,
            }),
          })
        case 'ssp370_2041_2070':
          return morph(state, {
            model: morph(state.model, {
              ssp370_2041_2070: !state.model.ssp370_2041_2070,
            }),
          })
        case 'ssp585_2041_2070':
          return morph(state, {
            model: morph(state.model, {
              ssp585_2041_2070: !state.model.ssp585_2041_2070,
            }),
          })
        case 'ssp370_2071_2100':
          return morph(state, {
            model: morph(state.model, {
              ssp370_2071_2100: !state.model.ssp370_2071_2100,
            }),
          })
        case 'ssp585_2071_2100':
          return morph(state, {
            model: morph(state.model, {
              ssp585_2071_2100: !state.model.ssp585_2071_2100,
            }),
          })
      }
  }

  return state
}

export default configuration
