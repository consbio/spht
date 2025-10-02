import React from 'react'
import PropTypes from 'prop-types'
import L from 'leaflet'
import { Lethargy } from 'lethargy'
import HabitatLayer from '../containers/Map/HabitatLayer'

class DownloadConfiguration extends React.Component {
  constructor(props) {
    super(props)
    this.mapNode = null
    this.map = null
    this.basemapLayer = null
    this.habitatLayer = null
  }

  refresh() {
    setTimeout(() => this.map.invalidateSize(), 1)

    let { center, zoom, urls, colorScheme, opacity } = this.props

    if (this.map) {
      this.map.setView(center, zoom)
    }

    if (this.habitatLayer) {
      this.habitatLayer.remove()
      this.habitatLayer = new HabitatLayer(urls, colorScheme).addTo(this.map)
      this.habitatLayer.setOpacity(opacity)
    }
  }

  getConfiguration() {
    let bounds = this.map.getBounds()

    return {
      bounds: [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
      zoom: this.map.getZoom(),
    }
  }

  componentDidMount() {
    let { center, zoom, basemap, urls, colorScheme, opacity } = this.props

    let lethargy = new Lethargy(7, 10, 0.05) // Help minimize jumpy zoom with Apple mice and trackpads
    L.Map.ScrollWheelZoom.prototype._onWheelScroll = function (e) {
      L.DomEvent.stop(e)

      if (lethargy.check(e) === false) {
        return
      }

      let delta = L.DomEvent.getWheelDelta(e)
      if (delta <= -0.25) delta = -0.25
      if (delta >= 0.25) delta = 0.25

      this._delta += delta
      this._lastMousePos = this._map.mouseEventToContainerPoint(e)

      this._performZoom()
    }

    this.map = L.map(this.mapNode, {
      center: center,
      zoom: zoom,
      minZoom: 3,
      maxZoom: 13,
    })

    this.map.zoomControl.setPosition('topright')
    this.basemapLayer = L.tileLayer(basemap.url, basemap.options).addTo(
      this.map
    )
    this.habitatLayer = new HabitatLayer(urls, colorScheme).addTo(this.map)
    this.habitatLayer.setOpacity(opacity)
  }

  componentDidUpdate(prevProps) {
    let { center, zoom, basemap, urls, colorScheme, opacity } = this.props

    if (
      center[0] !== prevProps.center[0] ||
      center[1] !== prevProps.center[1]
    ) {
      this.map.setView(center, zoom)
    }

    if (basemap.url !== prevProps.basemap.url) {
      this.basemapLayer.setUrl(basemap.url)
      L.setOptions(this.basemapLayer, basemap.options)
    }

    let habitatChanged =
      !urls.every((url, i) => url === prevProps.urls[i]) ||
      JSON.stringify(colorScheme) !== JSON.stringify(prevProps.colorScheme)
    if (habitatChanged) {
      this.habitatLayer.setUrls(urls, colorScheme)
    }

    if (opacity !== prevProps.opacity) {
      this.habitatLayer.setOpacity(opacity)
    }
  }

  render() {
    return (
      <div className="preview-map-container">
        <div
          ref={(input) => (this.mapNode = input)}
          className="preview-map"
        ></div>
      </div>
    )
  }
}

DownloadConfiguration.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  zoom: PropTypes.number.isRequired,
  basemap: PropTypes.shape({
    url: PropTypes.string.isRequired,
    options: PropTypes.object.isRequired,
  }).isRequired,
  urls: PropTypes.arrayOf(PropTypes.string).isRequired,
  colorScheme: PropTypes.shape({
    single: PropTypes.string.isRequired,
    kept: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    appeared: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  }).isRequired,
  opacity: PropTypes.number.isRequired,
}

export default DownloadConfiguration
