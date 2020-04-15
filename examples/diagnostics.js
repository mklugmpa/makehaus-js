const { hub, diagnostics } = require('..');
hub.init('localhost', '8192');
diagnostics.start(hub);
