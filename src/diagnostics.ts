/*
This file is part of MakeHaus JS, the MakeHaus API for Node.js, released under AGPL-3.0 license.
(c) 2019, 2020 MakeProAudio GmbH and Node.js contributors. All rights reserved.
*/

import { Tile } from './control/api-base';
import { TileLedButton12, TileLedButton8 } from './control/api-butled';
import { LedButton, LedButtonEvents } from './tcwidget/ledbutton';
import { TileEncoder12, TileEncoder8 } from './control/api-encoder';
import { Encoder, EncoderEvents } from './tcwidget/encoder';
import { TileFader4 } from './control/api-fader';
import { MotorFader, MotorFaderEvents } from './tcwidget/motorfader';

class Diagnostics {
  start = (hub: any) => {
    console.log('Entered Diagnostics Mode');
    hub.on(Tile.LEDBUTTON12, (tile: TileLedButton12) => {
      tile.widgets.forEach((w: LedButton) => {
        w.on(LedButtonEvents.PRESSED, (button: LedButton) => {
          console.log(`${Tile.LEDBUTTON12}.${button.tileId}.${button.widgetId} pressed`);
        });

        w.on(LedButtonEvents.RELEASED, (button: LedButton) => {
          console.log(`${Tile.LEDBUTTON12}.${button.tileId}.${button.widgetId} released`);
        });
      });
    });

    hub.on(Tile.LEDBUTTON8, (tile: TileLedButton8) => {
      tile.widgets.forEach((w: LedButton) => {
        w.on(LedButtonEvents.PRESSED, (button: LedButton) => {
          console.log(`${Tile.LEDBUTTON8}.${button.tileId}.${button.widgetId} pressed`);
        });

        w.on(LedButtonEvents.RELEASED, (button: LedButton) => {
          console.log(`${Tile.LEDBUTTON8}.${button.tileId}.${button.widgetId} released`);
        });
      });
    });

    hub.on(Tile.ENCODER12, (tile: TileEncoder12) => {
      tile.widgets.forEach((w: Encoder) => {
        w.on(EncoderEvents.PRESSED, (encoder: Encoder) => {
          console.log(`${Tile.ENCODER12}.${encoder.tileId}.${encoder.widgetId} pressed`);
        });

        w.on(EncoderEvents.RELEASED, (encoder: Encoder) => {
          console.log(`${Tile.ENCODER12}.${encoder.tileId}.${encoder.widgetId} released`);
        });

        w.on(EncoderEvents.TOUCHED, (encoder: Encoder) => {
          console.log(`${Tile.ENCODER12}.${encoder.tileId}.${encoder.widgetId} touched`);
        });

        w.on(EncoderEvents.UNTOUCHED, (encoder: Encoder) => {
          console.log(`${Tile.ENCODER12}.${encoder.tileId}.${encoder.widgetId} untouched`);
        });

        w.on(EncoderEvents.LEFT, (encoder: Encoder, acceleratedValue: number) => {
          console.log(`${Tile.ENCODER12}.${encoder.tileId}.${encoder.widgetId} moved left with value ${acceleratedValue}`);
        });

        w.on(EncoderEvents.RIGHT, (encoder: Encoder, acceleratedValue: number) => {
          console.log(`${Tile.ENCODER12}.${encoder.tileId}.${encoder.widgetId} moved right with value ${acceleratedValue}`);
        });
      });
    });

    hub.on(Tile.ENCODER8, (tile: TileEncoder8) => {
      tile.widgets.forEach((w: Encoder) => {
        w.on(EncoderEvents.PRESSED, (encoder: Encoder) => {
          console.log(`${Tile.ENCODER8}.${encoder.tileId}.${encoder.widgetId} pressed`);
        });

        w.on(EncoderEvents.RELEASED, (encoder: Encoder) => {
          console.log(`${Tile.ENCODER8}.${encoder.tileId}.${encoder.widgetId} released`);
        });

        w.on(EncoderEvents.TOUCHED, (encoder: Encoder) => {
          console.log(`${Tile.ENCODER8}.${encoder.tileId}.${encoder.widgetId} touched`);
        });

        w.on(EncoderEvents.UNTOUCHED, (encoder: Encoder) => {
          console.log(`${Tile.ENCODER8}.${encoder.tileId}.${encoder.widgetId} untouched`);
        });

        w.on(EncoderEvents.LEFT, (encoder: Encoder, acceleratedValue: number) => {
          console.log(`${Tile.ENCODER8}.${encoder.tileId}.${encoder.widgetId} moved left with value ${acceleratedValue}`);
        });

        w.on(EncoderEvents.RIGHT, (encoder: Encoder, acceleratedValue: number) => {
          console.log(`${Tile.ENCODER8}.${encoder.tileId}.${encoder.widgetId} moved right with value ${acceleratedValue}`);
        });
      });
    });

    hub.on(Tile.MOTORFADER4, (tile: TileFader4) => {
      tile.widgets.forEach((w: MotorFader) => {
        w.on(MotorFaderEvents.TOUCHED, (fader: MotorFader) => {
          console.log(`${Tile.MOTORFADER4}.${fader.tileId}.${fader.widgetId} touched`);
        });

        w.on(MotorFaderEvents.UNTOUCHED, (fader: MotorFader) => {
          console.log(`${Tile.MOTORFADER4}.${fader.tileId}.${fader.widgetId} untouched`);
        });

        w.on(MotorFaderEvents.UPDATED, (fader: MotorFader) => {
          console.log(`${Tile.MOTORFADER4}.${fader.tileId}.${fader.widgetId} updated to ${fader.getValue()}`);
        });
      });
    });
  };
}

export const diagnostics: Diagnostics = new Diagnostics();
Object.seal(diagnostics);
