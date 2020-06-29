/*
This file is part of MakeHaus JS, the MakeHaus API for Node.js, released under AGPL-3.0 license.
(c) 2019, 2020 MakeProAudio GmbH and Node.js contributors. All rights reserved.
*/

import { Stack, StackBase } from './stack';

class StackRegistry {
  private stacks: Map<string, Stack> = new Map();

  get = (name: string): Stack | undefined => {
    return this.stacks.get(name);
  };

  getAll = (): Stack[] => {
    return Array.from(this.stacks.values());
  };

  createOrGet = (name: string): Stack => {
    let stack = this.stacks.get(name);
    if (!stack) {
      stack = new StackBase(name);
      this.stacks.set(name, stack);
    }
    return stack;
  };

  remove = (name: string) => {
    let s: Stack | undefined | null = this.stacks.get(name);
    if (s) {
      this.stacks.delete(name);
      s = null;
    }
  };
}

export const Stacks = new StackRegistry();
Object.seal(Stacks);
