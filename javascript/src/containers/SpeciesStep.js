import React, { Component } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { setSpecies } from "../actions/configuration"

class SpeciesStep extends Component {
    constructor (props) {
        super(props)
        this.onInputChange = this.onInputChange.bind(this)
    }

    onInputChange(e) {
        this.props.setSpecies({ species: e.target.text })
    }

    render() {
        return(
        <div>
            <h4 className="title is-6">1. Select a Species</h4>
            <div className="tabs is-toggle is-small">
                <ul>
                    <li onClick={this.onInputChange}><a>Gorilla</a></li>
                    <li onClick={this.onInputChange}><a>Bananas</a></li>
                </ul>
            </div>
            <p>{this.props.species.species}</p>
        </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setSpecies }, dispatch);
}

function mapStateToProps({ species }) {
    return { species }
}

export default connect(mapStateToProps, mapDispatchToProps)(SpeciesStep);