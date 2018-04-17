import React, { Component } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { setSpecies } from "../actions/configuration"

class SpeciesStep extends Component {
    render() {
        let activeTab = this.props.species
        return(
        <div>
            <h4 className="title is-6">1. Select a Species</h4>
            <div className="tabs is-toggle is-small"
                 onClick={(e) => this.props.setSpecies(e.target.text)}
            >
                <ul>
                    <li className={activeTab === 'Gorilla' ? 'is-active' : null}><a>Gorilla</a></li>
                    <li className={activeTab === 'Bananas' ? 'is-active' : null}><a>Bananas</a></li>
                </ul>
            </div>
            <div>&nbsp;</div>
        </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ setSpecies }, dispatch);
}

function mapStateToProps(state) {
    return state
}

export default connect(mapStateToProps, mapDispatchToProps)(SpeciesStep);