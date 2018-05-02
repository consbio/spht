import React from 'react'
import Modal from './Modal'


class Navbar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {isActive: false}
        this.state = { modal: "none" }
    }

    render() {
        let isActive = this.state.isActive ? 'is-active ' : ''

        return (
            <div>
                <div className={"modal" + (this.state.modal !== "none" ? " is-active" : "")}>
                    <Modal onClose={() => this.setState({modal: "none"})} modalContent={ this.state.modal }/>
                </div>

                <div className="navbar is-dark" role="navigation" aria-label="main navigation">
                    <div className="navbar-brand">
                        <a className="navbar-item is-size-4 has-text-weight-bold" href="#">
                            Species Potential Habitat Tool
                        </a>
                        <a role="button"
                           className={isActive + "navbar-burger"}
                           aria-label="menu"
                           aria-expanded="false"
                           onClick={e => {
                               this.setState({isActive: !this.state.isActive})
                        }}>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    </div>
                    <div className={isActive + "navbar-menu"}>
                        <div className="navbar-end">
                            <a
                                className="navbar-item"
                                href="#"
                                onClick={() => this.setState({ modal: "people" })}
                            >
                                People
                            </a>
                            <a className="navbar-item" href="#">
                                Source Code
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Navbar