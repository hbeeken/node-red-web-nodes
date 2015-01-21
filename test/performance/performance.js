/**
 * Copyright 2014 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var should = require("should");
var path = require('path');
var fs = require('fs-extra');

require('look').start();

process.env.NODE_RED_HOME = process.env.NODE_RED_HOME || path.resolve(__dirname+"/../../node-red");

var functionNode = require(path.join(process.env.NODE_RED_HOME,'nodes', 'core','core', '80-function.js'));
var tflundergroundNode = require("../../transport/tfl-underground.js");
var helper = require('../helper.js');
var nock = helper.nock;

describe('performance tests', function() {

    var file = path.join(__dirname, "tfl-underground-response.xml");
    
    before(function(done) {
        helper.startServer(done);
    });

    beforeEach(function() {
        fs.existsSync(file).should.be.true;
    });
    
    afterEach(function() {
        if(nock) {
            nock.cleanAll();
        }
        helper.unload();
    });

 
    // Trying to force a sleep - not something to do in nodejs but want to just get tests running
    function sleep(time, callback) {
        var stop = new Date().getTime();
        while(new Date().getTime() < stop + time) {
            ;
        }
        callback();
    }
    
   if (nock) {
            
        it(' performance test 1', function(done) {
            fs.readFile(file, 'utf8', function(err, data) {    
                helper.load([functionNode, tflundergroundNode], 
                    [ {id:"helper1", type:"helper", wires:[["tube"]]},
                      {id:"tube", type:"tfl underground", wires:[["fn1"]], line:"District"},
                      {id:"fn1", type:"function", wires:[["helper2"]], func:"" +
                      		"var isGood = msg.payload.goodservice;\n " +
                      		"msg.payload = {};\n" +
                      		"if (isGood) {" +
                      		"msg.payload = \"trains are good\";\n" +
                      		"} else {" +
                      		"msg.payload = \"trains are bad\";\n" +
                      		"}\n" +
                      		"return msg;"
                      		},                      
                      {id:"helper2", type:"helper"}],
                      function() {
                          //var scope = nock('http://cloud.tfl.gov.uk').get('/TrackerNet/LineStatus').reply(200, data);
                          
                          var helper1 = helper.getNode("helper1");
                          var tube = helper.getNode("tube");
                          var fn1 = helper.getNode("fn1");
                          var helper2 = helper.getNode("helper2");
                          var limit = 30;
                          for (var int = 0; int < limit; int++) {
                              var scope = nock('http://cloud.tfl.gov.uk').get('/TrackerNet/LineStatus').reply(200, data);
                              console.log("sending payload: " + int);
                              helper1.send({payload:"foo"});
                              sleep(20000, function() {
                                  // executes after 20 seconds, and blocks the thread
                               });
                          }
                          var cnt = 0;
                          fn1.on('input', function(msg){
                              console.log(msg.payload);
                              msg.payload.should.equal("trains are good");
                              if (cnt === (limit - 1)) {
                                done();
                              }
                              cnt++;
                          });
                   });
        });
        });
       
    }
    
});
