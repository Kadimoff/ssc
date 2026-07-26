import { useRef, useState } from 'react'
import { useStaggerCards } from '@/hooks/use-animations'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Newspaper } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PageContainer, PageHeading, PageLoading } from '@/app/app-shared'
import { useSnapshot } from '@/app/app-data'
import { articles } from '@/data/editorial-content'

export function NewsPage() {
  const { data } = useSnapshot()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const newsRef = useRef<HTMLDivElement>(null)
  useStaggerCards(newsRef, [data, selectedCategory])
  if (!data) return <PageLoading />

  const categories = ['All', 'Announcement', 'Community', 'Events', 'Startups', 'Research']
  const newsCards = articles

  const filtered = selectedCategory === 'All' ? newsCards : newsCards.filter((n) => n.category === selectedCategory)

  const categoryColors: Record<string, string> = {
    'Startups': 'from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/30',
    'Community': 'from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    'Announcement': 'from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/30',
    'Research': 'from-violet-500/20 to-violet-500/5 text-violet-600 dark:text-violet-400 border-violet-500/30',
    'Events': 'from-sky-500/20 to-sky-500/5 text-sky-600 dark:text-sky-400 border-sky-500/30',
  }

  return <PageContainer>
    <PageHeading eyebrow='News & Updates' title='What is happening in the community.' description='Follow the progress of student teams, events, and ecosystem news.' />
    <div className='mb-8 flex flex-wrap gap-2'>
      {categories.map((cat) => (
        <Button
          key={cat}
          size='sm'
          variant={selectedCategory === cat ? 'default' : 'outline'}
          className='rounded-full'
          onClick={() => setSelectedCategory(cat)}
        >
          {cat}
        </Button>
      ))}
    </div>
    <div ref={newsRef} className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
      {filtered.map((card) => (
        <div key={card.slug} data-card>
          <Card className='group overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 border-primary/5'>
            <div className='h-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent' />
            <CardHeader>
              <Badge className={`w-fit border bg-gradient-to-br ${categoryColors[card.category] || categoryColors['Community']}`} variant='secondary'>
                {card.category}
              </Badge>
              <CardTitle className='mt-2 tracking-tight text-lg'>{card.title}</CardTitle>
              <CardDescription className='leading-relaxed text-balance line-clamp-3'>{card.summary}</CardDescription>
            </CardHeader>
            <CardFooter className='justify-between border-t pt-4'>
              <span className='text-xs text-muted-foreground'>{card.date}</span>
              <Button variant='ghost' size='sm' className='gap-1 text-xs' asChild><Link to='/news/$slug' params={{ slug: card.slug }}>Read more <ChevronRight className='size-3' /></Link></Button>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
    {filtered.length === 0 && (
      <Card className='border-dashed border-muted-foreground/20 py-16 text-center'>
        <CardContent><Newspaper className='mx-auto mb-3 size-10 text-muted-foreground' /><p className='text-lg font-medium'>No news in this category</p></CardContent>
      </Card>
    )}
  </PageContainer>
}
