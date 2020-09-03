module.exports = {
    response: function (success = false, data = null, message = null) {
        return {
            success: success,
            data: data === null || data.length < 1 ? null : data,
            message: message
        }
    },
    generateRandomWinners: function (data, maxItem = 1) {
        if (!Array.isArray(data)) {
            throw new Error('Provided data is not an array');
        }
        if (typeof (maxItem) !== 'number') {
            throw new Error('Maximum number should be an integer value');
        }

        const shuffled = data.sort(function() {
            return .5 - Math.random();
        });

        return shuffled.slice(0, maxItem);
    }
}