import React from 'react'
import Map from '../containers/Map'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import ErrorModal from '../containers/ErrorModal'

export default () => (
    <div className="spht-app">
        <Navbar/>
        <ErrorModal/>
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
