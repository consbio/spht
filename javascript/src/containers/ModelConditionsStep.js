import React, { Component } from 'react';
import {connect} from "react-redux";
import {setModel} from "../actions/configuration";
import {bindActionCreators} from "redux";


class ModelConditionsStep extends Component {
    render() {
        let onInputSelect = (e) => {
            this.props.setModel(e.target.value)
        }
        return (
            <div>
                <h4 className="subtitle is-5"><span className="tag is-medium is-rounded">3</span> Select Future Time Range and Modeling Conditions</h4>
                <p>You can select one or more future time ranges (it will overlay all selections on a single map) as
                    well as the modeling conditions to project future regions that will have climactic conditions
                    similar to the distribution you have selected. RCP 4.5 is a more conservative estimate of future
                    CO2 levels than RCP 8.5.</p>
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
                                   checked={this.props.configuration.model.rcp45_2025}/></td>
                        <td><input onChange={(e) => onInputSelect(e)} value="rcp85_2025" type="checkbox"
                                   checked={this.props.configuration.model.rcp85_2025}/></td>
                      </tr>
                      <tr>
                        <td>2041 - 2070</td>
                        <td><input onChange={(e) => onInputSelect(e)} value="rcp45_2055" type="checkbox"
                                   checked={this.props.configuration.model.rcp45_2055}/></td>
                        <td><input onChange={(e) => onInputSelect(e)} value="rcp85_2055" type="checkbox"
                                   checked={this.props.configuration.model.rcp85_2055}/></td>
                      </tr>
                      <tr>
                        <td>2071 - 2100</td>
                        <td><input onChange={(e) => onInputSelect(e)} value="rcp45_2085" type="checkbox"
                                   checked={this.props.configuration.model.rcp45_2085}/></td>
                        <td><input onChange={(e) => onInputSelect(e)} value="rcp85_2085" type="checkbox"
                                   checked={this.props.configuration.model.rcp85_2085}/></td>
                      </tr>
                    </tbody>
                </table>
                <div>&nbsp;</div>
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