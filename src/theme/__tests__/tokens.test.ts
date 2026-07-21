import { colorsForScheme, darkColors, lightColors } from '../tokens';

describe('colorsForScheme', () => {
  it('returns dark tokens for "dark"', () => {
    expect(colorsForScheme('dark')).toEqual(darkColors);
  });

  it('returns light tokens for "light"', () => {
    expect(colorsForScheme('light')).toEqual(lightColors);
  });
});
