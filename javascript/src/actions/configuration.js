export function setSpecies(input) {
  return {
    type: 'SELECT_SPECIES',
    species: input,
  }
}

export function setDistribution(input) {
  return {
    type: 'SELECT_DISTRIBUTION',
    distribution: input,
  }
}

export function setModel(input) {
  return {
    type: 'SELECT_MODEL',
    model: input,
  }
}
