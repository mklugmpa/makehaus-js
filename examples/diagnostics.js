const { hub, diagnostics } = require('..');
hub.init('raspi-3b-mpa', '8192');
diagnostics.start(hub);
