import { useHttp } from '~/core/composables/useHttp'

export interface PostDto {
  url: string
  title: string
  content: string
}

export interface Post {
  id: number
  url: string
  title: string
  content: string
}

export function addPost(body: PostDto) {
  const http = useHttp()
  return http<Post>('/posts', { method: 'POST', body })
}

export function listPosts() {
  const http = useHttp()
  return http<Post[]>('/posts')
}

export function getPost(id: number | string) {
  const http = useHttp()
  return http<Post>(`/posts/${id}`)
}
