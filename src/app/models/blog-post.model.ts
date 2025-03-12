export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    description: string;
    image?: string;
    categories: string[];
    content: string;
    readTime?: string;
    author?: {
      name: string;
      bio?: string;
      avatar?: string;
    };
  }