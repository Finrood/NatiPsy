import { buildRenderUrl, isPathInsideRoot } from './server';

describe('SSR server hardening', () => {
  it('rejects prefix-sharing paths outside the browser root', () => {
    expect(isPathInsideRoot('/srv/browser', '/srv/browser/blog/index.html')).toBe(true);
    expect(isPathInsideRoot('/srv/browser', '/srv/browser-evil/index.html')).toBe(false);
    expect(isPathInsideRoot('/srv/browser', '/srv/browser/../secret')).toBe(false);
  });

  it('builds render URLs from configured origin rather than request headers', () => {
    expect(buildRenderUrl(new URL('https://psicologanataliaferreira.com/'), '/blog/post?x=1'))
      .toBe('https://psicologanataliaferreira.com/blog/post?x=1');
  });
});
