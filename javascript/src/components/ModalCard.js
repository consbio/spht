import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

class ModalCard extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        let {
            open, title, disabled = false, children, onClose, onSubmit = null, submitLabel = 'Submit',
            cancelLabel = 'Cancel', className = ''
        } = this.props

        return ReactDOM.createPortal(
            <div className={`modal ${open ? 'is-active' : ''} ${className}`}>
                <div className="modal-background">
                </div>
                <div className="modal-card">
                    <div className="modal-card-head">
                        <p className="modal-card-title">{ title }</p>
                        <button className="delete" aria-label="close" onClick={() => onClose()}></button>
                    </div>
                    <div className="modal-card-body">
                        { children }
                    </div>
                    {
                        onSubmit === null ? null :
                        <div className="modal-card-foot justify-right">
                            <button className="button" onClick={() => onClose()}>{ cancelLabel }</button>
                            <button disabled={disabled} className="button is-primary" onClick={() => onSubmit()}>{ submitLabel }</button>
                        </div>
                    }
                </div>
            </div>,
            window.document.body
        )
    }
}

ModalCard.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    submitLabel: PropTypes.string
}

export default ModalCard
