/* A shortcut for Object.assign({}, obj, props) */
export const morph = (obj, props = {}) => Object.assign({}, obj, props)

export const getLayerURLs = (species, distribution, model) => {
    if (species === null) {
        return []
    }

    return [`/tiles/${species}_p${distribution}_800m_pa`].concat(
        Object.keys(model).filter(item => model[item]).map(item => `/tiles/${species}_15gcm_${item}_pa`)
    )
}

export const getCookies = () => {
    let cookies = {}

    document.cookie.split(';').forEach(item => {
        let [name, value] = item.trim().split('=')
        cookies[name] = decodeURIComponent(value)
    })

    return cookies
}

export const rgbToHex = (rgb) => {
    return `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`
}
