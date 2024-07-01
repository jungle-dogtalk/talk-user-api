const { BAD_REQUEST } = require('../constants/errorCodes')

class BadRequestError extends Error {
  constructor(message) {
    super(message)
    this.type = 'BadRequestError'
    this.errorCode = BAD_REQUEST
  }
}

module.exports = BadRequestError;