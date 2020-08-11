/*
This file is part of MakeHaus JS, the MakeHaus API for Node.js, released under AGPL-3.0 license.
(c) 2019, 2020 MakeProAudio GmbH and Node.js contributors. All rights reserved.
*/

class EncoderAccelerator {
  samples: number;
  encoderLevels: number[];
  constructor() {
    this.encoderLevels = [];
    this.samples = 16;
    for (let i = 0; i < this.samples; i++) {
      this.encoderLevels[i] = 1 + 9 * Math.pow(2, -i / 2);
    }
  }
}

export const defaultEncoderAccelarator: EncoderAccelerator = new EncoderAccelerator();
Object.seal(defaultEncoderAccelarator);
