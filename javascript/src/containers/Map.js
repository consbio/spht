import React from 'react'
import { connect } from 'react-redux'
import { setMapPoint } from '../actions/map'
import { Lethargy } from 'lethargy'
import L from 'leaflet'
import 'leaflet-basemaps'
import 'leaflet-zoombox'
import 'leaflet-geonames/L.Control.Geonames'

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
        this.layers = []
        this.compositeLayer = null
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
        this.map.addControl(L.control.zoomBox({
            position: 'topright'
        }))

        let geonamesControl = L.control.geonames({
            position: 'topright',
            username: 'spht',
            showMarker: false,
            showPopup: false
        })
        geonamesControl.on('select', ({ geoname }) => {
            let latlng = {lat: parseFloat(geoname.lat), lng: parseFloat(geoname.lng)}
            this.map.setView(latlng);
            this.map.fire('click', {latlng})
        })
        this.map.addControl(geonamesControl)

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
            this.layers[i].setUrl(layer + '/{z}/{x}/{y}.png')
        })
    }

    updateMapLayers(layers) {
        let layersNeeded = layers.length - this.layers.length

        if (layersNeeded > 0) {
            let layersToAdd = this.layers.length + layersNeeded
            for (let i = this.layers.length; i < layersToAdd; i++) {
                let layer = L.tileLayer(layers[i], {opacity: 0.5})
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

    updateCompositeLayer(urls) {
        if ((urls.length === 0) && (this.compositeLayer !== null)) {
            this.map.removeLayer(this.compositeLayer)
            return
        } else if (urls.length === 0) {
            return
        }

        let tiles = new L.GridLayer()

        tiles.createTile = function(coords) {
            let tile = L.DomUtil.create('canvas', 'leaflet-tile')
            let ctx = tile.getContext('2d')
            let size = this.getTileSize()
            tile.width = size.x
            tile.height = size.y
            let color = "green"
            let loaded = 0
            let images = []

            urls.forEach((url) => {
                let img = new Image()
                img.onload = () => {
                    loaded += 1
                    if (loaded === urls.length){
                        images.forEach((image, i) => {
                            ctx.globalCompositeOperation = (i === 0 ? "source-out" : "source-in")
                            ctx.drawImage(image, 0, 0)
                        })
                        if (color) {
                            ctx.globalCompositeOperation = "source-atop" // color existing pixels
                            ctx.fillStyle = color
                            ctx.fillRect(0, 0, tile.width, tile.height)
                        }
                    }
                }
                img.src = `${url}/${coords.z}/${coords.x}/${coords.y}.png`
                images.push(img)
            })

            return tile
        }

        if (this.compositeLayer !== null) {
            this.map.removeLayer(this.compositeLayer)
        }
        this.compositeLayer = tiles
        this.map.addLayer(this.compositeLayer)
    }

    updateState() {
        let { point } = this.props

        this.updatePoint(point)
        this.updateMapLayers(this.props.layersToDisplay)
        this.updateCompositeLayer(this.props.layersToDisplay)
    }

    render() {
        this.updateState()

        return <div className="map-container">
            <div ref={input => {this.mapNode = input}} className="map-container"></div>
        </div>
    }
}

const mapStateToProps = ({ map, configuration }) => {
    let { point } = map
    let layersToDisplay = []
    let checkLayers = (c, latin) => {
        layersToDisplay.push('/tiles/' + latin + '_p' + c.distribution + '_800m_pa')
        Object.keys(c.model).forEach((rcp_year) => {
            if (c.model[rcp_year]) {
                layersToDisplay.push('/tiles/' + latin + '_15gcm_' + rcp_year + '_pa')
            }
        })
    }

    switch(configuration.species) {
        case 'none':
            break;
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

    return {
        point,
        layersToDisplay
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