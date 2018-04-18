import React from 'react';
import SpeciesStep from '../containers/SpeciesStep';
import DistributionStep from '../containers/DistributionStep';
import ModelConditionsStep from '../containers/ModelConditionsStep';
import ReactTooltip from 'react-tooltip';

const Tool = () =>
    <div>
        <SpeciesStep />
        <DistributionStep />
        <ModelConditionsStep />
        <div className="configuration-step">
            <h4 className="title is-5"><span className="badge">4</span> Download <span data-tip data-for='download-info' style={{'fontSize': '.8em'}}>&#9432;</span></h4>
            <div className="step-content">
                <ReactTooltip id='download-info'>
                    <p>The map shows current areas of species distribution </p>
                    <p>and future areas with projected climactic conditions </p>
                    <p>similar to current conditions. The overlap of the two</p>
                    <p>represents predicted safe zones to promote species </p>
                    <p>colonization.</p>
                </ReactTooltip>
                <em>Download results to a pdf</em>
                <div>&nbsp;</div>
                <a className="button">Download</a>
                <div>&nbsp;</div>
            </div>
        </div>
    </div>

export default Tool