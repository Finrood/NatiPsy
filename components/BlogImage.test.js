import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BlogImage from './BlogImage.vue'

describe('BlogImage', () => {
  it('renders image with correct props', () => {
    const props = {
      src: '/test-image.jpg',
      alt: 'Test Image',
      width: 800,
      height: 600,
      caption: 'Test Caption'
    }

    const wrapper = mount(BlogImage, { props })
    const img = wrapper.find('img')
    
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/test-image.jpg')
    expect(img.attributes('alt')).toBe('Test Image')
    expect(wrapper.find('figcaption').text()).toBe('Test Caption')
  })

  it('does not render caption when not provided', () => {
    const props = {
      src: '/test-image.jpg',
      alt: 'Test Image',
      width: 800,
      height: 600
    }

    const wrapper = mount(BlogImage, { props })
    expect(wrapper.find('figcaption').exists()).toBe(false)
  })
}) 