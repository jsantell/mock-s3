var File = require("./file");
var inherits = require("util").inherits;
var utils = require("./utils");

/**
 * Creates a new file for mock-s3.
 * @class
 */

function MPU (ops) {
  File.call(this, ops);
  this._parts = {};
  this._bufferParts = [];
  this._data.UploadId = makeUploadId();
}
inherits(MPU, File);
module.exports = MPU;

MPU.prototype.uploadPart = function (ops) {
  var eTag = this._parts[ops.PartNumber] = utils.makeETag(ops.Body);

  this._bufferParts.push({
    buffer: ops.Body,
    partNumber: +ops.PartNumber
  });

  return { ETag: eTag, PartNumber: ops.PartNumber };
};

MPU.prototype.complete = function (ops) {
  var self = this;
  ops.MultipartUpload.Parts.forEach(function (part) {
    var storedETag = self._parts[part.PartNumber];
    if (!storedETag || storedETag !== part.ETag) {
      throw new Error("Unknown ETag or Part: " + part.ETag);
    }
  });

  this._data.Body = this._bufferParts.sort(function (a, b) { return a.PartNumber < b.PartNumber ? -1 : 0 }).reduce(function (acc, part) {
    return Buffer.concat([acc, part.buffer], acc.length + part.buffer.length);
  }, new Buffer(0));

  this._updateBody();

  return this.toJSON();
};

function makeUploadId () {
  return (Math.random() * 1000000).toFixed(0);
}
