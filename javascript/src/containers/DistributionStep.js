import React, { Component } from 'react';


class DistributionStep extends Component {
    constructor (props) {
        super(props)
    }

    render() {
        return(
            <div>
                <h4 className="title is-6">2. Select Species Distribution Record</h4>
                <p>You can select current or historic species distributions.</p>
            </div>
        )
    }
}


export default DistributionStep;