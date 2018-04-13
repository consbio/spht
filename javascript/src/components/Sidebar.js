import React, { Component } from 'react';
import Tool from './Tool'

class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {activeTab: "tool"}
    }
    render() {
        let activeTab = this.state.activeTab
        return (
            <div className="sidebar-inner">
                <div className="tabs is-boxed is-fullwidth">
                    <ul>
                        <li className={(activeTab === 'tool' ? 'is-active' : null) + ' is-hidden-tablet'}>
                            <a onClick={(e) => this.setState({activeTab: "tool"})}>Tool</a>
                        </li>
                        <li className={(activeTab === 'map' ? 'is-active' : null) + ' is-hidden-tablet'}>
                            <a onClick={(e) => this.setState({activeTab: "map"})}>Map</a>
                        </li>
                    </ul>
                </div>
                <div className={'tab-content ' + (activeTab === 'map' ? 'is-hidden-mobile' : '')}>
                    <Tool />
                </div>
            </div>
        )
    }
}




export default Sidebar