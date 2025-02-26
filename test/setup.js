import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Nuxt components
config.global.stubs = {
  'NuxtLink': true,
  'NuxtImg': true,
  'ContentDoc': true,
  'BlogHeader': true,
  'TableOfContents': true,
  'BlogPostEmpty': true,
  'BlogPostNotFound': true,
  'BlogShare': true,
  'BlogRelatedPosts': true
}

// Mock Nuxt composables and functions
global.defineNuxtPlugin = vi.fn((callback) => callback())
vi.mock('#imports', () => ({
  defineNuxtPlugin: vi.fn((callback) => callback()),
  useRoute: () => ({
    path: '/test-path'
  }),
  useAsyncData: vi.fn(() => ({
    data: { value: {} }
  }))
})) 