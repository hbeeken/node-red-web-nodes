/**
 * Copyright 2015 IBM Corp.
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

var bunyan = require("bunyan");
var log = bunyan.createLogger({name: 'performance-node'});

module.exports = function(RED) {
     
    function PerformanceNode(n) {
        RED.nodes.createNode(this, n);
        log.info("created node");
        var node = this;
        node.arraysize = n.arraysize;
          this.on("input", function(msg) {
              log.info("input received");
              var count = 1;
              if(msg.arraysize) {
                  count = msg.arraysize;
              }
              // settings on the node overwrite that in the msg
              if (node.arraysize && node.arraysize > 0) {
                count = node.arraysize;
                msg.arraysize = count;
              }
              var msgs = [];
              msg.arr = {};
              for (var int = 0; int < count; int++) {
                  msg.arr[int] = {};
                  msg.arr[int] [int] = Math.random();  
              }
              for (var i = 0; i < count; i++) {
                  var clone = RED.util.cloneMessage(msg);
                  clone.payload = "This is test " + i;
                  msgs[i] = clone;
              }
              log.info("sending message");
              node.send([msgs]);             
          });
    } 
    
    RED.nodes.registerType("performance", PerformanceNode); 
    
}
