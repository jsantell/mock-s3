var chai = require("chai");
var expect = chai.expect;
var S3 = require("../").S3;
var bufferEquals = require("buffer-equal");

describe("MultipartUploads", function (done) {
  this.timeout(1000 * 60);
  beforeEach(function (done) {
    this.s3 = new S3();
    this.s3.createBucket({ Bucket: "exists" }, function () { done(); });
  });

  it("can upload MPU data", function (done) {
    var s3 = this.s3;
    var parts = {};
    var buffers = ["a", "b", "c", "d"].map(function (char) {
      var b = new Buffer(1000);
      b.fill(char);
      return b;
    });

    s3.createMultipartUpload({ Bucket: "exists", Key: "key" }, function (err, res) {
      expect(res.UploadId).to.be.ok;
      var UploadId = res.UploadId;
      buffers.forEach(function (buffer, i) {
        s3.uploadPart({ Body: buffer, Bucket: "exists", Key: "key", PartNumber: i, UploadId: res.UploadId }, function (err, res) {
          expect(err).to.not.be.ok;
          expect(res.ETag).to.be.ok;
          parts[i] = res.ETag;
          if (Object.keys(parts).length === buffers.length) {
            complete(UploadId);
          }
        });
      });
    });

    function complete (UploadId) {
      s3.completeMultipartUpload({ Bucket: "exists", Key: "key", UploadId: UploadId, MultipartUpload: {
        Parts: Object.keys(parts).map(function (partNumber) { return {
          ETag: parts[partNumber],
          PartNumber: partNumber
        }}),
      }}, function (err, data) {
        expect(data.ETag).to.be.ok;
        expect(data.Bucket).to.be.ok;
        bufferConfirm();
      });
    }
    
    function bufferConfirm () {
      s3.getObject({ Bucket: "exists", Key: "key" }, function (err, res) {
        var result = res.Body;
        var expected = Buffer.concat(buffers, 4000);
        expect(bufferEquals(result, expected)).to.be.ok;
        done();
      });
    }
  });
});
