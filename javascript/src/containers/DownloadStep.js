import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'


class DownloadStep extends Component {
    render() {
        return (
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
        )
    }
}

export default DownloadStep
