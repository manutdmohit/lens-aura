declare module 'color-hash' {
  interface ColorHashOptions {
    lightness?: number | number[];
    saturation?: number | number[];
    hash?: string;
  }

  class ColorHash {
    constructor(options?: ColorHashOptions);
    hex(input: string): string;
    rgb(input: string): [number, number, number];
    hsl(input: string): [number, number, number];
  }

  export = ColorHash;
}
