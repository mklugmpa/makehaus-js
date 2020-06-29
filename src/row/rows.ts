/*
This file is part of MakeHaus JS, the MakeHaus API for Node.js, released under AGPL-3.0 license.
(c) 2019, 2020 MakeProAudio GmbH and Node.js contributors. All rights reserved.
*/

import { Row, RowBase } from './row';

class RowRegistry {
  private rows: Map<string, Row> = new Map();

  get = (name: string): Row | undefined => {
    return this.rows.get(name);
  };

  getAll = (): Row[] => {
    return Array.from(this.rows.values());
  };

  createOrGet = (name: string, weight: number): Row => {
    let row = this.rows.get(name);
    if (!row) {
      row = new RowBase(name, weight);
      this.rows.set(name, row);
    }
    return row;
  };

  remove = (name: string) => {
    let s: Row | undefined | null = this.rows.get(name);
    if (s) {
      this.rows.delete(name);
      s = null;
    }
  };
}

export const Rows = new RowRegistry();
Object.seal(Rows);
