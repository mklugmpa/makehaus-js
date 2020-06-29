const { hub, autoAnimate } = require('..');
hub.init('raspi-3b-mpa', '8192');
autoAnimate.start(hub);
