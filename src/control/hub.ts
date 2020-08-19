/*
This file is part of MakeHaus JS, the MakeHaus API for Node.js, released under AGPL-3.0 license.
(c) 2019, 2020 MakeProAudio GmbH and Node.js contributors. All rights reserved.
*/

import { Client } from './client';
import { TileBase, BoardType } from './api-base';
import { TileLedButton12, TileLedButton8 } from './api-butled';
import { TileEncoder12, TileEncoder8 } from './api-encoder';
import { ReplaySubject } from 'rxjs';
import { EventEmitter } from 'events';
import { TCWidget } from '../tcwidget/tcwidget-base';
import { TileFader4 } from './api-fader';
import { TileTextLcdDisplayDual } from './api-textlcddisplay';
import { Stacks } from '../stack/stacks';
import { StackBase } from '../stack/stack';
import { registry } from '../registry/registry';

export class Hub extends EventEmitter {
  /* Create a Stream where the type of messages we will be handling is of type ControlEvent */
  private subject = new ReplaySubject<ControlEvent>();

  constructor(host: string, port: number) {
    super();
    if (host != '') {
      this.objectHandle = registry.registerObject(this, 'host=' + host + ',port=' + port, '', '');
    }
  }

  /* The TileBase class is the abstract base class for all Tile types. */
  private tiles: TileBase<TCWidget>[] = [];
  private inited: boolean = false;
  private client: Client = new Client();
  private host: string = '';
  private port: number = 0;
  private firstDisconnectError: boolean = true;
  isConnected: boolean = false;
  private hubId: string = '';
  private objectHandle: string = '';

  private dataCallback = (json: any) => {
    let what;

    /* there may be different types of messages coming in from the hub. Refer to the MessageType enum for a complete list*/
    if (json.msg_type === MessageType.CHAININIT) {
      if (this.inited === true) {
        /* Check whether the hub proxy has already been inited and avoid reinitialization */
        console.log('Tile Chain was reconnected to hub. Avoiding reinitialization');
        /*
        Stacks.getAll().forEach((stack) => {
          const stackbase = stack as StackBase;
          stackbase.sync();
        });
        */
        return;
      }

      /* Currently supports only a single Tile Chain connected to the Hub */
      console.log('Found a Tile Chain connected to hub.');
      this.inited = true;
      what = json as ChainInit;
      let tile: TileBase<TCWidget>;

      /* Depending on the board info, create different base objects. Refer to TileBase and its
       * derivate classes for further information */
      what.board_infos.forEach((boardInfo) => {
        switch (boardInfo.board_type) {
          case BoardType.TILEBUTLED12:
            tile = new TileLedButton12(this.subject, what.chain_id, boardInfo.board_type, boardInfo.board_idx, this.client, this.hubId);
            break;
          case BoardType.TILEBUTLED8:
            tile = new TileLedButton8(this.subject, what.chain_id, boardInfo.board_type, boardInfo.board_idx, this.client, this.hubId);
            break;
          case BoardType.TILEENCODER12:
            tile = new TileEncoder12(this.subject, what.chain_id, boardInfo.board_type, boardInfo.board_idx, this.client, this.hubId);
            break;
          case BoardType.TILEENCODER8:
            tile = new TileEncoder8(this.subject, what.chain_id, boardInfo.board_type, boardInfo.board_idx, this.client, this.hubId);
            break;
          case BoardType.TILEFADER4:
            tile = new TileFader4(this.subject, what.chain_id, boardInfo.board_type, boardInfo.board_idx, this.client, this.hubId);
            break;
          case BoardType.TILETEXTLCDDUALDISPLAY:
            tile = new TileTextLcdDisplayDual(this.subject, what.chain_id, boardInfo.board_type, boardInfo.board_idx, this.client, this.hubId);
            break;
          default:
            break;
        }

        /* cache the tile and forward the information that a new tile was discovered via events */
        if (tile) {
          tile.init();
          this.tiles.push(tile);
          this.emit(tile.tileType().toString(), tile);
        }
      });
    } else if (json.msg_type === MessageType.EVENT) {
      what = json as ControlEvent;

      /* If the message type is an EVENT, pass the message to the event Stream to process */
      this.subject.next(what);
    } else if (json.msg_type === MessageType.CHAINEXIT) {
      /* Don't do anything special in the disconnect section. This is currently matching the implementation on the Tiles Hub*/
      console.log('Tile Chain was disconnected from Hub');
    }
  };

  init = (host: string, port: number) => {
    /* Start listening to the client for events. */
    this.host = host;
    this.port = port;
    this.client.init(host, port);

    /* Register event handlers for different event types on the server. */
    this.client.on('error', this.handleError);
    this.client.on('connect', this.handleConnect);
    this.client.on('close', this.handleClose);

    /* register a data callback which is used as a high speed lane for all significant events */
    this.client.on('data', this.handleData);
  };

  // event handler functions
  handleError = (e: any) => {
    // log all errors except repeatedly connection fails
    if (e.errno == 'ECONNREFUSED') {
      if (this.firstDisconnectError) {
        console.log('TilesHub at ' + this.host + ':' + this.port + ' does not respond');
        this.firstDisconnectError = false;
      }
    } else {
      console.log('error %s', e);
    }
  };

  handleConnect = () => {
    console.log('TilesHub at ' + this.host + ':' + this.port + ' connected');
    this.firstDisconnectError = true;
    this.hubId = this.host + ':' + this.port;
  };

  handleClose = (e: any) => {
    if (this.firstDisconnectError) {
      console.log('TilesHub at ' + this.host + ':' + this.port + ' disconnected (' + e + ')');
    }
    // set timeout to try to connect again after 3 secs
    setTimeout(this.doReconnect, 3000);
  };

  handleData = (json: any) => {
    this.dataCallback(json);
  };

  // try a reconnect after the set timeout
  doReconnect = () => {
    this.client.connect(this.host, this.port);
  };

  exit = (finalExit: boolean) => {
    console.log('HUB ' + this.hubId + ' CLOSING');
    // all Tiles exit
    this.tiles.forEach((tile) => {
      tile.exit();
    });

    // delete all Tiles
    this.tiles.length = 0;

    // Remove all listeners
    this.client.removeAllListeners();

    // Stop listening to the client for events.
    this.client.exit();

    if (finalExit) {
      delete this.client;
      registry.unRegisterObject(this.objectHandle);
    }

    console.log('HUB ' + this.hubId + ' CLOSED');
  };
}

export const MessageType = {
  CHAININIT: 'chain-init',
  CHAINEXIT: 'chain-exit',
  EVENT: 'event',
};

export const hub: Hub = new Hub('', 0);
Object.seal(hub);
