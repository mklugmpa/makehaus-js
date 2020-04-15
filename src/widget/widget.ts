import { EventEmitter } from 'events';
import { StackBase, StackEvent } from '../stack/stack';
import { TCWidget } from '../tcwidget/tcwidget-base';
import { UI } from '../ui/ui';

export interface Widget {
  name(): string;
  setName(name: string): void;

  type(): WidgetType;
  setType(widgetType: WidgetType): void;

  weight(): number | undefined;
  setWeight(weight: number): void;

  touchedState(): boolean;
  pressedState(): boolean;
  absoluteValue(): any;
}

export interface UIWidget {
  name: string;
  type: WidgetType;
  weight: number;
}

export class WidgetBase extends EventEmitter implements Widget {
  constructor(name: string, type: WidgetType, weight?: number) {
    super();
    this._name = name;
    this._type = type;
    this._touchedState = false;
    this._pressedState = false;
    this._weight = weight;
  }

  private _name: string;
  private _type: WidgetType;
  private _touchedState: boolean;
  private _pressedState: boolean;
  private _weight: number | undefined;
  private _derivedFromHardware: boolean = false;
  private _tcWidget: TCWidget | undefined;
  private _stack: StackBase | undefined;

  absoluteValue(): any {
    if (this._stack) {
      return this._stack!.value();
    }
  }

  pressedState(): boolean {
    return this._pressedState;
  }

  touchedState(): boolean {
    return this._touchedState;
  }

  setStack(stack: StackBase): void {
    this._stack = stack;
  }

  onTouched(state: boolean): void {
    if (this._stack) {
      this._touchedState = state;
      const evt: WidgetEvent = {
        kind: 'widgetevent',
        source: this._name,
        name: this.name(),
        stack: this._stack.name(),
        type: WidgetEventType.TOUCH,
        val: this._touchedState ? true : false,
      };
      this._stack!.onWidgetEvent(evt);
    }
  }

  onRelativeChange(val: any): void {
    if (this._stack) {
      const evt: WidgetEvent = {
        kind: 'widgetevent',
        source: this._name,
        name: this.name(),
        stack: this._stack.name(),
        type: WidgetEventType.CHANGE_RELATIVE,
        val,
      };
      this._stack!.onWidgetEvent(evt);
    }
  }

  onAbsoluteChange(val: any): void {
    if (this._stack) {
      const evt: WidgetEvent = {
        kind: 'widgetevent',
        source: this._name,
        name: this.name(),
        stack: this._stack.name(),
        type: WidgetEventType.CHANGE_ABSOLUTE,
        val,
      };
      this._stack!.onWidgetEvent(evt);
    }
  }

  onPressed(state: boolean): void {
    if (this._stack) {
      this._pressedState = state;
      const evt: WidgetEvent = {
        kind: 'widgetevent',
        source: this._name,
        name: this.name(),
        stack: this._stack.name(),
        type: WidgetEventType.PRESS,
        val: this._pressedState ? true : false,
      };
      this._stack!.onWidgetEvent(evt);
    }
  }

  setPressedState(evt: WidgetEvent): void {
    if (this._derivedFromHardware) {
    } else {
      UI.receiveEvent(evt);
    }
  }

  setTouchedState(evt: WidgetEvent): void {
    if (this._derivedFromHardware) {
    } else {
      UI.receiveEvent(evt);
    }
  }

  setProperty(evt: StackEvent, data?: any): void {
    if (this._derivedFromHardware) {
      this._tcWidget!._setProperty(evt.type, evt.val, data);
    } else {
      UI.receiveEvent(evt);
    }
  }

  weight(): number | undefined {
    return this._weight;
  }

  setWeight(weight: number) {
    this._weight = weight;
  }

  name(): string {
    return this._name;
  }

  setName(name: string) {
    this._name = name;
  }

  _setDerivedFromHardware(tcWidget: TCWidget) {
    this._derivedFromHardware = true;
    this._tcWidget = tcWidget;
  }

  _getDerivedFromHardware() {
    return this._derivedFromHardware;
  }

  _getTCWidget(): TCWidget | undefined {
    return this._tcWidget;
  }

  type(): WidgetType {
    return this._type;
  }

  setType(type: WidgetType): void {
    if (this._derivedFromHardware) throw Error('cannot change type for a tilechain widget');
    if (!UIWidgetTypes.includes(type)) throw Error('cannot change type to a non-UI widget type');
    if (this._type === type) return;
    if (this._stack) {
      this._type = type;
      const evt: WidgetEvent = {
        kind: 'widgetevent',
        source: this._name,
        name: this.name(),
        stack: this._stack.name(),
        type: WidgetEventType.TYPECHANGE,
        val: type,
      };
      UI.receiveEvent(evt);
    }
  }
}

export enum WidgetTouchedState {
  TOUCHED,
  UNTOUCHED,
}

export enum WidgetSelectedState {
  SELECTED,
  UNSELECTED,
}

export enum WidgetEventType {
  TOUCH = 'TOUCH',
  PRESS = 'PRESS',
  CHANGE_RELATIVE = 'CHANGE_RELATIVE',
  CHANGE_ABSOLUTE = 'CHANGE_ABSOLUTE',
  TYPECHANGE = 'TYPECHANGE',
}

export interface WidgetEvent {
  kind: string;
  source: string;
  stack: string;
  name: string;
  type: WidgetEventType;
  val: string | boolean | number;
}

export enum WidgetType {
  SELECTOR_VERTICAL = 'SELECTOR_VERTICAL',
  SELECTOR_HORIZONTAL = 'SELECTOR_HORIZONTAL',
  SLIDER_VERTICAL = 'SLIDER_VERTICAL',
  SLIDER_HORIZONTAL = 'SLIDER_HORIZONTAL',
  TOGGLE = 'TOGGLE',
  BUTTON = 'BUTTON',
  LEDBUTTON = 'LEDBUTTON',
  ENCODER = 'ENCODER',
  MOTORFADER = 'MOTORFADER',
  TEXTLCDDISPLAY = 'TEXTLCDDISPLAY',
  EMPTY = 'EMPTY',
}

export const UIWidgetTypes: WidgetType[] = [
  WidgetType.BUTTON,
  WidgetType.TOGGLE,
  WidgetType.SLIDER_VERTICAL,
  WidgetType.SLIDER_HORIZONTAL,
  WidgetType.SELECTOR_VERTICAL,
  WidgetType.SELECTOR_HORIZONTAL,
  WidgetType.EMPTY,
];
