import React, { Component } from 'react';


class ModelConditionsStep extends Component {
    constructor (props) {
        super(props)
    }

    render() {
        return (
            <div>
                <h4 className="title is-6">3. Select Future Time Range and Modeling Conditions</h4>
                <p>You can select one or more future time ranges (it will overlay all selections on a single map) as
                    well as the modeling conditions to project future regions that will have climactic conditions
                    similar to today. RCP 4.5 is a more conservative estimate of future CO2 levels than RCP 8.5.</p>
            </div>
        )
    }
}


export default ModelConditionsStep;