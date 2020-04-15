const { hub, Tile, MotorFaderEvents } = require('..');

hub.init('localhost', '8192');
[Tile.MOTORFADER4].forEach(type => {
  hub.on(type, tile => {
    console.log('New Motorfader tile found. Move the first fader to see api functionality');
    tile.widgets[0].on(MotorFaderEvents.UPDATED, (motorfader, val) => {
      [1, 2, 3].forEach(windex => tile.widgets[windex].setValue(val));
    });
  });
});
