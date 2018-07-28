import { executeGPTask } from '../io'
import { rgbToHex } from '../utils'
import { setError } from './error'

export const FETCH_REPORT = 'FETCH_REPORT'
export const RECEIVE_REPORT = 'RECEIVE_REPORT'

export const fetchReport = () => {
    return {
        type: FETCH_REPORT
    }
}

export const receiveReport = () => {
    return {
        type: RECEIVE_REPORT
    }
}

export const createReport = (bounds, zoom, basemap, colorScheme, species, historic, futures, opacity) => {
    return dispatch => {
        dispatch(fetchReport())
        let inputs = {
            bounds,
            zoom,
            basemap,
            single_color: colorScheme.single,
            kept_colors: colorScheme.kept.map(rgb => rgbToHex(rgb)),
            gained_colors: colorScheme.appeared.map(rgb => rgbToHex(rgb)),
            species,
            historic,
            futures,
            opacity
        }

        executeGPTask('create_report', inputs)
            .then(json => JSON.parse(json.outputs))
            .then(outputs => {
                window.location = outputs.url
                dispatch(receiveReport())
            })
            .catch(error => {
                dispatch(receiveReport())
                dispatch(setError('Could not create report.', JSON.stringify(inputs, null, 2)))
                console.error(error)
            })
    }
}
