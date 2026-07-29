export function FounderTags({ tags }: { tags: string[] }) {
  return (
    <ul className='founder-tags' aria-label='Founder skills'>
      {tags.slice(0, 3).map((tag) => <li key={tag}>{tag}</li>)}
    </ul>
  )
}
