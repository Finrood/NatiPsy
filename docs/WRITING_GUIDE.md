# Writing Blog Posts Guide

## Getting Started
1. Create a new .md file in the `content/blog` folder
2. Copy the template from `blog-template.md`
3. Fill in the frontmatter details
4. Write your content using markdown

## Markdown Basics
- **Headers**: Use # for main title, ## for sections
- **Lists**: Use - or * for bullet points
- **Links**: [Text](URL)
- **Images**: ![Alt text](/path/to/image.jpg)

## Adding Images
1. Add your images to the `public/assets/blog` folder
2. Reference them in your post using: ![Alt text](/assets/blog/your-image.jpg)

## Preview Your Post
1. Set `draft: true` in frontmatter while writing
2. View your draft at http://localhost:3000/blog/your-post-name
3. Set `draft: false` when ready to publish 