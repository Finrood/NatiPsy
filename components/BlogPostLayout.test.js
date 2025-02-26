import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogPostLayout from './BlogPostLayout.vue'

describe('BlogPostLayout', () => {
  const mockPost = {
    title: 'Test Post',
    description: 'Test Description',
    date: '2024-01-01T12:00:00.000Z',
    author: {
      name: 'John Doe',
      avatar: '/test-avatar.jpg',
      bio: 'Test Bio'
    },
    category: 'Test Category',
    readTime: '5 min read'
  }

  it('renders post title correctly', () => {
    const wrapper = mount(BlogPostLayout, {
      props: {
        post: mockPost
      },
      global: {
        stubs: {
          'ContentDoc': true
        }
      }
    })
    
    const title = wrapper.find('h1')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Test Post')
  })

  it('formats date correctly', () => {
    const wrapper = mount(BlogPostLayout, {
      props: {
        post: mockPost
      },
      global: {
        stubs: {
          'ContentDoc': true
        }
      }
    })
    
    const time = wrapper.find('time')
    expect(time.exists()).toBe(true)
    const expectedDate = new Date('2024-01-01T12:00:00.000Z')
      .toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      })
    expect(time.text()).toBe(expectedDate)
  })
}) 