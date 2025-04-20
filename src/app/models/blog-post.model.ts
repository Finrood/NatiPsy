export interface BlogPost {
    slug: string;
    title: string;
    date: Date;
    description: string;
    image: string | null;
    categories: string[];
    content: string;
    readTime: number | null;
    author?: {
      name: string;
      bio?: string;
      avatar?: string;
    };
  }
