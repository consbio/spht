import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import ModalCard from '../components/ModalCard'
import DownloadConfiguration from '../components/DownloadConfiguration'
import colors from '../colors'
import { getLayerURLs } from '../utils'
import { createReport } from '../actions/report'

class DownloadStep extends Component {
  constructor(props) {
    super(props)
    this.config = null
    this.state = { showModal: false }
  }

  render() {
    let { map, configuration, advanced, isFetching, errorModal, onSubmit } =
      this.props
    let { showModal } = this.state
    let { center, zoom, basemap, layerOpacity } = map
    let { colorScheme } = advanced
    let { species, distribution, model } = configuration

    return (
      <div className="configuration-step">
        <h4 className="title is-5">
          <span className="badge">4</span> Download{' '}
          <span data-tip data-for="download-info" style={{ fontSize: '.8em' }}>
            &#9432;
          </span>
        </h4>
        <div className="step-content">
          <ReactTooltip id="download-info" className="tooltip">
            The map shows current areas of species distribution and future areas
            with projected climactic conditions similar to current conditions.
            The overlap of the two represents predicted safe zones to promote
            species colonization.
          </ReactTooltip>
          <em>Download results to a pdf</em>
          <div>&nbsp;</div>
          <button
            disabled={species === null}
            className="button"
            onClick={() => {
              this.setState({ showModal: true })
              this.config.refresh()
            }}
          >
            Download
          </button>
          <div>&nbsp;</div>
        </div>
        <ModalCard
          open={showModal && !errorModal}
          title="Download PDF"
          disabled={isFetching}
          onClose={() => this.setState({ showModal: false })}
          onSubmit={() => onSubmit(this.config.getConfiguration())}
          submitLabel="Download PDF"
          className="pdf-preview"
        >
          {isFetching ? (
            <div className="pageloader is-active">
              <span className="title">Creating report...</span>
            </div>
          ) : null}
          {species === null || isFetching ? null : (
            <DownloadConfiguration
              ref={(input) => (this.config = input)}
              open={showModal}
              center={center}
              zoom={zoom}
              basemap={basemap}
              urls={getLayerURLs(species, distribution, model)}
              colorScheme={colors[colorScheme]}
              opacity={layerOpacity}
            />
          )}
        </ModalCard>
      </div>
    )
  }
}

const mapStateToProps = ({ map, configuration, advanced, report, error }) => {
  return {
    map,
    configuration,
    advanced,
    isFetching: report.reportIsFetching,
    errorModal: error.showModal,
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onSubmit: (mapConfig) => (_, getState) => {
        let { map, advanced, configuration } = getState()
        let { bounds, zoom } = mapConfig
        let { basemap, layerOpacity } = map
        let { colorScheme } = advanced
        let { species, distribution, model } = configuration
        dispatch(
          createReport(
            bounds,
            zoom,
            basemap.url,
            colors[colorScheme],
            species,
            distribution,
            Object.keys(model).filter((item) => model[item]),
            layerOpacity
          )
        )
      },
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(DownloadStep)
