import React from 'react'
import { connect } from 'react-redux'
import colors from '../colors'
import { setColorScheme } from '../actions/advanced'

const makeColors = (colors) => {
  return colors.map((color) => {
    let backgroundColor
    if (color[0] === '#') {
      backgroundColor = color
    } else {
      let [red, green, blue] = color
      backgroundColor = `rgb(${red}, ${green}, ${blue})`
    }
    return (
      <div
        className="is-inline-block"
        style={{ width: '20px', height: '20px', backgroundColor }}
        key={JSON.stringify(color)}
      ></div>
    )
  })
}

const Advanced = ({ colorScheme, onSelectScheme }) => (
  <div>
    <h4 className="title is-5">Color Scheme</h4>
    {colors.map((scheme, i) => (
      <div style={{ marginBottom: '20px' }} key={'' + i}>
        <div
          className="is-inline-block"
          style={{ verticalAlign: 'middle', marginRight: '10px' }}
        >
          <input
            type="radio"
            checked={i === colorScheme}
            onChange={() => onSelectScheme(i)}
          ></input>
        </div>
        <div className="is-inline-block" style={{ verticalAlign: 'middle' }}>
          <div>{makeColors([scheme.single])}</div>
          <div>{makeColors(scheme.kept)}</div>
          <div>{makeColors(scheme.appeared.slice(1))}</div>
        </div>
      </div>
    ))}
  </div>
)

const mapStateToProps = ({ advanced }) => {
  return {
    colorScheme: advanced.colorScheme,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSelectScheme: (index) => dispatch(setColorScheme(index)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Advanced)
