import React, { Component } from 'react'
import Map from '../containers/Map'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import People from './Modal'

class App extends Component {
    render() {
        return (
            <div className="spht-app">
                <Navbar/>
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
