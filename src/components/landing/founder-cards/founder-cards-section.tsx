import { FounderCard } from './founder-card'
import { founderCards } from './founder-card.data'
import './founder-cards.css'

export function FounderCardsSection() {
  return <section id='founder-cards' data-landing-section='founder-cards' className='founder-cards-section'>
    <div className='app-container'>
      <div className='founder-cards-heading'>
        <span>Founders in residence</span>
        <h2>Meet the builders turning ideas into real startups.</h2>
        <p>Verified student founders from across the ecosystem — what they&rsquo;re building, how far along it is, and what they need next.</p>
      </div>
      <div className='founder-cards-grid'>
        {founderCards.map((profile) => <FounderCard key={profile.id} profile={profile} />)}
      </div>
    </div>
  </section>
}
