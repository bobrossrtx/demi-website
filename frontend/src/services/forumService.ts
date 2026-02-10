import axios from 'axios';

// For GitHub Codespaces or when frontend is served by backend, use relative path
// For local dev with separate frontend server, use REACT_APP_API_URL
const API_URL = process.env.REACT_APP_API_URL || '';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category_id: string;
  author_id: string;
  upvote_count: number;
  view_count: number;
  comment_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}

export interface PostWithDetails extends Post {
  author_username: string;
  author_display_name?: string;
  author_avatar_url?: string;
  category_name: string;
  category_slug: string;
  user_upvoted: boolean;
  user_bookmarked: boolean;
  bookmark_count: number;
  tags?: string[];
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_comment_id?: string;
  upvote_count: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await axios.get(`${API_URL}/api/forum/categories`);
  return response.data;
};

export const createCategory = async (data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}): Promise<Category> => {
  const response = await axios.post(`${API_URL}/api/forum/categories`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateCategory = async (
  id: string,
  data: Partial<Category>
): Promise<Category> => {
  const response = await axios.put(`${API_URL}/api/forum/categories/${id}`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/api/forum/categories/${id}`, {
    headers: getAuthHeader(),
  });
};

// Posts
export const getPosts = async (): Promise<PaginatedResponse<PostWithDetails>> => {
  const response = await axios.get(`${API_URL}/api/forum/posts`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getPost = async (id: string): Promise<PostWithDetails> => {
  const response = await axios.get(`${API_URL}/api/forum/posts/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createPost = async (data: {
  title: string;
  content: string;
  category_id: string;
  tags?: string[];
}): Promise<Post> => {
  const response = await axios.post(`${API_URL}/api/forum/posts`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updatePost = async (
  id: string,
  data: Partial<{ title: string; content: string; category_id: string; tags: string[] }>
): Promise<Post> => {
  const response = await axios.put(`${API_URL}/api/forum/posts/${id}`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deletePost = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/api/forum/posts/${id}`, {
    headers: getAuthHeader(),
  });
};

export const pinPost = async (id: string): Promise<Post> => {
  const response = await axios.post(
    `${API_URL}/api/forum/posts/${id}/pin`,
    {},
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

export const unpinPost = async (id: string): Promise<Post> => {
  const response = await axios.post(
    `${API_URL}/api/forum/posts/${id}/unpin`,
    {},
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

export const lockPost = async (id: string): Promise<Post> => {
  const response = await axios.post(
    `${API_URL}/api/forum/posts/${id}/lock`,
    {},
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

export const unlockPost = async (id: string): Promise<Post> => {
  const response = await axios.post(
    `${API_URL}/api/forum/posts/${id}/unlock`,
    {},
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

// Comments
export const getComments = async (postId: string): Promise<Comment[]> => {
  const response = await axios.get(`${API_URL}/api/forum/posts/${postId}/comments`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const createComment = async (
  postId: string,
  content: string,
  parentCommentId?: string
): Promise<Comment> => {
  const response = await axios.post(
    `${API_URL}/api/forum/posts/${postId}/comments`,
    { content, parent_comment_id: parentCommentId },
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

export const deleteComment = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/api/forum/comments/${id}`, {
    headers: getAuthHeader(),
  });
};

// Votes
export const toggleVote = async (postId?: string, commentId?: string): Promise<{ voted: boolean }> => {
  const response = await axios.post(
    `${API_URL}/api/forum/vote`,
    { post_id: postId, comment_id: commentId },
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

// Bookmarks
export const toggleBookmark = async (postId: string): Promise<{ bookmarked: boolean }> => {
  const response = await axios.post(
    `${API_URL}/api/forum/posts/${postId}/bookmark`,
    {},
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};
