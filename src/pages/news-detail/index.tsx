import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, CalendarDays, CheckCircle2, Newspaper } from 'lucide-react'
import { articles } from '@/data/editorial-content'
import { PageContainer } from '@/app/app-shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function NewsDetailPage() {
  const { slug } = useParams({ from: '/app/news/$slug' })
  const article = articles.find((item) => item.slug === slug)
  if (!article) return <PageContainer><Card><CardContent className='py-20 text-center'>Article not found.</CardContent></Card></PageContainer>
  return <PageContainer><Button variant='ghost' asChild className='mb-5'><Link to='/news'><ArrowLeft />Back to news</Link></Button><article className='mx-auto max-w-4xl'><header className='mb-8'><Badge>{article.category}</Badge><h1 className='mt-4 text-4xl font-bold tracking-tight sm:text-5xl'>{article.title}</h1><p className='mt-4 text-xl leading-8 text-muted-foreground'>{article.summary}</p><div className='mt-5 flex items-center gap-2 text-sm text-muted-foreground'><CalendarDays className='size-4' />{article.date} · SSC Editorial</div></header><Card><CardContent className='space-y-5 p-7 text-[17px] leading-8'>{article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</CardContent></Card><Card className='mt-5'><CardHeader><CardTitle className='flex items-center gap-2'><Newspaper className='text-primary' />Key takeaways</CardTitle></CardHeader><CardContent className='space-y-3'>{article.takeaways.map((item) => <div key={item} className='flex items-center gap-2'><CheckCircle2 className='size-4 text-emerald-500' />{item}</div>)}</CardContent></Card></article></PageContainer>
}
