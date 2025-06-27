import React from 'react'
import { connect } from 'react-redux'
import { clearError } from '../actions/error'
import ModalCard from '../components/ModalCard'

class ErrorModal extends React.Component {
  render() {
    let { error, details, showModal, onClose } = this.props

    return (
      <ModalCard open={showModal} title="Error" onClose={() => onClose()}>
        <p>
          <strong>{error}</strong>
        </p>
        <p>&nbsp;</p>
        {details === null ? null : (
          <div>
            <p>
              If the problem persists, please{' '}
              <a href="https://github.com/consbio/spht/issues" target="_blank">
                report an issue
              </a>{' '}
              and include the following information:
            </p>
            <pre className="error-debug-info">{details}</pre>
          </div>
        )}
      </ModalCard>
    )
  }
}

const mapStateToProps = ({ error: state }) => {
  let { error, details, showModal } = state
  return { error, details, showModal }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onClose: () => dispatch(clearError()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorModal)
