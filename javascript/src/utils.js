/* A shortcut for Object.assign({}, obj, props) */
export const morph = (obj, props = {}) => Object.assign({}, obj, props)

export const getLayerURLs = (species, distribution, model) => {
  if (species === null) {
    return []
  }

  const cropDistance = species === 'pinupon' ? '50' : '500'

  return [
    `/tiles/${species}_cna_v750_normal_${distribution}_10x_crop_${cropDistance}`,
  ].concat(
    Object.keys(model)
      .filter((item) => model[item])
      .map(
        (item) =>
          `/tiles/${species}_cna_v750_8gcms_${item}_10x_crop_${cropDistance}`
      )
  )
}

export const getCookies = () => {
  let cookies = {}

  document.cookie.split(';').forEach((item) => {
    let [name, value] = item.trim().split('=')
    cookies[name] = decodeURIComponent(value)
  })

  return cookies
}

export const rgbToHex = (rgb) => {
  return `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}
