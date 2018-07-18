import "leaflet"

const L = window.L

export const getColors = (ramp, layerCount) => {
    let colors = [...Array(layerCount).keys()].map(i => ramp[Math.ceil(i*ramp.length/layerCount)])
    colors[colors.length-1] = ramp[ramp.length-1]
    return colors
}

const HabitatLayer = L.GridLayer.extend({
    urls: [],
    colorScheme: null,

    initialize: function(urls, colorScheme) {
        this.urls = urls
        this.colorScheme = colorScheme
    },

    setUrls: function(urls, colorScheme) {
        this.urls = urls
        this.colorScheme = colorScheme || this.colorScheme
        this.redraw()
    },

    createTile: function (coords, done) {
        let tile = L.DomUtil.create('div', 'leaflet-tile')
        let size = this.getTileSize()
        let canvas = L.DomUtil.create('canvas', 'habitat-canvas', tile)
        canvas.width = size.x
        canvas.height = size.y

        let { single, kept, appeared } = this.colorScheme

        let promises = this.urls.map(url => {
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
            done(null, tile)
        }).catch(err => console.log(err))

        return tile
    }
})

export default HabitatLayer
