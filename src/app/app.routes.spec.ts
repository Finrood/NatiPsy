import { routes } from './app.routes';

describe('application routes', () => {
  it('keeps the article component out of the initial route module', async () => {
    const blogRoute = routes.find(route => route.path === 'blog');
    const articleRoute = blogRoute?.children?.find(route => route.path === ':slug');

    expect(articleRoute?.component).toBeUndefined();
    expect(articleRoute?.loadComponent).toBeDefined();

    const loadedComponent = await articleRoute!.loadComponent!();
    expect(loadedComponent).toBeTruthy();
  });
});
