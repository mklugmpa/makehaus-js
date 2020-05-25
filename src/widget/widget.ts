import { EventEmitter } from 'events';
import { StackBase, StackEvent } from '../stack/stack';
import { TCWidget } from '../tcwidget/tcwidget-base';
import { UI } from '../ui/ui';

/* A Widget here is an abstract representation for both hardware and software widgets.
It is not necessary that every Widget implementation will suport each of the properties below.*/
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

/* The interface which represents the abstract Widget on the software UI */
export interface UIWidget {
  name: string;
  type: WidgetType;
  weight: number;
}

/* This base class does a lot of the heavy lifting in the Stacks API.*/
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

  /* Weight is used to define the width of the widget in the UI. */
  private _weight: number | undefined;

  /* Valid if a hardware widget was used in the creation of this abstract widget */
  private _derivedFromHardware: boolean = false;

  /* Valid if a hardware widget was used in the creation of this abstract widget */
  private _tcWidget: TCWidget | undefined;

  /* The stack that this widget is a part of */
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

  /* The on___ methods are called by the parser (src/parser/parser.ts) and are relevant for only the hardware widgets
   * Not every callback is valid for every type of hardware widget */

  /* Depicts a change in TOUCHED state */
  onTouched(state: boolean): void {
    /* Ensure that this widget is part of a Stack*/
    if (this._stack) {
      this._touchedState = state;
      /* Generate a WidgetEvent and let the Stack relay the information */
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

  /* Depicts a change in value representation of the widget, when the change is relative
   * For example - encoder turned left of right is a relative change */
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

  /* Depicts a change in value representation of the widget, when the change is absolute
   * For example - fader being set to a particular value is an absolute change */
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

  /* Depicts a change in the PRESSED state */
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
    /* If the Widget was derived from hardware, don't do anything, otherwise forward the event as is to the UI ƒ*/
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
    /* Only UI Widgets can change their WidgetType. */
    if (this._derivedFromHardware) throw Error('cannot change type for a tilechain widget');
    if (!UIWidgetTypes.includes(type)) throw Error('cannot change type to a non-UI widget type');
    /* Can't update the type if the requested type is the same as the existing one */
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
      /* Tell the UI to receive this event */
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

/* Set of supported Widget Events which have a resemblance in the UI */
export enum WidgetEventType {
  TOUCH = 'TOUCH',
  PRESS = 'PRESS',
  CHANGE_RELATIVE = 'CHANGE_RELATIVE',
  CHANGE_ABSOLUTE = 'CHANGE_ABSOLUTE',
  TYPECHANGE = 'TYPECHANGE',
}

/* This interface is used to send messages to the UI */
export interface WidgetEvent {
  kind: string;
  source: string;
  stack: string;
  name: string;
  type: WidgetEventType;
  val: string | boolean | number;
}

/* Supported set of Widgets in the platform. Only the type of UI Widget can be changed */
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

/* A helper object to filter out the Widget Types which can be displayed on the UI */
export const UIWidgetTypes: WidgetType[] = [
  WidgetType.BUTTON,
  WidgetType.TOGGLE,
  WidgetType.SLIDER_VERTICAL,
  WidgetType.SLIDER_HORIZONTAL,
  WidgetType.SELECTOR_VERTICAL,
  WidgetType.SELECTOR_HORIZONTAL,
  WidgetType.EMPTY,
];
