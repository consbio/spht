export const SET_ERROR = 'SET_ERROR'
export const CLEAR_ERROR = 'CLEAR_ERROR'

export const setError = (error, details) => {
    return {
        type: SET_ERROR,
        error,
        details
    }
}

export const clearError = () => {
    return {
        type: CLEAR_ERROR
    }
}
