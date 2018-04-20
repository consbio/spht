import React from 'react'
import { connect } from 'react-redux'
import { setMapPoint } from '../actions/map'
import { Lethargy } from 'lethargy'
import L from 'leaflet'
import 'leaflet-basemaps'

/* This is a workaround for a webpack-leaflet incompatibility (https://github.com/PaulLeCam/react-leaflet/issues/255)w */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

    class Map extends React.Component {
    constructor(props) {
        super(props)

        this.mapNode = null
        this.map = null

        this.pointMarker = null
        this.numberOfLayersCurrently = 0
        this.layers = []
    }

    componentDidMount() {
        let lethargy = new Lethargy(7, 10, 0.05)  // Help minimize jumpy zoom with Apple mice and trackpads
        L.Map.ScrollWheelZoom.prototype._onWheelScroll = function(e) {
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
            maxZoom: 13
        })

        this.map.zoomControl.setPosition('topright')

        let basemapControl = L.control.basemaps({
            basemaps: [
                L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                }),
                L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                }),
                L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
	                attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
	                maxZoom: 13,
                    subdomains: ['server', 'services']
                }),
                L.tileLayer(
                    '//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                }),
                L.tileLayer(
                    '//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                })
            ],
            tileX: 0,
            tileY: 0,
            tileZ: 1,
            position: 'bottomleft'
        })
        this.map.addControl(basemapControl)

        this.map.on('click', e => {
            if (!e.latlng) {
                return
            }

            let { lng, lat } = e.latlng
            this.props.onSetPoint(lng, lat)
        })
    }

    updateLayerUrls(layers) {
        layers.forEach((layer, i) => {
            this.layers[i].setUrl(layer)
        })
    }

    updateMapLayers(layers) {
        let layersNeeded = layers.length - this.layers.length

        if (layersNeeded > 0) {
            let layersToAdd = this.layers.length + layersNeeded
            for (let i = this.layers.length; i < layersToAdd; i++) {
                console.log("layersi", layers[i])
                let layer = L.tileLayer(layers[i])
                layer.addTo(this.map)
                this.layers.push(layer)
            }
        } else if (layersNeeded < 0) {
            for (let i = 0; i < Math.abs(layersNeeded); i++) {
                let layer = this.layers.pop()
                this.map.removeLayer(layer)
            }
        }
        this.updateLayerUrls(layers)

    }



    updatePoint(point) {
        let pointIsValid = point !== null && point.x && point.y

        if (pointIsValid) {
            if (this.pointMarker === null) {
                console.log(this.state)
                this.pointMarker = L.marker([point.y, point.x]).addTo(this.map)
            }
            else {
                this.pointMarker.setLatLng([point.y, point.x])
            }
        }
        else if (this.pointMarker !== null) {
            this.map.removeLayer(this.pointMarker)
            this.pointMarker = null
        }
    }

    updateState() {
        let { point } = this.props

        this.updatePoint(point)
    }

    render() {
        this.updateState()
        this.updateMapLayers(this.props.layersToDisplay)

        return <div className="map-container">
            <div ref={input => {this.mapNode = input}} className="map-container"></div>
        </div>
    }
}

const mapStateToProps = (state) => {
    let { point } = state.map
    let configuration = state.configuration
    let createLayersToDisplay = (configuration) => {
        let layers = []
        let checkLayers = (c, latin) => {
            if (c.distribution === '1961_1990') {
                layers.push('/tiles/' + latin + '_p1961_1990_800m_pa/{z}/{x}/{y}.png')
            } else {
                layers.push('/tiles/' + latin + '_p1981_2010_800m_pa/{z}/{x}/{y}.png')
            }
            if (c.model.rcp45_2025) {
                layers.push('/tiles/' + latin + '_15gcm_rcp45_2025_pa/{z}/{x}/{y}.png')
            }
            if (c.model.rcp45_2055) {
                layers.push('/tiles/' + latin + '_15gcm_rcp45_2055_pa/{z}/{x}/{y}.png')
            }
            if (c.model.rcp45_2085) {
                layers.push('/tiles/' + latin + '_15gcm_rcp45_2085_pa/{z}/{x}/{y}.png')
            }
            if (c.model.rcp85_2025) {
                layers.push('/tiles/' + latin + '_15gcm_rcp85_2025_pa/{z}/{x}/{y}.png')
            }
            if (c.model.rcp85_2055) {
                layers.push('/tiles/' + latin + '_15gcm_rcp85_2055_pa/{z}/{x}/{y}.png')
            }
            if (c.model.rcp85_2085) {
                layers.push('/tiles/' + latin + '_15gcm_rcp85_2085_pa/{z}/{x}/{y}.png')
            }

        //    todo: refactor...
        //    c.model.foreach
        //   -or-
        //    for (model in c.model) {
        //     if (c.model[model]) {
        //    layers.push('/tiles/' + latin + '_15gcm_rcp85_2025_pa/{z}/{x}/{y}.png'...
        }

        switch(configuration.species) {
            case 'none':
                return [];
            case 'douglas-fir':
                checkLayers(configuration, 'psme')
                break;
            case 'lodgepole_pine':
                checkLayers(configuration, 'pico')
                break;
            case 'sitka_spruce':
                checkLayers(configuration, 'pisi')
                break;
            case 'ponderosa_pine':
                checkLayers(configuration, 'pipo')
                break;
            case 'engelmann_spruce':
                checkLayers(configuration, 'pien')
        }
        return layers
    }

    let layersToDisplay = createLayersToDisplay(configuration)

    return {
        point, layersToDisplay
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSetPoint: (x, y) => {
            dispatch(setMapPoint(x, y))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)
