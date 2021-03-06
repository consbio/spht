import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setModel } from '../actions/configuration'
import { bindActionCreators } from 'redux'
import ReactTooltip from 'react-tooltip'


class ModelConditionsStep extends Component {
    render() {
        let model = this.props.model
        let onChange = input => { this.props.setModel(input) }

        return <div className="configuration-step">
            <h4 className="title is-5"><span className="badge">3</span>
                &nbsp;Select Modeling Conditions&nbsp;
                <span data-tip
                      data-for='modeling-info'
                      style={{'fontSize': '.8em'}}
                >
                    &#9432;
                </span>
            </h4>
            <div className="step-content">
                <ReactTooltip id="modeling-info" className="tooltip">
                    You can select one or more future time ranges
                    (it will overlay all selections on a single map)
                    as well as the modeling conditions to predict
                    future regions that will have climactic conditions
                    similar to the distribution you have selected.
                    RCP 4.5 is a more conservative estimate of future
                    CO2 levels than RCP 8.5.
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
                        <td>
                            <input onChange={(e) => onChange(e.target.value)}
                                   value="rcp45_2025"
                                   type="checkbox"
                                   checked={model.rcp45_2025}
                            />
                        </td>
                        <td>
                            <input onChange={(e) => onChange(e.target.value)}
                                   value="rcp85_2025"
                                   type="checkbox"
                                   checked={model.rcp85_2025}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>2041 - 2070</td>
                        <td>
                            <input onChange={(e) => onChange(e.target.value)}
                                   value="rcp45_2055"
                                   type="checkbox"
                                   checked={model.rcp45_2055}
                            />
                        </td>
                        <td>
                            <input onChange={(e) => onChange(e.target.value)}
                                   value="rcp85_2055"
                                   type="checkbox"
                                   checked={model.rcp85_2055}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>2071 - 2100</td>
                        <td>
                            <input onChange={(e) => onChange(e.target.value)}
                                   value="rcp45_2085"
                                   type="checkbox"
                                   checked={model.rcp45_2085}
                            />
                        </td>
                        <td>
                            <input onChange={(e) => onChange(e.target.value)}
                                   value="rcp85_2085"
                                   type="checkbox"
                                   checked={model.rcp85_2085}
                            />
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div>&nbsp;</div>
            </div>
        </div>
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ setModel }, dispatch)
}

const mapStateToProps = state => {
    let { model } = state.configuration
    return { model }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModelConditionsStep);