var Request = require("./request");

module.exports = function wrapper (methodName, fn) {
  return function (options, callback) {
    var s3 = this;
    s3.emit("mock-s3:call:" + methodName, options);

    var req = new Request(s3, methodName, fn, options);

    if (callback) {
      req.on("success", function (res) { callback(null, res); });
      req.on("error", callback);
    }
    req.on("complete", function () {
      s3.emit("mock-s3:complete:" + methodName, options);
    });

    return req;
  };
};
