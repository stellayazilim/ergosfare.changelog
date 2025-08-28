import { Feed } from 'feed'
import path from 'node:path'
import * as fs from 'node:fs'
import matter from 'gray-matter'
export const revalidate = 60

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl)
    throw new Error('Missing NEXT_PUBLIC_SITE_URL environment variable')

  const author = {
    name: 'Kerim Çetinbaş',
    email: 'a.cetinbas@icloud.com',
  }

  const feed = new Feed({
    title: 'Ergosfare',
    description: 'Modern Mediator for .NET developers',
    author,
    id: siteUrl,
    link: siteUrl,
    image: `${siteUrl}/favicon.ico`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
    },
  })

  // Path to your MDX posts
  const postsDir = path.join(process.cwd(), 'src/app')

  // Read all MDX files
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'))

  for (const file of files) {
    const filePath = path.join(postsDir, file)
    const source = fs.readFileSync(filePath, 'utf-8')

    const { data, content } = matter(source) // parse frontmatter
    const slug = file.replace(/\.mdx?$/, '')
    const url = `${siteUrl}/posts/${slug}`

    feed.addItem({
      title: data.title || slug,
      id: url,
      link: url,
      content,
      author: [author],
      contributor: [author],
      date: new Date(data.date || Date.now()),
    })
  }

  return new Response(feed.rss2(), {
    status: 200,
    headers: {
      'content-type': 'application/xml',
      'cache-control': 'max-age=31556952', // 1 year
    },
  })
}
