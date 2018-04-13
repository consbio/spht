import React from 'react'

export default () => (
    <div>
        <h4>Planning for the Future</h4>
        <img src="../../images/hands.jpg" className="aboutImage" />
        <p>
            The Species Potential Habitat Tool (SPHT) is designed to help forest managers identify species or vegetation
            types that are suitable for specific sites given various climate change scenarios. With this information,
            forest managers can promote the transition of forests to species compositions that are better adapted to
            future climates.
        </p>
        <div>&nbsp;</div>
        <div>
            <div className="aboutStep">
                <img src="../../images/about_objective.gif" />
                <h4>1. Select Species</h4>
                <p>
                    You can select a species to plan for
                </p>
            </div>
            <div className="aboutStep">
                <img src="../../images/about_location.gif" />
                <h4>2. Select Time Range(s)</h4>
                <p>
                    You can select historic or current species distributions to display on map.
                </p>
            </div>
            <div className="aboutStep">
                <img src="../../images/about_climate.gif" />
                <h4>3. Select Future Time Range and Modeling Conditions</h4>
                <p>
                    You can select one or more future time ranges (it will overlay all selections on a single map) as
                    well as the modeling conditions to project future regions that will have climactic conditions
                    similar to today. RCP 4.5 is a more conservative estimate of future CO2 levels than RCP 8.5.
                </p>
            </div>
            <div className="aboutStep">
                <img src="../../images/about_map.gif" />
                <h4>4. Map your Results</h4>
                <p>
                    The map shows current areas of species distribution and future areas with projected climactic
                    conditions similar to current conditions. The overlap of the two would represent safe zones to
                    promote species colonization.
                </p>
            </div>
            <div className="aboutStep">
                <img src="../../images/about_method.gif" />
                <h4>5. Download Results</h4>
                <p>
                    You can download the results as a PDF.
                </p>
            </div>
        </div>

        <div>&nbsp;</div>
    </div>
)
