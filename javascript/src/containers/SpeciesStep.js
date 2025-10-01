import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setSpecies } from '../actions/configuration'

class SpeciesStep extends Component {
  render() {
    let species = this.props.species
    return (
      <div className="configuration-step">
        <h4 className="title is-5">
          <span className="badge">1</span> Select Species
        </h4>
        <div className="step-content">
          <div className="select">
            <select
              value={species || 'none'}
              onChange={(e) => {
                let value = e.target.value
                if (value === 'none') {
                  value = null
                }
                this.props.onChange(value)
              }}
            >
              <option value="none">Select</option>
              <option value="pinucon">Lodgepole pine</option>
              <option value="pseumen">Douglas-fir</option>
              <option value="picesit">Sitka spruce</option>
              <option value="pinupon">Ponderosa pine</option>
              <option value="piceeng">Engelmann spruce</option>
              <option value="lariocc">Western larch</option>
              <option value="pinumon">Western white pine</option>
              <option value="tsughet">Western hemlock</option>
            </select>
          </div>
        </div>
        <div>&nbsp;</div>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ onChange: setSpecies }, dispatch)
}

const mapStateToProps = (state) => {
  let { species } = state.configuration
  return { species }
}

export default connect(mapStateToProps, mapDispatchToProps)(SpeciesStep)
