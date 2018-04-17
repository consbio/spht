import React, { Component } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { setDistribution } from "../actions/configuration"

class DistributionStep extends Component {
    render() {
        return(
            <div>
                <h4 className="subtitle is-5"><span className="tag is-medium is-rounded">2</span> Select Species Distribution Record</h4>
                <div className="select">
                    <select
                        value={this.props.configuration.distribution}
                        onChange={(e) => this.props.setDistribution(e.target.value)}>
                        <option value="1961_1990">1961 - 1990</option>
                        <option value="1981_2010">1981 - 2010</option>
                    </select>
                </div>
                <div>&nbsp;</div>
                <div>&nbsp;</div>
            </div>

        )
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({ setDistribution }, dispatch)
}

function mapStateToProps(state) {
    return state
}

export default connect(mapStateToProps, mapDispatchToProps)(DistributionStep);