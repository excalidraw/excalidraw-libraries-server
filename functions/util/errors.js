class RequestError extends Error {
  status;
  data;
  toObject() {
    return { name: this.name, status: this.status, message: this.message };
  }
  constructor({ message = "Something went wrong", status = 403, data } = {}) {
    super();
    this.name = "RequestError";
    this.message = message;
    this.status = status;
    this.data = data;
  }
}

module.exports.RequestError = RequestError;
