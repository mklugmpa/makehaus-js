/*
This file is part of MakeHaus JS, the MakeHaus API for Node.js, released under AGPL-3.0 license.
(c) 2019, 2020 MakeProAudio GmbH and Node.js contributors. All rights reserved.
*/

const { Hub, diagnostics } = require('..');
var hub = new Hub();
hub.init('192.168.178.44', '8192');
diagnostics.start(hub);
