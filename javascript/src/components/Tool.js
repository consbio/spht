import React from 'react';
import SpeciesStep from '../containers/SpeciesStep';
import DistributionStep from '../containers/DistributionStep';
import ModelConditionsStep from '../containers/ModelConditionsStep';

//TODO: make all <p> entries below a tooltip window
const Tool = () =>
    <div className="tool">
        <h4 className="title is-4">Planning for the Future</h4>
        <p>
            The Species Potential Habitat Tool (SPHT) is designed to help forest managers identify species or vegetation
            types that are suitable for specific sites given various climate change scenarios. With this information,
            forest managers can promote the transition of forests to species compositions that are better adapted to
            future climates.
        </p>
        <SpeciesStep />
        <DistributionStep />
        <ModelConditionsStep />
        <h4 className="title is-6">5. Download Results</h4>
        <p>
            The map shows current areas of species distribution and future areas with projected climactic
            conditions similar to current conditions. The overlap of the two would represent safe zones to
            promote species colonization.
        </p>
    </div>

export default Tool