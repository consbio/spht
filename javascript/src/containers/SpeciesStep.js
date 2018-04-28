import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setSpecies } from "../actions/configuration"


class SpeciesStep extends Component {
    render() {
        let species = this.props.species
        return(
            <div className="configuration-step">
                <h4 className="title is-5"><span className="badge">1</span> Select Species</h4>
                <div className="step-content">
                    <div className="select">
                        <select
                            value={species}
                            onChange={(e) => this.props.onChange(e.target.value)}
                        >
                            <option value="none">Select</option>
                            <option value="lodgepole_pine">Lodgepole Pine</option>
                            <option value="douglas-fir">Douglas-fir</option>
                            <option value="sitka_spruce">Sitka Spruce</option>
                            <option value="ponderosa_pine">Ponderosa Pine</option>
                            <option value="engelmann_spruce">Engelmann Spruce</option>
                        </select>
                    </div>
                </div>
                <div>&nbsp;</div>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ onChange: setSpecies }, dispatch);
}

const mapStateToProps = state => {
    let { species } = state.configuration
    return { species }
}

export default connect(mapStateToProps, mapDispatchToProps)(SpeciesStep);