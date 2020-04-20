const { hub, Tile, LedButtonEvents } = require('..');
const { randomColor } = require('randomcolor');

hub.init('localhost', '8192');

[Tile.LEDBUTTON8, Tile.LEDBUTTON12].forEach(type => {
  hub.on(type, tile => {
    console.log('New LedButton tile found. Press the first two buttons to see api functionality');
    tile.widgets[0].on(LedButtonEvents.PRESSED, button => {
      const nextRandomColor = randomColor();
      [...Array(8).keys()].forEach(windex => tile.widgets[windex].setColor(nextRandomColor));
    });

    tile.widgets[1].on(LedButtonEvents.PRESSED, button => {
      const nextRandomHue = 0;
      const nextRandomSaturation = 1;
      const nextRandomLightness = Math.random();
      [...Array(8).keys()].forEach(windex => tile.widgets[windex].setHsl(nextRandomHue, nextRandomSaturation, nextRandomLightness));
    });
  });
});
