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

module.exports = function(RED) {
    "use strict";

    function TfLNode(n) {
        RED.nodes.createNode(this,n);
    }
    RED.nodes.registerType("tfl-credentials",TfLNode,{
        credentials: {
            acceptedtcs: { type:"text"}
        }       
    });
    
    RED.httpAdmin.get('/tfl-credentials/auth', function(req, res){
        // this needs testing, but haven't got far enough through the UI in order to test it
        console.log("in here");
        if (!req.query.acceptedtcs) {
            return res.status(400).send('ERROR: request does not contain the required parameters');
        }
        var nodeid = req.query.id;
        
        var credentials = RED.nodes.getCredentials(nodeid) || {};
        credentials.acceptedtcs = req.query.acceptedtcs || credentials.acceptedtcs;

        if (!credentials.acceptedtcs) {
            return res.status(400).send('ERROR: Terms and conditions have not been accepted');
        }
    });
    
}
