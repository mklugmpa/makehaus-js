import { TCWidget, TCWidgetListener } from './tcwidget-base';
import { TileFaderComponents, TileFaderCommands } from '../control/api-fader';
import { MessageType } from '../control/hub';
import { WidgetType } from '../widget/widget';

export class MotorFader extends TCWidget implements FaderListener {
  MIN: number = 0;
  MAX: number = 65536;

  _setProperty(prop: string, val: number, data: any): void {
    if (prop === 'VALUE' && data.min !== undefined && data.max !== undefined) {
      const valToSet = this.MIN + ((this.MAX - this.MIN) * (val - data.min)) / (data.max - data.min);
      this.setValue(Math.round(valToSet));
    }
  }

  onFaderTouched(fader: MotorFader, val: number): void {
    /* don't care */
  }

  onFaderUntouched(fader: MotorFader, val: number): void {
    /* don't care */
  }

  onFaderUpdated(fader: MotorFader, val: number): void {
    this._value = val;
  }

  evtSubject: any;
  private _value: number = 0;

  constructor(chainId: string, boardType: string, boardIdx: number, idx: number, evtSubject: any) {
    super(chainId, boardType, boardIdx, idx, WidgetType.MOTORFADER);
    this.addTCWListener(this);
    this.evtSubject = evtSubject;
  }

  setValue(value: number) {
    if (value <= this.MIN) {
      this._value = this.MIN;
    } else if (value >= this.MAX) {
      this._value = this.MAX;
    } else {
      this._value = value;
    }
    this.evtSubject.next({
      cmd: TileFaderCommands.UPDATE,
      com: TileFaderComponents.MOTORFADER,
      idx: this.widgetId - 1,
      msg_type: MessageType.EVENT,
      chain_id: this.chainId,
      board_type: this.boardType,
      board_idx: this.tileId - 1,
      val: this._value,
    });
  }

  getValue(): number {
    return this._value;
  }

  /* return a value ranged from 0 to 1 from 0 to 65536*/
  getRangedValue(): number {
    const ret = 0 + ((1 - 0) * (this.getValue() - this.MIN)) / (this.MAX - this.MIN);
    return ret;
  }
}

export interface FaderListener extends TCWidgetListener {
  onFaderTouched(fader: MotorFader, val: number): void;
  onFaderUntouched(fader: MotorFader, val: number): void;
  onFaderUpdated(fader: MotorFader, val: number): void;
}

export const MotorFaderEvents = {
  TOUCHED: 'touched',
  UNTOUCHED: 'untouched',
  UPDATED: 'updated',
};
