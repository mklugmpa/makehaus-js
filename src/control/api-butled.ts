import { TileBase, Tile, BoardType } from './api-base';
import { filter } from 'rxjs/operators';
import { NextObserver } from 'rxjs';
import { LedButton, ButtonListener, LedButtonEvents } from '../tcwidget/ledbutton';
import { client } from './client';

abstract class TileLedButton extends TileBase<LedButton> {
  constructor(evtSubject: any, chainId: string, boardType: BoardType, tileType: Tile, tileIndex: number, size: number) {
    super(evtSubject, chainId, boardType, tileType, tileIndex, size);
    for (let i = 0; i < this.size; i++) {
      this.widgets.push(new LedButton(this.chainId(), this.boardType(), this.tileIndex(), i, evtSubject));
    }
    const buttonFiltered = this.evtSubject.pipe(
      filter((ev: ControlEvent) => {
        return (ev.com === TileButLedComponents.BUTTON || ev.com === TileButLedComponents.LED) && this.isMine(ev);
      })
    );
    buttonFiltered.pipe(filter((ev: ControlEvent) => ev.cmd === TileButLedCommands.PRESSED)).subscribe(this.buttonPressed);
    buttonFiltered.pipe(filter((ev: ControlEvent) => ev.cmd === TileButLedCommands.RELEASED)).subscribe(this.buttonReleased);
    buttonFiltered.pipe(filter((ev: ControlEvent) => ev.cmd === TileButLedCommands.COLOUR)).subscribe(this.forwardAsIs);
    buttonFiltered.pipe(filter((ev: ControlEvent) => ev.cmd === TileButLedCommands.FLASH)).subscribe(this.forwardAsIs);
    buttonFiltered.pipe(filter((ev: ControlEvent) => ev.cmd === TileButLedCommands.FLASHSTOP)).subscribe(this.forwardAsIs);
  }

  buttonPressed: NextObserver<ControlEvent> = {
    next: what => {
      const widget = this.widgets[what.idx] as LedButton;
      widget.emit(LedButtonEvents.PRESSED, widget);
      widget.widgetListeners.forEach(l => {
        const buttonListener = l as ButtonListener;
        buttonListener.onButtonPressed(widget);
      });
    },
  };

  buttonReleased: NextObserver<ControlEvent> = {
    next: what => {
      const widget = this.widgets[what.idx] as LedButton;
      widget.emit(LedButtonEvents.RELEASED, widget);
      widget.widgetListeners.forEach(l => {
        const buttonListener = l as ButtonListener;
        buttonListener.onButtonReleased(widget, what.val);
      });
    },
  };

  forwardAsIs: NextObserver<ControlEvent> = {
    next: what => {
      client.send(what);
    },
  };
}

export const TileButLedCommands = {
  PRESSED: 'PRESSED',
  RELEASED: 'RELEASED',
  COLOUR: 'COLOUR',
  FLASH: 'FLASH',
  FLASHSTOP: 'FLASH-CEASE',
};

export const TileButLedComponents = {
  BUTTON: 'BUTTON',
  LED: 'RGB_LED',
};

export class TileLedButton12 extends TileLedButton {
  constructor(evtSubject: any, chainId: string, boardType: BoardType, tileIndex: number) {
    super(evtSubject, chainId, boardType, Tile.LEDBUTTON12, tileIndex, 12);
  }
}

export class TileLedButton8 extends TileLedButton {
  constructor(evtSubject: any, chainId: string, boardType: BoardType, tileIndex: number) {
    super(evtSubject, chainId, boardType, Tile.LEDBUTTON8, tileIndex, 8);
  }
}
