import React from 'react'
import { connect } from 'react-redux'
import { setMapPoint } from '../actions/map'
import { setLayerOpacity } from '../actions/map'
import speciesLabels from '../species'
import colors from '../colors'
import { Lethargy } from 'lethargy'
import L from 'leaflet'
import 'leaflet-basemaps'
import 'leaflet-zoombox'
import 'leaflet-geonames/L.Control.Geonames'
import 'leaflet-range'
import 'leaflet-html-legend/src/L.Control.HtmlLegend'

/* This is a workaround for a webpack-leaflet incompatibility (https://github.com/PaulLeCam/react-leaflet/issues/255)w */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const getColors = (ramp, layerCount) => {
    let colors = [...Array(layerCount).keys()].map(i => ramp[Math.ceil(i*ramp.length/layerCount)])
    colors[colors.length-1] = ramp[ramp.length-1]
    return colors
}

const createDivLayer = (urls, { single, kept, appeared }) => L.GridLayer.extend({
    createTile: function (coords) {
        let tile = L.DomUtil.create('div', 'leaflet-tile')
        let size = this.getTileSize()
        let canvas = L.DomUtil.create('canvas', 'habitat-canvas', tile)
        canvas.width = size.x
        canvas.height = size.y

        let promises = urls.map(url => {
            return new Promise(resolve => {
                let img = new Image()
                img.onload = () => resolve(img)
                img.src = `${url}/${coords.z}/${coords.x}/${coords.y}.png`
            })
        })

        Promise.all(promises).then(images => {
            if (images.length === 1) {
                let c = canvas
                let ctx = c.getContext('2d')
                ctx.globalCompositeOperation = 'source-out'
                ctx.drawImage(images[0], 0, 0)
                ctx.globalCompositeOperation = 'source-atop'
                ctx.fillStyle = single
                ctx.fillRect(0, 0, c.width, c.height)
            }
            else if (images.length > 1) {
                let keptColors = getColors(kept, images.length)
                let addedColors = getColors(appeared, images.length)

                let source = images.shift()
                let ctx = canvas.getContext('2d')
                ctx.globalCompositeOperation = 'source-out'
                ctx.drawImage(source, 0, 0)
                ctx.globalCompositeOperation = 'source-atop'
                ctx.fillStyle = `rgb(${keptColors[0]})`
                ctx.fillRect(0, 0, size.x, size.y)
                let outputImageData = ctx.getImageData(0, 0, size.x, size.y)

                let sourceCanvas = document.createElement('canvas')
                sourceCanvas.width = size.x
                sourceCanvas.height = size.y
                let sourceCtx = sourceCanvas.getContext('2d')
                sourceCtx.globalCompositeOperation = 'source-over'
                sourceCtx.drawImage(source, 0, 0)
                let sourceData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data

                let layers = images.map(image => {
                    let canvas = document.createElement('canvas')
                    canvas.width = size.x
                    canvas.height = size.y
                    let ctx = canvas.getContext('2d')
                    ctx.globalCompositeOperation = 'source-over'
                    ctx.drawImage(image, 0, 0)
                    return [canvas, ctx.getImageData(0, 0, canvas.width, canvas.height).data]
                })

                let data = outputImageData.data

                for(let i = 3, len = data.length; i < len; i += 4) {
                    let colors
                    if (sourceData[i] > 0) {
                        colors = keptColors
                    }
                    else {
                        colors = addedColors
                    }

                    let count = 0
                    for (let j = 0; j < layers.length; j++) {
                        if (layers[j][1][i] > 0) {
                            count++
                        }
                    }

                    if (count > 0) {
                        data.set([...colors[count], 255], i-3)
                    }
                }

                ctx.putImageData(outputImageData, 0, 0)
            }
        }).catch(err => console.log(err))

        return tile
    }
})

class Map extends React.Component {
    constructor(props) {
        super(props)
        this.mapNode = null
        this.map = null
        this.legendControl = null
        this.pointMarker = null
        this.previousUrls = []
        this.compositeLayer = null
        this.colorScheme = null
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

        let opacityControl = L.control.range({
            position: 'topright',
            min: 0,
            max: 1,
            value: 0.70,
            step: .01,
            orient: 'vertical',
        })
        opacityControl.on('input change', (e) => {
            this.props.onSetOpacity(e.value)
        })
        this.map.addControl(opacityControl)

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

        this.legendControl = L.control.htmllegend({position: 'bottomright', disableVisibilityControls: true})
        this.legendControl.addTo(this.map)

        this.map.on('click', e => {
            if (!e.latlng) {
                return
            }

            let { lng, lat } = e.latlng
            this.props.onSetPoint(lng, lat)
        })
    }

    updatePoint(point) {
        let pointIsValid = point !== null && point.x && point.y

        if (pointIsValid) {
            if (this.pointMarker === null) {
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

    updateCompositeLayer(urls, colorScheme) {
        const isUnchanged = (
            urls.length === 0 || (JSON.stringify(urls) === JSON.stringify(this.previousUrls) &&
            this.colorScheme === colorScheme)
        )

        if (isUnchanged) {
            return
        }
        let DivLayer = createDivLayer(urls, colorScheme)
        if (this.compositeLayer != null) {
            this.map.removeLayer(this.compositeLayer)
        }
        this.previousUrls = urls
        this.compositeLayer = new DivLayer()
        this.map.addLayer(this.compositeLayer)
        this.compositeLayer.setOpacity(this.props.layerOpacity)
        this.colorScheme = colorScheme
    }

    updateOpacity() {
        if (this.compositeLayer !== null){
           this.compositeLayer.setOpacity(this.props.layerOpacity)
        }
    }

    updateLegend(layersToDisplay, species, distribution, {single, kept, appeared}) {
        if (this.legendControl === null) {
            return
        }

        let { options } = this.legendControl
        let { legends } = options

        if (!layersToDisplay.length && legends.length) {
            options.legends = []
            this.legendControl.render()
        }
        else if (layersToDisplay) {
            let legend ={
                name: speciesLabels[species],
                layer: this.compositeLayer,
                elements: []
            }

            let layerCount = layersToDisplay.length
            let keptColors = getColors(kept, layerCount).map(color => 'rgb(' + color.join(',') + ')')
            let addedColors = getColors(appeared, layerCount).map(color => 'rgb(' + color.join(',') + ')')

            if (layerCount === 1) {
                legend.elements = [{
                    html: `<div class="legend-square" style="background-color: ${keptColors[keptColors.length-1]}"></div>`,
                    label: distribution.replace('_', '-')
                }]
            }
            else if (layerCount > 1) {
                legend.elements[0] = {
                    html: `<div class="legend-square" style="background-color: ${keptColors[0]}"></div>`,
                    label: 'Habitat lost'
                }
                legend.elements.push(...keptColors.slice(1).map((color, i) => {
                    return {
                        html: `<div class="legend-square" style="background-color: ${color}"></div>`,
                        label: `Habitat kept (${i+1} scenario${i > 0 ? 's' : ''})`
                    }
                }))
                legend.elements.push(...addedColors.slice(1).map((color, i) => {
                   return {
                       html: `<div class="legend-square" style="background-color: ${color}"></div>`,
                       label: `Habitat gained (${i+1} scenario${i > 0 ? 's' : ''})`
                   }
                }))
            }

            if (legends.length === 0) {
                legends.push(legend)
                this.legendControl.render()
            }
            else {
                let oldLegend = legends[0]
                let isChanged = (
                    legend.name !== oldLegend.name ||
                    JSON.stringify(legend.elements) !== JSON.stringify(oldLegend.elements)
                )
                if (isChanged) {
                    legends[0] = legend
                    this.legendControl.render()
                }
                else if (oldLegend.layer !== legend.layer) {
                    oldLegend.layer = legend.layer
                    this.legendControl.render()
                }
            }

        }
    }

    updateState() {
        let { point, layersToDisplay, species, distribution, colorScheme } = this.props
        this.updatePoint(point)
        this.updateCompositeLayer(layersToDisplay, colorScheme)
        this.updateOpacity()
        this.updateLegend(layersToDisplay, species, distribution, colorScheme)
    }

    render() {
        this.updateState()

        return <div className="map-container">
            <div ref={input => {this.mapNode = input}} className="map-container"></div>
        </div>
    }
}


const mapStateToProps = ({ map, configuration, advanced }) => {
    let { point } = map
    let { species, distribution } = configuration

    let layersToDisplay = []
    let checkLayers = (c) => {
        if (c.species === "none") {
            return
        }
        layersToDisplay.push(`/tiles/${c.species}_p${c.distribution}_800m_pa`)
        Object.keys(c.model).forEach((rcp_year) => {
            if (c.model[rcp_year]) {
                layersToDisplay.push(`/tiles/${c.species}_15gcm_${rcp_year}_pa`)
            }
        })
    }
    checkLayers(configuration)

    let { layerOpacity } = map

    return {
        point,
        layersToDisplay,
        layerOpacity,
        species,
        distribution,
        colorScheme: colors[advanced.colorScheme]
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSetPoint: (x, y) => {
            dispatch(setMapPoint(x, y))
        },
        onSetOpacity: (opacity) => {
            dispatch(setLayerOpacity(opacity))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)
