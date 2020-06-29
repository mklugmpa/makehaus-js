/*
This file is part of MakeHaus JS, the MakeHaus API for Node.js, released under AGPL-3.0 license.
(c) 2019, 2020 MakeProAudio GmbH and Node.js contributors. All rights reserved.
*/

import { TCWidget } from './tcwidget-base';
import { WidgetType } from '../widget/widget';

export class TextLcdDisplay extends TCWidget {
  evtSubject: any;
  constructor(chainId: string, boardType: string, boardIdx: number, idx: number, evtSubject: any) {
    super(chainId, boardType, boardIdx, idx, WidgetType.TEXTLCDDISPLAY);
    this.evtSubject = evtSubject;
  }

  _setProperty(prop: string, val: string): void {
    /* No external property supported */
  }

  sayHello() {
    this.setTextLeft(0, 'hello');
    this.setTextLeft(1, 'makeproaudio');
  }

  setTextLeft(row: number, text: string) {
    this.evtSubject.next({ cmd: 'TXT-CENTER-LEFT', com: 'ST7032', idx: this.widgetId, msg_type: 'event', nid: this.tileId, val: row, ext: text });
  }

  setTextFormattingOptions(row: number, col: number, option: TextFormattingOptions) {}
  setBar(row: number, col: number, value: number) {}
  setBarFormattingOptions(row: number, col: number, option: BarFormattingOptions) {}
}

export enum TextFormattingOptions {
  CENTERLEFT,
  CENTERRIGHT,
  LEFT,
  RIGHT,
  SCROLLLEFT,
  SCROLLRIGHT,
}

export enum BarFormattingOptions {
  CENTER,
  LEFT,
  RIGHT,
  SPREAD,
}
