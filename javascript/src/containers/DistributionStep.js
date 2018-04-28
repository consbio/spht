import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setDistribution } from "../actions/configuration"


class DistributionStep extends Component {
    render() {
        let distribution = this.props.distribution

        return(
            <div className="configuration-step">
                <h4 className="title is-5"><span className="badge">2</span> Select Species Distribution Record</h4>
                <div className="step-content">
                    <div className="select">
                        <select
                            value={distribution}
                            onChange={(e) => this.props.setDistribution(e.target.value)}>
                            <option value="1961_1990">1961 - 1990</option>
                            <option value="1981_2010">1981 - 2010</option>
                        </select>
                    </div>
                    <div>&nbsp;</div>
                </div>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ setDistribution }, dispatch)
}

const mapStateToProps = (state) => {
    let { distribution } = state.configuration
    return { distribution }
}

export default connect(mapStateToProps, mapDispatchToProps)(DistributionStep);