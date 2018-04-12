import React from 'react'


class Navbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isActive: false}
    }


    render() {
        let isActive = this.state.isActive ? 'is-active ' : ''

        return (
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
                    <a className="navbar-item" href="#">
                        People
                    </a>
                    <a className="navbar-item" href="#">
                        Source Code
                    </a>
                </div>
            </div>

        </div>
        )
    }
}

export default Navbar