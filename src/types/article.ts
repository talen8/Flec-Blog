export interface Article {
  id: number
  title: string
  slug: string
  url: string
  content: string
  summary: string
  ai_summary?: string
  excerpt?: string
  cover?: string
  is_top: boolean
  view_count: number
  comment_count: number
  publish_time: string
  update_time: string
  location?: string
  author: {
    id: number
    email: string
    avatar: string
  }
  category: {
    id: number
    name: string
    slug: string
    url: string
  }
  tags: Array<{
    id: number
    name: string
    slug: string
    url: string
  }>
}
