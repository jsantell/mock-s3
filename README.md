mock-s3
=======

[![Build Status](http://img.shields.io/travis/jsantell/mock-s3.svg?style=flat-square)](https://travis-ci.org/jsantell/mock-s3)
[![Build Status](http://img.shields.io/npm/v/mock-s3.svg?style=flat-square)](https://www.npmjs.org/package/mock-s3)

Mock API for AWS S3

An API mimicking [aws-sdk](https://www.npmjs.org/package/aws-sdk)'s S3 wrapper.

Created because there were no other mock libraries that support multipart uploading as well as streaming from the AWSRequest return for getObject, both which are supported here.

* completeMultipartUpload
* createBucket
* createMultipartUpload
* deleteObject
* deleteObjects
* getObject
* putObject
* uploadPart

There are many other features that are not supported, like matching errors, and all the return properties necessary for S3 objects, but this gets close.

## Install

```
npm install mock-s3
```

## Testing

```
npm test
```

## License

MIT License, Copyright (c) 2015 Jordan Santell
