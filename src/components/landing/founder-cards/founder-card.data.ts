import type { FounderProfile } from './founder-card.types'

/** Real-feeling, diverse student founders. GreenStack ties into the existing
 *  landing news ("GreenStack Raises Pre-Seed"). No tiers, no trust scores. */
export const founderCards: FounderProfile[] = [
  {
    id: 'aysel',
    name: 'Aysel Məmmədova',
    role: 'Founder & CEO',
    startup: 'GreenStack',
    university: 'Baku State University',
    program: 'Computer Science · 3rd year',
    building: 'Climate-tech app that tracks and reduces campus energy use across university buildings.',
    stage: 'mvp',
    skills: ['React', 'Sustainability', 'Product'],
    lookingFor: 'a technical co-founder',
    traction: 'Piloting at 2 faculties',
  },
  {
    id: 'reshad',
    name: 'Rəşad Quliyev',
    role: 'Founder',
    startup: 'EduFlow',
    university: 'ADA University',
    program: 'Information Tech · 2nd year',
    building: 'AI study companion that turns lecture recordings into adaptive practice questions.',
    stage: 'validation',
    skills: ['Python', 'ML', 'Pedagogy'],
    lookingFor: 'a product designer',
    traction: '340 student sign-ups',
  },
  {
    id: 'leyla',
    name: 'Leyla Əliyeva',
    role: 'Founder & CEO',
    startup: 'MediMatch',
    university: 'UNEC',
    program: 'Business · Final year',
    building: 'Marketplace connecting students with affordable verified medical professionals.',
    stage: 'revenue',
    skills: ['Operations', 'Health', 'Strategy'],
    lookingFor: 'seed investment',
    traction: '$2.1k MRR · 18 providers',
  },
]
