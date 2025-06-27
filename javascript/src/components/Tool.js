import React from 'react'
import SpeciesStep from '../containers/SpeciesStep'
import DistributionStep from '../containers/DistributionStep'
import ModelConditionsStep from '../containers/ModelConditionsStep'
import DownloadStep from '../containers/DownloadStep'

const Tool = () => (
  <div>
    <SpeciesStep />
    <DistributionStep />
    <ModelConditionsStep />
    <DownloadStep />
  </div>
)

export default Tool
