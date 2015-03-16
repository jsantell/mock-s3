var util = require("util");
var EventEmitter = require("events").EventEmitter;
var when = require("when");
var ReadableStreamBuffer = require("stream-buffers").ReadableStreamBuffer;
var validate = require("./validation");
var utils = require("./utils");
var UPLOAD_METHODS = ["putObject", "uploadPart"];

function Request (s3, methodName, fn, options) {
  this.s3 = s3;
  this.methodName = methodName;
  this.options = options;
  this.fn = fn;
  this._process = this._process.bind(this);
  this._success = this._success.bind(this);
  this._fail = this._fail.bind(this);

  this._validate().then(this._process).then(this._success, this._fail);
}

util.inherits(Request, EventEmitter);
module.exports = Request;

Request.prototype.createReadStream = function () {
  if (this.methodName !== "getObject") {
    throw new Error("Request.createReadStream() not supported for methods other than getObject for mock-s3.");
  }
  this.stream = new ReadableStreamBuffer();
  return this.stream;
};

Request.prototype._getFile = function () {
  return this.s3._buckets[this.options.Bucket].getFile(this.options);
};

Request.prototype._validate = function () {
  return validate(this.s3, this.methodName, this.options);
};

Request.prototype._process = function () {
  var req = this;
  var delay = ~UPLOAD_METHODS.indexOf(this.methodName) ? this.s3.UPLOAD_DELAY : this.s3.DELAY;

  // Emit dummy events used by some S3 libs
  if (this.methodName === "getObject") {
    req.emit("httpHeaders", 200, { "content-length": this._getFile().getData().length, "content-type": "application/binary" });
  }

  return when.try(this.fn.bind(this.s3), this.options).then(function (result) {
    return when(result).delay(delay);
  });
};

Request.prototype._success = function (result) {
  this._result = utils.decorateResponse(result);
  this.emit("success", this._result);
  this.emit("complete", this._result);
 
  // If someone is streaming via createReadStream, start pushing data
  if (this.stream) {
    this.stream.put(this._getFile().getData());
    this.stream.destroySoon();
  }
};

Request.prototype._fail = function (err) {
  this.emit("error", err);
  this.emit("complete", null);
};
