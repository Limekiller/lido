export const getTimestampFromDuration = duration => {
    const hours = (Math.floor(duration / 3600)).toString()
    const minutes = (Math.floor(duration / 60) - (hours * 60)).toString()
    const seconds = Math.round(duration % 60).toString()
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, 0)}`
}

export const clientLibFunctions = {
    getTimestampFromDuration: getTimestampFromDuration
}