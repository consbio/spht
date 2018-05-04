import React from 'react'
import Map from '../containers/Map'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Modal from './Modal'

export default () => (
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
