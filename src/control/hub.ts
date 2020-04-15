import { client } from './client';
import { TileBase, BoardType } from './api-base';
import { TileLedButton12, TileLedButton8 } from './api-butled';
import { TileEncoder12, TileEncoder8 } from './api-encoder';
import { ReplaySubject } from 'rxjs';
import { EventEmitter } from 'events';
import { TCWidget } from '../tcwidget/tcwidget-base';
import { TileFader4 } from './api-fader';
import { TileTextLcdDisplayDual } from './api-textlcddisplay';

export class Hub extends EventEmitter {
  private subject = new ReplaySubject<ControlEvent>();
  private tiles: TileBase<TCWidget>[] = [];
  private dataCallback = (json: any) => {
    let what;
    if (json.msg_type === MessageType.CHAININIT) {
      what = json as ChainInit;
      let tile: TileBase<TCWidget>;
      what.board_infos.forEach(boardInfo => {
        switch (boardInfo.board_type) {
          case BoardType.TILEBUTLED12:
            tile = new TileLedButton12(this.subject, what.chain_id, boardInfo.board_type, boardInfo.board_idx);
            break;
          case BoardType.TILEBUTLED8:
            tile = new TileLedButton8(this.subject, what.chain_id, boardInfo.board_type, boardInfo.board_idx);
            break;
          case BoardType.TILEENCODER12:
            tile = new TileEncoder12(this.subject, what.chain_id, boardInfo.board_type, boardInfo.board_idx);
            break;
          case BoardType.TILEENCODER8:
            tile = new TileEncoder8(this.subject, what.chain_id, boardInfo.board_type, boardInfo.board_idx);
            break;
          case BoardType.TILEFADER4:
            tile = new TileFader4(this.subject, what.chain_id, boardInfo.board_type, boardInfo.board_idx);
            break;
          case BoardType.TILETEXTLCDDUALDISPLAY:
            tile = new TileTextLcdDisplayDual(this.subject, what.chain_id, boardInfo.board_type, boardInfo.board_idx);
            break;
          default:
            break;
        }
        if (tile) {
          this.tiles.push(tile);
          this.emit(tile.tileType().toString(), tile);
        }
      });
    } else if (json.msg_type === MessageType.EVENT) {
      what = json as ControlEvent;
      this.subject.next(what);
    }
  };

  init = (host: string, port: number) => {
    client.start(host, port);
    client.on('error', (e: any) => console.log('error %s', e));
    client.on('connect', () => console.log('Connection established to hub'));
    client.on('close', (e: any) => console.log('close %s', e));
    client.on('data', (json: any) => this.dataCallback(json));
  };
}

export const MessageType = {
  CHAININIT: 'chain-init',
  EVENT: 'event',
};

export const hub: Hub = new Hub();
Object.seal(hub);
