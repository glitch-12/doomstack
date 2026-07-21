import { MIN_TOUCH_TARGET, hitSlopForSize } from '../constants';

describe('hitSlopForSize', () => {
  it('adds no hitSlop when the element already meets the minimum', () => {
    expect(hitSlopForSize(MIN_TOUCH_TARGET)).toEqual({ top: 0, bottom: 0, left: 0, right: 0 });
  });

  it('splits the deficit evenly across both sides when undersized', () => {
    expect(hitSlopForSize(24)).toEqual({ top: 10, bottom: 10, left: 10, right: 10 });
  });
});
