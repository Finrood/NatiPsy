import { formatBlogDate } from './blog-post.model';

describe('blog date formatting', () => {
  it('formats a date-only value in Portuguese without timezone drift', () => {
    const formatted = formatBlogDate('2025-04-21');

    expect(formatted).toContain('21');
    expect(formatted.toLowerCase()).toContain('abril');
    expect(formatted).toContain('2025');
  });
});
