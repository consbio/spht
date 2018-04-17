import React from 'react';
import SpeciesStep from '../containers/SpeciesStep';
import DistributionStep from '../containers/DistributionStep';
import ModelConditionsStep from '../containers/ModelConditionsStep';

//TODO: make all <p> entries below a tooltip window
const Tool = () =>
    <div className="tool">
        <h4 className="title is-3">Planning for the Future</h4>
        <p>
            The Species Potential Habitat Tool (SPHT) is designed to help forest managers identify species or vegetation
            types that are suitable for specific sites given various climate change scenarios. With this information,
            forest managers can promote the transition of forests to species compositions that are better adapted to
            future climates.
        </p>
        <div>&nbsp;</div>
        <SpeciesStep />
        <DistributionStep />
        <ModelConditionsStep />
        <h4 className="subtitle is-5"><span className="tag is-medium is-rounded">4</span> Download Results</h4>
        <p>
            The map shows current areas of species distribution and future areas with projected climactic
            conditions similar to current conditions. The overlap of the two represents predicted safe zones to
            promote species colonization.
        </p>
        <div>&nbsp;</div>
        {/*Does not align right*/}
        <a className="button is-right">Download</a>
        {/*<div className="columns"><div className="column is-one-quarter is-offset-three-quarter"><a className="button">Download</a></div></div>*/}
    </div>

export default Tool