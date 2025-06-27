import React from 'react'
import { connect } from 'react-redux'
import {
  setMapCenter,
  setMapZoom,
  setMapPoint,
  setBasemap,
} from '../../actions/map'
import { setLayerOpacity } from '../../actions/map'
import speciesLabels from '../../species'
import colors from '../../colors'
import { Lethargy } from 'lethargy'
import L from 'leaflet'
import 'leaflet-basemaps'
import 'leaflet-zoombox'
import 'leaflet-geonames/L.Control.Geonames'
import 'leaflet-range'
import 'leaflet-html-legend'
import HabitatLayer, { getColors } from './HabitatLayer'
import { getLayerURLs } from '../../utils'

/* This is a workaround for a webpack-leaflet incompatibility (https://github.com/PaulLeCam/react-leaflet/issues/255)w */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

class Map extends React.Component {
  constructor(props) {
    super(props)
    this.mapNode = null
    this.map = null
    this.mapIsMoving = false
    this.legendControl = null
    this.pointMarker = null
    this.previousUrls = []
    this.compositeLayer = null
    this.colorScheme = null
  }

  componentDidMount() {
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
      zoom: 4,
      center: [55.0, -112.0],
      minZoom: 3,
      maxZoom: 13,
    })

    this.map.on('moveend', (event) => {
      this.mapIsMoving = false
      setTimeout(
        function () {
          if (!this.mapIsMoving) {
            this.props.onMapMove(this.map.getCenter())
          }
        }.bind(this),
        1
      )
    })

    this.map.on('movestart', (event) => {
      this.mapIsMoving = true
    })

    this.map.on('zoomend', () => {
      this.props.onMapZoom(this.map.getZoom())
    })

    this.map.zoomControl.setPosition('topright')
    this.map.addControl(
      L.control.zoomBox({
        position: 'topright',
      })
    )

    let geonamesControl = L.control.geonames({
      position: 'topright',
      username: 'spht',
      showMarker: false,
      showPopup: false,
    })
    geonamesControl.on('select', ({ geoname }) => {
      let latlng = {
        lat: parseFloat(geoname.lat),
        lng: parseFloat(geoname.lng),
      }
      this.map.setView(latlng)
      this.map.fire('click', { latlng })
    })
    this.map.addControl(geonamesControl)

    let opacityControl = L.control.range({
      position: 'topright',
      min: 0,
      max: 1,
      value: 0.7,
      step: 0.01,
      orient: 'vertical',
    })
    opacityControl.on('input change', (e) => {
      this.props.onSetOpacity(parseFloat(e.value))
    })
    this.map.addControl(opacityControl)

    let basemapControl = L.control.basemaps({
      basemaps: [
        L.tileLayer(
          '//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 16,
            subdomains: ['server', 'services'],
          }
        ),
        L.tileLayer(
          '//{s}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 16,
            subdomains: ['server', 'services'],
          }
        ),
        L.tileLayer(
          '//{s}.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
          {
            attribution:
              'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
            maxZoom: 13,
            subdomains: ['server', 'services'],
          }
        ),
        L.tileLayer(
          '//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 16,
            subdomains: ['server', 'services'],
          }
        ),
        L.tileLayer(
          '//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 16,
            subdomains: ['server', 'services'],
          }
        ),
      ],
      tileX: 0,
      tileY: 0,
      tileZ: 1,
      position: 'bottomleft',
    })
    this.map.addControl(basemapControl)
    this.map.on('baselayerchange', (basemap) =>
      this.props.onBasemapChange(basemap)
    )

    this.legendControl = L.control.htmllegend({
      position: 'bottomright',
      disableVisibilityControls: true,
    })
    this.legendControl.addTo(this.map)

    this.map.on('click', (e) => {
      if (!e.latlng) {
        return
      }

      let { lng, lat } = e.latlng
      this.props.onSetPoint(lng, lat)
    })
  }

  updateMap(center, zoom) {
    if (this.map === null) {
      return
    }

    let mapCenter = this.map.getCenter()
    let mapZoom = this.map.getZoom()

    if (
      !this.mapIsMoving &&
      (mapCenter.lng !== center[0] || mapCenter.lat !== center[1])
    ) {
      this.map.setView(center, zoom)
    } else if (mapZoom !== zoom) {
      this.map.setZoom(zoom)
    }
  }

  updatePoint(point) {
    let pointIsValid = point !== null && point.x && point.y

    if (pointIsValid) {
      if (this.pointMarker === null) {
        this.pointMarker = L.marker([point.y, point.x]).addTo(this.map)
      } else {
        this.pointMarker.setLatLng([point.y, point.x])
      }
    } else if (this.pointMarker !== null) {
      this.map.removeLayer(this.pointMarker)
      this.pointMarker = null
    }
  }

  updateCompositeLayer(urls, colorScheme, opacity) {
    const isUnchanged =
      JSON.stringify(urls) === JSON.stringify(this.previousUrls) &&
      JSON.stringify(this.colorScheme) === JSON.stringify(colorScheme)

    if (isUnchanged) {
      return
    }

    this.previousUrls = urls
    this.colorScheme = colorScheme

    if (urls.length < 1 && this.compositeLayer !== null) {
      this.map.removeLayer(this.compositeLayer)
      this.compositeLayer = null
    } else if (urls.length > 0) {
      if (this.compositeLayer === null) {
        this.compositeLayer = new HabitatLayer(urls, colorScheme).addTo(
          this.map
        )
      } else {
        this.compositeLayer.setUrls(urls, colorScheme)
      }
      this.compositeLayer.setOpacity(opacity)
    }
  }

  updateOpacity() {
    if (this.compositeLayer !== null) {
      this.compositeLayer.setOpacity(this.props.layerOpacity)
    }
  }

  updateLegend(
    layersToDisplay,
    species,
    distribution,
    { single, kept, appeared }
  ) {
    if (this.legendControl === null) {
      return
    }

    let { options } = this.legendControl
    let { legends } = options

    if (!layersToDisplay.length && legends.length) {
      options.legends = []
      this.legendControl.render()
    } else if (layersToDisplay) {
      let legend = {
        name: speciesLabels[species],
        layer: this.compositeLayer,
        elements: [],
      }

      let layerCount = layersToDisplay.length
      let keptColors = getColors(kept, layerCount).map(
        (color) => 'rgb(' + color.join(',') + ')'
      )
      let addedColors = getColors(appeared, layerCount).map(
        (color) => 'rgb(' + color.join(',') + ')'
      )

      if (layerCount === 1) {
        legend.elements = [
          {
            html: `<div class="legend-square" style="background-color: ${keptColors[keptColors.length - 1]}"></div>`,
            label: distribution.replace('_', '-'),
          },
        ]
      } else if (layerCount > 1) {
        legend.elements[0] = {
          html: `<div class="legend-square" style="background-color: ${keptColors[0]}"></div>`,
          label: 'Habitat lost',
        }
        legend.elements.push(
          ...keptColors.slice(1).map((color, i) => {
            return {
              html: `<div class="legend-square" style="background-color: ${color}"></div>`,
              label: `Habitat kept (${i + 1} scenario${i > 0 ? 's' : ''})`,
            }
          })
        )
        legend.elements.push(
          ...addedColors.slice(1).map((color, i) => {
            return {
              html: `<div class="legend-square" style="background-color: ${color}"></div>`,
              label: `Habitat gained (${i + 1} scenario${i > 0 ? 's' : ''})`,
            }
          })
        )
      }

      if (legends.length === 0) {
        legends.push(legend)
        this.legendControl.render()
      } else {
        let oldLegend = legends[0]
        let isChanged =
          legend.name !== oldLegend.name ||
          JSON.stringify(legend.elements) !== JSON.stringify(oldLegend.elements)
        if (isChanged) {
          legends[0] = legend
          this.legendControl.render()
        } else if (oldLegend.layer !== legend.layer) {
          oldLegend.layer = legend.layer
          this.legendControl.render()
        }
      }
    }
  }

  updateState() {
    if (this.map === null) {
      return
    }

    let {
      center,
      zoom,
      point,
      layersToDisplay,
      species,
      distribution,
      colorScheme,
      layerOpacity,
    } = this.props
    this.updateMap(center, zoom)
    this.updatePoint(point)
    this.updateCompositeLayer(layersToDisplay, colorScheme, layerOpacity)
    this.updateOpacity()
    this.updateLegend(layersToDisplay, species, distribution, colorScheme)
  }

  render() {
    this.updateState()

    return (
      <div className="map-container">
        <div
          ref={(input) => {
            this.mapNode = input
          }}
          className="map-container"
        ></div>
      </div>
    )
  }
}

const mapStateToProps = ({ map, configuration, advanced }) => {
  let { center, zoom, point } = map
  let { species, distribution, model } = configuration
  let { layerOpacity } = map

  let layersToDisplay = getLayerURLs(species, distribution, model)

  return {
    center,
    zoom,
    point,
    layersToDisplay,
    layerOpacity,
    species,
    distribution,
    colorScheme: colors[advanced.colorScheme],
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSetPoint: (x, y) => {
      dispatch(setMapPoint(x, y))
    },
    onSetOpacity: (opacity) => {
      dispatch(setLayerOpacity(opacity))
    },
    onMapMove: (center) => {
      let { lat, lng } = center
      dispatch(setMapCenter([lat, lng]))
    },
    onMapZoom: (zoom) => {
      dispatch(setMapZoom(zoom))
    },
    onBasemapChange: ({ _url, options }) => {
      dispatch(setBasemap({ url: _url, options }))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)
