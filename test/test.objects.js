var chai = require("chai");
var expect = chai.expect;
var S3 = require("../").S3;
var bufferEquals = require("buffer-equal");

describe("Objects", function (done) {
  beforeEach(function (done) {
    this.s3 = new S3();
    this.s3.createBucket({ Bucket: "exists" }, function () { done(); });
  });

  describe("[get|put]Object", function () {
    it("getObject fails without bucket or key or nonexistent bucket or key", function (done) {
      var s3 = this.s3;
      var count = 0;
      s3.getObject({}, handle);
      s3.getObject({ Bucket: "exists" }, handle);
      s3.getObject({ Bucket: "exists", Key: "nope" }, handle);
      s3.getObject({ Bucket: "my bucket", Key: "some key" }, handle);
      function handle (err) {
        expect(err).to.be.ok;
        if (++count === 4) { done(); }
      }
    });

    it("returns the payload in 'Body' after uploading", function (done) {
      var s3 = this.s3;
      var buffer = new Buffer(1000);
      buffer.fill(100);
      s3.putObject({ Bucket: "exists", Key: "file", Body: buffer }, function (err, res) {
        expect(res.Body).to.not.be.ok;
        expect(err).to.not.be.ok;
        s3.getObject({ Bucket: "exists", Key: "file" }, function (err, res) {
          expect(bufferEquals(buffer, res.Body)).to.be.ok;
          expect(err).to.not.be.ok;
          expect(res.ETag).to.be.ok;
          done();
        });
      });
    });

    it("returns a stream for 'Body' if using createReadStream", function (done) {
      var s3 = this.s3;
      var buffer = new Buffer(120000);
      var chunks = [];
      buffer.fill(100);
      s3.putObject({ Bucket: "exists", Key: "file", Body: buffer }, function (err, res) {
        expect(res.Body).to.not.be.ok;
        expect(err).to.not.be.ok;
        s3.getObject({ Bucket: "exists", Key: "file" }).createReadStream()
          .on("data", function (chunk) {
            chunks.push(chunk);
          })
          .on("end", function () {
            var combined = Buffer.concat(chunks, 120000);
            expect(bufferEquals(buffer, combined)).to.be.ok;
            done();
          });
      });
    });
  });

  describe("deleteObject, deleteObjects", function () {
    it("deletes an object that exists", function (done) {
      var s3 = this.s3;
      var buffer = new Buffer(1000);
      buffer.fill(100);
      s3.putObject({ Bucket: "exists", Key: "file", Body: buffer }, function (err, res) {
        s3.deleteObject({ Bucket: "exists", Key: "file" }, function (err, res) {
          expect(err).to.not.be.ok;
          s3.getObject({ Bucket: "exists", Key: "file" }, function (err, res) {
            expect(err).to.be.ok;
            expect(res).to.not.be.ok;
            done();
          });
        });
      });
    });
    it("deletes several objects that exists", function (done) {
      var s3 = this.s3;
      var buffer = new Buffer(1000);
      buffer.fill(100);
      s3.putObject({ Bucket: "exists", Key: "file", Body: buffer }, function (err, res) {
        s3.deleteObjects({ Bucket: "exists", Delete: { Objects: [{Key: "file"}]}}, function (err, res) {
          expect(err).to.not.be.ok;
          s3.getObject({ Bucket: "exists", Key: "file" }, function (err, res) {
            expect(err).to.be.ok;
            expect(res).to.not.be.ok;
            done();
          });
        });
      });
    });
  });
});
