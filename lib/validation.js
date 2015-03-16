var when = require("when");
var utils = require("./utils");

var validations = {
  createBucket: createBucket,
  createMultipartUpload: createMultipartUpload,
  uploadPart: uploadPart,
  completeMultipartUpload: completeMultipartUpload,
  deleteObjects: deleteObjects,
  deleteObject: deleteObject,
  getObject: getObject,
  putObject: putObject,
}

/**
 * Returns a promise indicating whether or not there
 * were validation errors. Rejects if not valid.
 */
module.exports = function (s3, methodName, ops) {
  return when.try(validations[methodName].bind(s3), ops);
}

function required (ops, keys) {
  [].concat(keys).forEach(function (key) {
    if (ops[key] == void 0) {
      throw utils.createError(new Error("Missing required key \'" + key + "\' in params"), { code: "MissingRequiredParameter" });
    }
  });
}

function bucketExists (s3, ops, mustExist) {
  if (!mustExist && s3._buckets[ops.Bucket]) {
    throw utils.createError(new Error("Bucket already exists"));
  }
  if (mustExist && !s3._buckets[ops.Bucket]) {
    throw utils.createError(new Error("Bucket does not exist"));
  }
}

function objectExists (s3, ops, mustExist) {
  if (!mustExist && s3._buckets[ops.Bucket]._files[ops.Key]) {
    throw utils.createError(new Error("Object already exists"));
  }
  if (mustExist && !s3._buckets[ops.Bucket]._files[ops.Key]) {
    throw utils.createError(new Error("Object does not exist"));
  }
}

function createBucket (options) {
  required(options, ["Bucket"]);
  bucketExists(this, options, false);
}

function createMultipartUpload (options) {
  required(options, ["Bucket", "Key"]);
  bucketExists(this, options, true);
}

function uploadPart (options) {
  required(options, ["Bucket", "Key", "UploadId", "PartNumber", "Body"]);
  bucketExists(this, options, true);
}

function completeMultipartUpload (options) {
  required(options, ["Bucket", "Key", "UploadId", "MultipartUpload"]);
  bucketExists(this, options, true);
}

function deleteObjects (options) {
  required(options, ["Bucket"]);
  bucketExists(this, options, true);
}

function deleteObject (options) {
  required(options, ["Bucket", "Key"]);
  bucketExists(this, options, true);
  objectExists(this, options, true);
}

function getObject (options) {
  required(options, ["Bucket", "Key"]);
  bucketExists(this, options, true);
  objectExists(this, options, true);
}

function putObject (options) {
  required(options, ["Bucket", "Key"]);
  bucketExists(this, options, true);
}
