const THRESHOlD = 70000000 as const

const calcFileSize = (bytes: number, decimals = 2) => {
    if (bytes >= THRESHOlD) return "false"
    if (bytes === 0) return "0 Bytes"

    const kilo = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const unit = Math.floor(Math.log(bytes) / Math.log(kilo))

    return `${(bytes / Math.pow(kilo, unit)).toFixed(dm)} ${sizes[unit]}`
}

export default calcFileSize
