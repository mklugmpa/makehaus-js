/*
This file is part of MakeHaus JS, the MakeHaus API for Node.js, released under AGPL-3.0 license.
(c) 2019, 2020 MakeProAudio GmbH and Node.js contributors. All rights reserved.
*/

import { WidgetType } from '../widget/widget';
import { UIRow } from '../row/row';

export interface UILayout {
  title: string;
  rows: UIRow[];
}

export interface Layout {
  title?: string;
  tilechains?: TileChain[];
  rows?: Row[];
}

export interface TileChain {
  name: string;
  address: string;
  port: number;
}

export interface Row {
  name: string;
  weight: number;
  widgetstacks?: Stack[];
}

export interface Stack {
  name: string;
  context: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
  values?: string[] | number[] | boolean[];
  defaultValue: string | number | boolean;
  widgets?: Widget[];
}

export interface Widget {
  name: string;
  type?: WidgetType;
  tilechain?: string;
  identifier?: string;
  event: WidgetEvent;
  weight?: number;
}

export enum WidgetEvent {
  PRESS = 'PRESS',
  TURN = 'TURN',
  MOVE = 'MOVE',
}
