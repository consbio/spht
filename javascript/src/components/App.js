import React, { Component } from 'react'
import Map from '../containers/Map'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import People from'./People'

class App extends Component {
    constructor(props){
        super(props)
        this.state = { modal: "none" }
    }
    render() {
        return (
            <div className="spht-app">
                <div className={"modal" + (this.state.modal !== "none" ? " is-active" : "")}>
                    <People onClose={() => this.setState({modal: "none"})}/>
                </div>
                <Navbar onTabSelect={(modal) => {this.setState({modal})}}/>
                <div className="columns is-gapless">
                    <div className="column is-narrow sidebar">
                        <Sidebar/>
                    </div>
                    <div className="column map">
                        <Map/>
                    </div>
                </div>
            </div>
        )
    }
}


export default App
