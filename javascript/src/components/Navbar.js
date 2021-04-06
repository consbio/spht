import React from 'react'
import ModalCard from './ModalCard'
import fs_logo from '../../images/fs_logo.png'
import osu_logo from '../../images/osu_logo.png'
import cbi_logo from '../../images/cbi_logo.png'
import nw_climate_hub_logo from '../../images/nw_climate_hub_logo.png'


class Navbar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isActive: false,
            modal: null,
        }
    }

    render() {
        let { modal } = this.state
        let isActive = this.state.isActive ? 'is-active ' : ''

        return (
            <div>
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
                            <ModalCard
                                open={modal === 'people'}
                                title="People"
                                onClose={() => this.setState({modal: null})}
                            >
                                <div>
                                    <section className="modal-card-body">
                                        <p>
                                            The Species Habitat Potential Tool is a collaboration between the US
                                            Forest Service, Oregon State University, and the Conservation Biology
                                            Institute. Initial conceptualization and development was done by Glenn
                                            Howe at Oregon State University College of Forestry and Brad St.Clair at
                                            the USFS Pacific Northwest Research Station, with considerable input from
                                            Ron Beloin while he was working at Oregon State University. The
                                            Conservation Biology Institute was brought onboard to bring the project to
                                            fruition through their expertise in web site design and programming for
                                            spatial applications. Personnel at the Conservation Biology Institute
                                            include Dominique Bachelet (project co-PI), Nikolas Stevenson-Molnar
                                            (tool developer), and Brendan Ward (project manager).
                                        </p>
                                        <p>
                                            Initial funding for the Species Habitat Potential Tool came from the US
                                            Forest Service Washington Office. Subsequent funding came from the USFS
                                            Pacific Northwest Research Station, Oregon State University, Conservation
                                            Biology Institute, the USDA Northwest Climate Hub, and Natural Resources
                                            Canada.
                                        </p>
                                        <p>&nbsp;</p>
                                        <p className="columns">
                                            <a className="column" href="http://www.fs.fed.us/" target="_blank">
                                                <img src={fs_logo} alt="Forest Service"/>
                                            </a>
                                            <a className="column" href="http://oregonstate.edu/" target="_blank">
                                                <img src={osu_logo} alt="Oregon State University"/>
                                            </a>
                                            <span>&nbsp;</span>
                                            <a className="column" href="http://consbio.org" target="_blank">
                                                <img src={cbi_logo} alt="Conservation Biology Institute"/>
                                            </a>
                                            <span>&nbsp;</span>
                                            <a className="column is-half" href="https://www.climatehubs.oce.usda.gov/northwest" target="_blank">
                                                <img src={nw_climate_hub_logo} alt="NW Climate Hub"/>
                                            </a>
                                        </p>
                                        <p>&nbsp;</p>
                                        <h4 className="title is-4">Contact Information</h4>
                                        <p>
                                            Dr. Glenn Howe – Co-Principal Investigator<br/>
                                            Associate Professor, Department of Forest Ecosystems and Society<br/>
                                            Oregon State University, Corvallis, Oregon, USA<br/>
                                            <a href="mailto:glenn.howe@oregonstate.edu">glenn.howe@oregonstate.edu</a>
                                        </p>
                                        <br/>
                                        <p>
                                            Dr. Brad St.Clair – Co-Principal Investigator<br/>
                                            Research Geneticist, Pacific Northwest Research Station<br/>
                                            USDA Forest Service, Corvallis, Oregon, USA<br/>
                                            <a href="mailto:bstclair@fs.fed.us">bstclair@fs.fed.us</a>
                                        </p>
                                        <br/>
                                        <p>
                                            Nikolas Stevenson-Molnar – Tool Developer<br/>
                                            Software Engineer<br/>
                                            Conservation Biology Institute, Corvallis, Oregon, USA<br/>
                                            <a href="mailto:nik.molnar@consbio.org">nik.molnar@consbio.org</a>
                                        </p>
                                        <br/>
                                        <p>
                                            Ken Ferschweiler – Tool Developer<br/>
                                            Senior Software Architect, Modeler<br/>
                                            Conservation Biology Institute, Corvallis, Oregon, USA<br/>
                                            <a href="mailto:ken@consbio.org">ken@consbio.org</a>
                                        </p>
                                        <br/>
                                        <p>
                                            Bill Klinkow – Tool Developer<br/>
                                            Software Engineer<br/>
                                            Conservation Biology Institute, Corvallis, Oregon, USA<br/>
                                            <a href="mailto:bill.klinkow@consbio.org">bill.klinkow@consbio.org</a>
                                        </p>
                                        <br/>
                                        <p>
                                            Brendan Ward – Project Manager<br/>
                                            Conservation Biologist/GIS Analyst/Software Engineer<br/>
                                            Conservation Biology Institute, Corvallis, Oregon, USA<br/>
                                            <a href="mailto:bcward@consbio.org">bcward@consbio.org</a>
                                        </p>
                                    </section>
                                </div>
                            </ModalCard>

                            <a
                                className="navbar-item"
                                onClick={() => this.setState({ modal: 'people' })}
                            >
                                People
                            </a>
                            <a className="navbar-item" href="https://github.com/consbio/spht/">
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
