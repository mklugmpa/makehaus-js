import { Widget, WidgetBase, WidgetType } from './widget';
import { TCWidget } from '../tcwidget/tcwidget-base';
import { EventEmitter } from 'events';

class WidgetRegistry {
  private widgets: Map<string, Widget> = new Map();
  private events: EventEmitter = new EventEmitter();

  constructor() {
    this.events.on('layout-parsed', () => {});
  }

  get = (name: string): Widget | undefined => {
    return this.widgets.get(name);
  };

  getAll = (): Widget[] => {
    return Array.from(this.widgets.values());
  };

  createOrGet = (name: string, type: WidgetType, weight?: number): Widget => {
    let widget = this.widgets.get(name);
    if (!widget) {
      widget = new WidgetBase(name, type, weight);
      this.widgets.set(name, widget);
    }
    return widget;
  };

  createFromHardwareWidget = (name: string, hardwareWidget: TCWidget): Widget => {
    if (!this.widgets.get(name)) {
      const w: WidgetBase = new WidgetBase(name, hardwareWidget.type());
      w._setDerivedFromHardware(hardwareWidget);
      this.widgets.set(name, w);
      return w as Widget;
    } else {
      throw Error(`widget with name ${name} already exists - cannot recreate`);
    }
  };

  remove = (name: string) => {
    let w: Widget | undefined | null = this.widgets.get(name);
    if (w) {
      this.widgets.delete(name);
      w = null;
    }
  };
}

export const Widgets: WidgetRegistry = new WidgetRegistry();
Object.seal(Widgets);
