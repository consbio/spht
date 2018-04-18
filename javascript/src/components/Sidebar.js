import React, { Component } from 'react';
import Tool from './Tool'
import About from './About'

class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {activeTab: "about"}
    }
    render() {
        let activeTab = this.state.activeTab
        return (
            <div className="sidebar-inner">
                <div className="tabs is-boxed is-fullwidth">
                    <ul>
                        <li className={activeTab === 'about' ? 'is-active' : null}>
                            <a onClick={(e) => this.setState({activeTab: "about"})}>About</a>
                        </li>
                        <li className={activeTab === 'tool' ? 'is-active' : (activeTab === 'map' ? 'is-active-tablet' : null)}>
                            <a onClick={(e) => this.setState({activeTab: "tool"})}>Tool</a>
                        </li>
                        <li className={(activeTab === 'map' ? 'is-active' : null) + ' is-hidden-tablet'}>
                            <a onClick={(e) => this.setState({activeTab: "map"})}>Map</a>
                        </li>
                    </ul>
                </div>
                <div className={'tab-content ' + (activeTab !== 'about' ? 'is-hidden' : '')}>
                    <About />
                </div>
                <div className={
                    'tab-content ' + (activeTab === 'map' ? 'is-hidden-mobile' : activeTab !== 'tool' ? 'is-hidden' : '')
                }>
                    <Tool />
                </div>
            </div>
        )
    }
}




export default Sidebar