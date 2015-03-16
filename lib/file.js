var crypto = require("crypto");
var utils = require("./utils");
var Request = require("./request");

/**
 * Creates a new file for mock-s3.
 * @class
 */

function File (ops) {
  this._data = utils.copy(ops);
  this._updateBody();
}

module.exports = File;

/**
 * Returns the JSON form of the file, that would be returned
 * from the S3 service.
 *
 * @public
 * @params {Boolean} includeBody
 * @return {Object}
 */

File.prototype.toJSON = function (includeBody) {
  var data = utils.copy(this._data);
  if (!includeBody) {
    delete data.Body;
  }
  return data;
};

/**
 * Should be called when the `Body` is updated. Updates properties like ETag and ContentLength.
 * 
 * @private
 */

File.prototype._updateBody = function () {
  if (this._data.Body) {
    this._data.ETag = utils.makeETag(this._data.Body);
    this._data.ContentLength = this._data.Body.length;
  }
};

File.prototype.getData = function () {
  return this._data.Body;
}
