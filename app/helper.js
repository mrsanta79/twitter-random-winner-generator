module.exports = {
    response: function(success = false, data = null, message = null) {
        return {
            success: success,
            data: data === null || data.length < 1 ? null : data,
            message: message
        }
    }
}