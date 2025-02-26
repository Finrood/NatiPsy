import { describe, it, expect } from 'vitest'
import { generateMeta } from './seo'

describe('SEO Plugin', () => {
  it('generates correct meta tags for a post', () => {
    const mockPost = {
      title: 'Test Post',
      description: 'Test Description',
      image: '/test-image.jpg',
      date: '2024-01-01',
      author: { name: 'John Doe' },
      category: 'Test Category'
    }

    const meta = generateMeta(mockPost)

    expect(meta.title).toBe('Test Post')
    expect(meta.meta).toContainEqual({
      name: 'description',
      content: 'Test Description'
    })
    expect(meta.meta).toContainEqual({
      property: 'og:title',
      content: 'Test Post'
    })
    expect(meta.meta).toContainEqual({
      property: 'og:image',
      content: 'https://example.com/test-image.jpg'
    })
  })
}) 