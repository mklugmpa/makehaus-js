import { TCWidget, TCWidgetListener } from './tcwidget-base';
import { WidgetType } from '../widget/widget';

export class Encoder extends TCWidget {
  constructor(chainId: string, boardType: string, boardIdx: number, idx: number) {
    super(chainId, boardType, boardIdx, idx, WidgetType.ENCODER);
  }

  _setProperty(prop: string, val: string): void {
    /* No external property supported */
  }
}

export interface EncoderListener extends TCWidgetListener {
  onEncoderTurnedRight(encoder: Encoder, val: number): void;
  onEncoderTurnedLeft(encoder: Encoder, val: number): void;
  onEncoderPressed(encoder: Encoder): void;
  /* TODO released should give you a duration */
  onEncoderReleased(encoder: Encoder): void;
  onEncoderTouched(encoder: Encoder): void;
  onEncoderUntouched(encoder: Encoder): void;
}

export const EncoderEvents = {
  PRESSED: 'pressed',
  RELEASED: 'released',
  TOUCHED: 'touched',
  UNTOUCHED: 'untouched',
  LEFT: 'left',
  RIGHT: 'right',
};
