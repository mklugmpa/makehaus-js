import { Stack, UIStack } from '../stack/stack';

export interface Row {
  name(): string;
  addStack(stack: Stack): void;
  removeStack(stack: Stack): void;
  removeStack(pos: number): void;
  stacks(): Stack[];
  weight(): number;
}

export interface UIRow {
  name: string;
  stacks: UIStack[];
  weight: number;
}

export class RowBase implements Row {
  private _stacks: Stack[] = [];

  private _name: string;
  private _weight: number;
  constructor(name: string, weight: number) {
    this._name = name;
    this._weight = weight;
  }

  name(): string {
    return this._name;
  }

  weight(): number {
    return this._weight;
  }

  addStack(stack: Stack): void {
    this._stacks.push(stack);
  }

  removeStack(stack: Stack): void;
  removeStack(pos: number): void;

  removeStack(stack: any) {
    throw new Error('Method not implemented.');
  }

  stacks(): Stack[] {
    return this._stacks;
  }
}
