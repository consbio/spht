import React, { Component } from 'react';
import {connect} from "react-redux";
import {setModel} from "../actions/configuration";
import {bindActionCreators} from "redux";
import ReactTooltip from 'react-tooltip';


class ModelConditionsStep extends Component {
    render() {
        let onInputSelect = (e) => {
            this.props.setModel(e.target.value)
        }
        let model = this.props.configuration.model

        return (
            <div className="configuration-step">
                <h4 className="title is-5"><span className="badge">3</span> Select Modeling Conditions <span data-tip data-for='modeling-info' style={{'fontSize': '.8em'}}>&#9432;</span></h4>
                <div className="step-content">
                    <ReactTooltip id='modeling-info'>
                        <p>You can select one or more future time ranges</p>
                        <p>(it will overlay all selections on a single map)</p>
                        <p>as well as the modeling conditions to predict</p>
                        <p>future regions that will have climactic conditions</p>
                        <p>similar to the distribution you have selected.</p>
                        <p>RCP 4.5 is a more conservative estimate of future</p>
                        <p>CO2 levels than RCP 8.5.</p>
                    </ReactTooltip>
                    <em>Select a future time range and a model</em>
                    <div>&nbsp;</div>
                    <table className="table is-fullwidth modeling-table">
                        <tbody>
                          <tr>
                            <td></td>
                            <td>RCP 4.5</td>
                            <td>RCP 8.5</td>
                          </tr>
                          <tr>
                            <td>2011 - 2040</td>
                            <td><input onChange={(e) => onInputSelect(e)} value="rcp45_2025" type="checkbox"
                                       checked={model.rcp45_2025}/></td>
                            <td><input onChange={(e) => onInputSelect(e)} value="rcp85_2025" type="checkbox"
                                       checked={model.rcp85_2025}/></td>
                          </tr>
                          <tr>
                            <td>2041 - 2070</td>
                            <td><input onChange={(e) => onInputSelect(e)} value="rcp45_2055" type="checkbox"
                                       checked={model.rcp45_2055}/></td>
                            <td><input onChange={(e) => onInputSelect(e)} value="rcp85_2055" type="checkbox"
                                       checked={model.rcp85_2055}/></td>
                          </tr>
                          <tr>
                            <td>2071 - 2100</td>
                            <td><input onChange={(e) => onInputSelect(e)} value="rcp45_2085" type="checkbox"
                                       checked={model.rcp45_2085}/></td>
                            <td><input onChange={(e) => onInputSelect(e)} value="rcp85_2085" type="checkbox"
                                       checked={model.rcp85_2085}/></td>
                          </tr>
                        </tbody>
                    </table>
                    <div>&nbsp;</div>
                </div>
            </div>

        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ setModel }, dispatch);
}

function mapStateToProps(state) {
    return state
}

export default connect(mapStateToProps, mapDispatchToProps)(ModelConditionsStep);