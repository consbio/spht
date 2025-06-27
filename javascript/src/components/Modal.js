import React, { Component } from 'react'

class Modal extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let { children } = this.props
    return (
      <div>
        <div
          className="modal-background"
          onClick={() => this.props.onClose()}
        ></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">People</p>
            <button
              className="delete"
              aria-label="close"
              onClick={() => this.props.onClose()}
            ></button>
          </header>
          {children}
          <footer className="modal-card-foot"></footer>
        </div>
      </div>
    )
  }
}

export default Modal
