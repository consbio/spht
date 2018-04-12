import React from 'react';
import About from './About'
import Tool from './Tool'

class Sidebar extends React.Component {
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
                            <a onClick={(e) => this.setState({activeTab: "about"})}>About
                            </a>
                        </li>
                        <li className={activeTab === 'tool' ? 'is-active' : null}>
                            <a onClick={(e) => this.setState({activeTab: "tool"})}>Tool</a>
                        </li>
                    </ul>
                </div>
                <div className={'tab-content ' + (activeTab !== 'about' ? 'is-hidden' : '')}>
                    <About />
                </div>
                <div className={'tab-content ' + (activeTab !== 'tool' ? 'is-hidden' : '')}>
                    <Tool />
                </div>
            </div>





        )


    }
}




export default Sidebar