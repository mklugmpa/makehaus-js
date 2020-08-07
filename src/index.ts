/*
This file is part of MakeHaus JS, the MakeHaus API for Node.js, released under AGPL-3.0 license.
(c) 2019, 2020 MakeProAudio GmbH and Node.js contributors. All rights reserved.
*/

import { hub } from './control/hub';
import { diagnostics } from './diagnostics';
import { autoAnimate } from './autoanimate';
import { LedButton, LedButtonEvents } from './tcwidget/ledbutton';
import { Encoder, EncoderEvents } from './tcwidget/encoder';
import { MotorFader, MotorFaderEvents } from './tcwidget/motorfader';
import { Tile } from './control/api-base';
import { TileLedButton12, TileLedButton8 } from './control/api-butled';
import { TileEncoder12, TileEncoder8 } from './control/api-encoder';
import { TileFader4 } from './control/api-fader';
import { registry, CallbackMsg, Interest, RegisteredObject } from './registry/registry';
import { Stacks } from './stack/stacks';
import { Widgets } from './widget/widgets';
import { Rows } from './row/rows';
import { Row } from './row/row';
import { Stack } from './stack/stack';
import { WidgetType, Widget } from './widget/widget';
import { LayoutParser } from './parser/parser';
import { MakeHaus } from './launch';

export { hub, diagnostics, autoAnimate };
export { LedButton, LedButtonEvents };
export { Encoder, EncoderEvents };
export { MotorFader, MotorFaderEvents };

export { Tile };
export { TileLedButton12, TileLedButton8 };
export { TileEncoder12, TileEncoder8 };
export { TileFader4 };

export { registry, CallbackMsg, Interest, RegisteredObject };

export { Row, Rows };
export { Stack, Stacks };
export { Widget, Widgets };
export { WidgetType };

export { LayoutParser };
export { MakeHaus };

/*
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const argv = require('yargs').argv;
let layoutPath = '';
if (argv.device === 'mobile') {
  console.log("running mobile. If you don't see the 'INITIALIZED' message, the HW UI did not boot or get configured properly");
  layoutPath = process.env.MOBILE!;
} else {
  console.log("running tablet. If you don't see the 'INITIALIZED' message, the HW UI did not boot or get configured properly");
  layoutPath = process.env.TABLET!;
}

const layoutJson = fs.readFileSync(layoutPath);
const repl = require('repl');
MakeHaus.init(layoutJson, () => {
  console.log('INITIALIZED');
  repl.start({
    prompt: 'makehaus> ',
    replMode: repl.REPL_MODE_STRICT,
    ignoreUndefined: true,
  }).context.Stacks = Stacks;
});
*/

/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 *
const model;
param = model.getParameter('nameOfParam')

//a Stack IS a Parameter
//Parameters can be bound to each other.
stack.bindFrom(param)
stack.bindTo(param)
stack.unbind(param)
stack.setContext('context-string') //sets context on Parameter
stack.setLabel('label') //sets label on the parameter
stack.setColor('color')//sets color on the parameter
*/
