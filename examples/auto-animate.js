const { hub, autoAnimate } = require('..');
hub.init('localhost', '8192');
autoAnimate.start(hub);
