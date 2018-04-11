import React from 'react'
import Map from './Map'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const App = () => (
    <div className="seedsource-app">
        <Navbar />

        <div className="columns is-gapless">
            <div className="column is-narrow sidebar">
                <Sidebar />
            </div>
            <div className="column map">
                <Map />
            </div>
        </div>
    </div>
)

export default App