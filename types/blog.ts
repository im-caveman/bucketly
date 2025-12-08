// Blog-related TypeScript types

export type BlogCategory = 'guide' | 'challenge' | 'inspiration' | 'how-to';
export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image_url: string | null;
    category: BlogCategory;
    tags: string[];
    author_id: string;
    status: BlogStatus;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    view_count: number;
    reading_time_minutes: number;
    meta_title: string | null;
    meta_description: string | null;
    is_featured: boolean;
}

export interface BlogPostWithAuthor extends BlogPost {
    author: {
        id: string;
        username: string;
        full_name: string | null;
        avatar_url: string | null;
        bio: string | null;
        stats?: {
            totalPoints: number;
            itemsCompleted: number;
            globalRank: number | null;
        };
        social?: {
            twitter: string | null;
            instagram: string | null;
            linkedin: string | null;
            github: string | null;
            website: string | null;
        };
    };
}

export interface BlogLike {
    id: string;
    post_id: string;
    user_id: string;
    created_at: string;
}

export interface BlogPostFormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_image_url: string;
    category: BlogCategory;
    tags: string[];
    status: BlogStatus;
    meta_title?: string;
    meta_description?: string;
    is_featured: boolean;
}

export interface BlogListFilters {
    category?: BlogCategory;
    status?: BlogStatus;
    search?: string;
    featured?: boolean;
}

export interface BlogPostMetadata {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    canonicalUrl: string;
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
}
