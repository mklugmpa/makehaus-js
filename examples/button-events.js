const { hub, Tile, LedButtonEvents } = require('..');

hub.init('localhost', '8192');

[Tile.LEDBUTTON8, Tile.LEDBUTTON12].forEach(type => {
  hub.on(type, tile => {
    console.log('New LedButton tile found. Fiddle with your buttons to see events');
    tile.widgets.forEach(w => {
      w.on(LedButtonEvents.PRESSED, button => {
        console.log(`${button.widgetId} pressed`);
      });

      w.on(LedButtonEvents.RELEASED, button => {
        console.log(`${button.widgetId} released`);
      });
    });
  });
});
