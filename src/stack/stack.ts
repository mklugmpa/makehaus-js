import { Widget, UIWidget, WidgetBase, WidgetEventType, WidgetEvent, WidgetType } from '../widget/widget';
import { Parameter, ParameterTypeChangeRequest, ParameterTypeChangeRequestToken, ParameterType, ParameterChangeEvent } from '@makeproaudio/parameters-js';
import _ from 'lodash';

export interface Stack {
  name(): string;
  addWidget(widget: Widget): void;
  removeWidget(widget: Widget): void;
  removeWidget(name: string): void;
  widgets(): Widget[];

  label(): string;
  setLabel(label: string): void;

  context(): string;
  setContext(context: string): void;

  setHsl(hue: number, saturation: number, lightness: number): void;
  setColor(color: string): void;
  color(): string;

  value(): any;
  setValue(value: any): void;

  /* helper function to all setType for each widget which belongs to this stack */
  setWidgetsType(type: WidgetType): void;

  setParameterType(req: ParameterTypeChangeRequest): void;
  bindTo(param: Parameter, callback: (parameterChangeEvent: ParameterChangeEvent<any>) => void): void;
  bindFrom(param: Parameter, callback: (parameterChangeEvent: ParameterChangeEvent<any>) => void): void;
}

export interface UIStack {
  name: string;
  context: string;
  label: string;
  color?: string;
  widgets: UIWidget[];
  min?: number;
  max?: number;
  value: string | number | boolean;
  values?: string[] | number[] | boolean;
}

export class StackBase implements Stack {
  sync(): void {
    if (this._parameter) {
      this.setColor(this.color());
      this.setAbsoluteValue(this.value());
    }
  }

  label(): string {
    if (this._parameter) {
      return this._parameter.getMetadata('label');
    }
    return '';
  }

  setLabel(label: string) {
    if (this._parameter) {
      this._parameter.setMetadata('label', label);
    }
  }

  context(): string {
    if (this._parameter) {
      return this._parameter.getMetadata('context');
    }
    return '';
  }

  setContext(context: string) {
    if (this._parameter) {
      this._parameter.setMetadata('context', context);
    }
  }

  color(): string {
    if (this._parameter) {
      return this._parameter.getMetadata('color');
    }
    return '';
  }

  setHsl(hue: number, saturation: number, lightness: number) {
    if (hue < 0 || hue > 360 || saturation < 0 || saturation > 1 || lightness < 0 || lightness > 1) {
      console.log('received invalid arguments for hsl');
    } else {
      this.setColor(this.hslToRgb(hue, saturation, lightness));
    }
  }

  hslToRgb = (hue: number, saturation: number, lightness: number): string => {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    let huePrime = hue / 60;
    const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

    huePrime = Math.floor(huePrime);
    let red;
    let green;
    let blue;

    if (huePrime === 0) {
      red = chroma;
      green = secondComponent;
      blue = 0;
    } else if (huePrime === 1) {
      red = secondComponent;
      green = chroma;
      blue = 0;
    } else if (huePrime === 2) {
      red = 0;
      green = chroma;
      blue = secondComponent;
    } else if (huePrime === 3) {
      red = 0;
      green = secondComponent;
      blue = chroma;
    } else if (huePrime === 4) {
      red = secondComponent;
      green = 0;
      blue = chroma;
    } else if (huePrime === 5) {
      red = chroma;
      green = 0;
      blue = secondComponent;
    }

    const lightnessAdjustment = lightness - chroma / 2;
    red += lightnessAdjustment;
    green += lightnessAdjustment;
    blue += lightnessAdjustment;

    return (
      '#' +
      _.padStart(Math.round(red * 255).toString(16), 2, '0') +
      _.padStart(Math.round(green * 255).toString(16), 2, '0') +
      _.padStart(Math.round(blue * 255).toString(16), 2, '0')
    );
  };

  setColor(color: string): void {
    if (this._parameter) {
      this._parameter.setMetadata('color', color);
    }
  }

  setParameterType(req: ParameterTypeChangeRequest): void {
    if (this._parameter) {
      this._parameter.updateType(req);
    }
  }

  bindTo(param: Parameter, callback: (parameterChangeEvent: ParameterChangeEvent<any>) => void): void {
    if (this._parameter) {
      param.bindFrom(this._parameter, callback);
    }
  }

  bindFrom(param: Parameter): void {}

  private _widgets: Map<string, Widget> = new Map();
  private _name: string;
  private _parameter: Parameter | undefined;

  constructor(name: string) {
    this._name = name;
  }

  setValue(val: any): void {
    if (this._parameter) {
      this._parameter.update(val);
    }
  }

  value(): any {
    if (this._parameter) {
      return this._parameter!.value();
    }
  }

  private raiseUIEvent(evt: StackEvent): void {
    this.widgets().forEach(w => {
      const wb: WidgetBase = w as WidgetBase;
      if (this._parameter) {
        wb.setProperty(evt, { min: this._parameter!.getMetadata('min'), max: this._parameter!.getMetadata('max') });
      }
    });
  }

  /* One of the Stack's responsibilities is to multiplex the communication between the hardware and the software widgets
   * This function is dedicated to incoming events from the hardware */
  onWidgetEvent(evt: WidgetEvent): void {
    switch (evt.type) {
      /* Hardware widget was Pressed */
      case WidgetEventType.PRESS:
        /* For every widget part of this stack, tell the widget that its PRESSED state was changed */
        this.widgets().map(w => (w as WidgetBase).setPressedState(evt));
        /* Depending on the application logic, update the value of the parameter */
        if (evt.val === false) {
          if (this.parameter()) {
            this.parameter()!.updateCyclic();
          }
        }
        break;
      case WidgetEventType.TOUCH:
        /* For every widget part of this stack, tell the widget that its TOUCH state was changed */
        this.widgets().map(w => (w as WidgetBase).setTouchedState(evt));
        break;
      case WidgetEventType.CHANGE_RELATIVE:
        /* Depending on the application logic, update the value of the parameter */
        if (this.parameter()) {
          if (evt.val >= 0) this.parameter()!.updateNext(Math.abs(evt.val as number));
          if (evt.val < 0) this.parameter()!.updatePrevious(Math.abs(evt.val as number));
        }
        break;
      case WidgetEventType.CHANGE_ABSOLUTE:
        /* Depending on the application logic, update the value of the parameter */
        if (this.parameter()) this.parameter()!.updateRanged(evt.val as number);
        break;
      default:
        break;
    }
  }

  name(): string {
    return this._name;
  }

  /* Add a Widget object to this stack */
  addWidget(widget: Widget): void {
    if (!this._widgets.get(widget.name())) {
      const wb: WidgetBase = widget as WidgetBase;
      wb.setStack(this);
      this._widgets.set(widget.name(), widget);
    } else {
      throw Error(`widget with name ${widget.name} already exists in stack ${this._name} - cannot add`);
    }
  }

  removeWidget(widget: Widget): void;
  removeWidget(name: string): void;

  /* Remove a Widget object from this stack */
  removeWidget(widget: any) {
    if (this._widgets.get(widget.name())) {
      this._widgets.delete(widget.name());
    } else {
      throw Error(`widget with name ${widget.name} does not exist in stack ${this._name} - cannot remove`);
    }
  }

  widgets(): Widget[] {
    return Array.from(this._widgets.values());
  }

  setParameter(param: Parameter): void {
    this._parameter = param;
    this._parameter.addListener(paramEvent => {
      if (paramEvent.value !== undefined) {
        const evt: StackEvent = {
          kind: 'stackevent',
          source: this._name,
          name: this.name(),
          type: StackEventType.VALUE,
          val: paramEvent.value,
        };
        this.raiseUIEvent(evt);
      } else if (paramEvent.metadataUpdated) {
        const evt: StackEvent = {
          kind: 'stackevent',
          source: this._name,
          name: this.name(),
          type: StackEventType.UNKNOWN,
          val: paramEvent.metadataUpdated.value,
        };
        switch (paramEvent.metadataUpdated.key) {
          case 'color':
            evt.type = StackEventType.COLOR;
            break;
          case 'label':
            evt.type = StackEventType.LABEL;
            break;
          case 'context':
            evt.type = StackEventType.CONTEXT;
            break;
          case ParameterTypeChangeRequestToken:
            evt.type = StackEventType.TYPECHANGE;
            const superParam: Parameter = paramEvent.parameter as Parameter;
            evt.val = {
              type: superParam.getType(),
              min: superParam.getMin(),
              max: superParam.getMax(),
              step: superParam.getStep(),
              possibleValues: superParam.getPossibleValues(),
            };
            this.deduceNewType(superParam.getType());
            break;
        }
        this.raiseUIEvent(evt);
      }
    });
  }

  deduceNewType(type: ParameterType) {
    switch (type) {
      case ParameterType.BOOLEAN:
        this.setWidgetsType(WidgetType.TOGGLE);
        break;
      case ParameterType.NUMBER || ParameterType.NUMBER_ARRAY:
        this.setWidgetsType(WidgetType.SLIDER_HORIZONTAL);
        break;
      case ParameterType.STRING || ParameterType.STRING_ARRAY:
        this.setWidgetsType(WidgetType.SELECTOR_HORIZONTAL);
        break;
    }
  }

  setAbsoluteValue(val: string | number): void {
    if (this._parameter) {
      this._parameter.update(val, true);
    }
  }

  setRelativeValue(val: number): void {
    if (this._parameter) {
      if (typeof this._parameter.value() === 'number') {
        const currVal: number = this._parameter.value() as number;
        this._parameter!.update(currVal + val);
      }
    }
  }

  unsetParameter(): void {
    throw new Error('Method not implemented.');
  }

  parameter(): Parameter | undefined {
    return this._parameter;
  }

  setWidgetsType(type: WidgetType): void {
    try {
      this.widgets().forEach(w => w.setType(type));
    } catch (err) {
      console.log(err);
    }
  }
}

export interface StackEvent {
  kind: string;
  source: string;
  name: string;
  type: StackEventType;
  val: number | string | boolean | {};
}

export enum StackEventType {
  VALUE = 'VALUE',
  COLOR = 'COLOR',
  CONTEXT = 'CONTEXT',
  LABEL = 'LABEL',
  UNKNOWN = 'UNKNOWN',
  TYPECHANGE = 'TYPECHANGE',
}

export interface StackTypeChangeRequest extends ParameterTypeChangeRequest {}
