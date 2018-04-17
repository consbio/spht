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
                <h4 className="title is-6">3. Select Future Time Range and Modeling Conditions</h4>
                <p>You can select one or more future time ranges (it will overlay all selections on a single map) as
                    well as the modeling conditions to project future regions that will have climactic conditions
                    similar to today. RCP 4.5 is a more conservative estimate of future CO2 levels than RCP 8.5.</p>
                <table>
                    <tbody>
                      <tr>
                        <th></th>
                        <th>RCP 4.5</th>
                        <th>RCP 8.5</th>
                      </tr>
                      <tr>
                        <th>2025</th>
                        <td><input onChange={(e) => onInputSelect(e)} value="rcp45_2025" type="checkbox"
                                   checked={this.props.configuration.model.rcp45_2025}/></td>
                        <td><input onChange={(e) => onInputSelect(e)} value="rcp85_2025" type="checkbox"
                                   checked={this.props.configuration.model.rcp85_2025}/></td>
                      </tr>
                      <tr>
                        <th>2055</th>
                        <td><input onChange={(e) => onInputSelect(e)} value="rcp45_2055" type="checkbox"
                                   checked={this.props.configuration.model.rcp45_2055}/></td>
                        <td><input onChange={(e) => onInputSelect(e)} value="rcp85_2055" type="checkbox"
                                   checked={this.props.configuration.model.rcp85_2055}/></td>
                      </tr>
                      <tr>
                        <th>2085</th>
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