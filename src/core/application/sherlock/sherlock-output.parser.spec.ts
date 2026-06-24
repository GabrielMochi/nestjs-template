import { parseSherlockLine } from './sherlock-output.parser';

describe('parseSherlockLine', () => {
  it('parses status messages', () => {
    expect(parseSherlockLine('[*] Checking username foo on:')).toEqual({
      type: 'message',
      message: 'Checking username foo on:',
    });
  });

  it('parses found results', () => {
    expect(parseSherlockLine('[+] TikTok: https://www.tiktok.com/@foo')).toEqual({
      type: 'found',
      site: 'TikTok',
      url: 'https://www.tiktok.com/@foo',
    });
  });

  it('ignores blank and unsupported lines', () => {
    expect(parseSherlockLine('')).toBeNull();
    expect(parseSherlockLine('Traceback: /private/path')).toBeNull();
  });
});
