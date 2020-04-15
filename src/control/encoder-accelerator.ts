class EncoderAccelerator {
  samples: number;
  encoderLevels: number[];
  constructor() {
    this.encoderLevels = [];
    this.samples = 16;
    for (let i = 0; i < this.samples; i++) {
      this.encoderLevels[i] = 1 + 4 * Math.pow(2, -i / 2);
    }
  }
}

export const defaultEncoderAccelarator: EncoderAccelerator = new EncoderAccelerator();
Object.seal(defaultEncoderAccelarator);
