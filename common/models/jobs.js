'use strict';

var http = require('http');
var monq = require('monq');
var request = require('request');
var client = monq('mongodb://localhost:27017/jobs');
var worker = client.worker(['queue']);

var status

worker.register({
    queue: function (params, callback) {
        try {
            callback(null, params);
        } catch (err) {
            callback(err);
        }
    }
});

module.exports = function(Jobs) {

  Jobs.createFromUrl = function(url, cb) {
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'http://' + url;
    }

    request(url, function(error, response, body) {
      Jobs.create({
        url: body,
      }, function(err, instance) {
          var queue = client.queue('queue');
          queue.enqueue(instance.id, {
            id: instance.id,
            respond: body
          }, function (err, job) {
              worker.on('dequeued', function (data) {
                  console.log('Dequeued:');
                  status = 'Dequeued';
                  console.log(data);
              });

              worker.on('failed', function (data) {
                  console.log('Failed:');
                  status = 'Failed';
                  console.log(data);
              });

              worker.on('complete', function (data) {
                  console.log('Complete:');
                  status = 'Complete';
                  console.log(data);
              });

              worker.on('error', function (err) {
                  console.log('Error:');
                  status = 'Error';
                  console.log(err);
                  worker.stop();
              });
              status = job.data.status
              worker.start();
              cb(null, instance.id, body, status);
          });

      });
    });

  };

  Jobs.status = function(id, cb) {
    if(id) {
      Jobs.findById(id, function(err, instance) {
        console.log(status);
        worker.stop();
        cb(null, instance.id, instance.url, status);
      });

    } 
    else {
      Jobs.find(function(err, instance) {
         cb(null, instance);
      });
    }
  };

  Jobs.remoteMethod (
    'createFromUrl', {
      http: {
        path: '/createFromUrl',
        verb: 'post'
      },
      accepts: {
      	arg: 'url', 
      	type: 'string'
      },
      returns: [{
        arg: 'id',
        type: 'string'
      },
      {
        arg: 'respond',
        type: 'string'
      },
      {
        arg: 'status', 
        type: 'string'
      },
      { 
        arg: 'data', 
        type: 'object', 
        http: { 
          source: 'body' 
        } 
      }]
    }
  )

  Jobs.remoteMethod(
    'status', {
      http: {
        path: '/status',
        verb: 'get'
      },
      accepts: {
        arg: 'id', 
        type: 'string'
      },
      returns: [
      {
        arg: 'id',
        type: 'string'
      },
      {
        arg: 'respond',
        type: 'string'      
      },
      {
        arg: 'status',
        type: 'string'
      }]
    },
  );

};


