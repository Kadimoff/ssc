# Implementation Plan

Feed, Network (Members) və Communities səhifələrinin dizaynını müasir, təmiz və daha professional görünüşə yeniləmək.

Hal-hazırkı Feed səhifəsi (56-572) 3 column-lı layoutda işləyir: solda profil summary, ortada postlar, sağda "People to meet" və "Trending now". Network səhifəsi (597-604) card grid-lə istifadəçiləri göstərir. Communities səhifəsi (609-616) card grid-lə icmaları göstərir. Hər üç səhifə eyni vizual dildən istifadə edir, lakin vizual təqdimat baxımından zəifdir - postlar düz mətn kimi görünür, network cardları çox sadədir, komuniti cardları isə kifayət qədər maraqlı deyil. Plan hər üç səhifə üçün ayrı-ayrılıqda vizual təkmilləşdirmələr aparmaqdır: Feed-də post card-larını zənginləşdirmək, Network-də member card-larını daha cəlbedici etmək, Communities-də icma card-larını daha informativ və gözəl göstərmək.

[Types]
Heç bir yeni tip əlavə olunmayacaq, mövcud tiplər dəyişməyəcək.

Mövcud tiplər (`Post`, `User`, `Community`, `Job`, `Snapshot`) dəyişməz qalır. Yalnız mövcud datanın UI-da təqdimatı dəyişəcək.

[Files]
Yalnız bir faylda dəyişiklik olacaq: `src/app.tsx`.

**Dəyişdiriləcək fayllar:**
- `src/app.tsx` — FeedPage, NetworkPage, CommunitiesPage funksiyalarının JSX strukturu və stil təkmilləşdirmələri

**Dəyişməyəcək fayllar:**
- `src/styles.css` — heç bir dəyişiklik (Tailwind utility class-lar kifayət edir)
- `src/data/types.ts` — tip dəyişikliyi yoxdur
- `src/data/demo-client.ts` — backend dəyişikliyi yoxdur
- `src/data/landing-content.ts` — content dəyişikliyi yoxdur
- `src/pages/` — ayrı səhifələr dəyişmir

[Functions]
Heç bir yeni funksiya yazılmayacaq. Mövcud funksiyaların JSX return hissələri yenilənəcək.

**Dəyişdiriləcək funksiyalar (`src/app.tsx`):**

1. **`FeedPage`** (sətir 555-572) — əsaslı şəkildə yenidən qurulacaq:
   - Post card-ları daha zəngin görünüş alacaq (hover effektləri, gradient hairlines, better typography)
   - "People to meet" aside bölməsi daha cəlbedici olacaq (avatar + bio + connect button)
   - "Trending now" bölməsi daha vizual maraqlı olacaq (trend items with icons, gradients)
   - Post create card-ı daha minimalist və təmiz görünəcək
   - Soldakı ProfileSummary daha yaxşı görünəcək

2. **`PostCard`** (sətir 574-582) — post card dizaynı yenilənəcək:
   - Daha yaxşı spacing, typography
   - Hover zamanı border highlight
   - Preview card (link preview) daha gözəl görünüş
   - Action buttons daha aydın və cəlbedici

3. **`NetworkPage`** (sətir 597-604) — member siyahısı yenidən qurulacaq:
   - PersonCard daha zəngin olacaq (cover gradient, better avatar display, skills badges daha gözəl)
   - Grid layout daha responsive
   - Search input daha stilizə olunacaq

4. **`PersonCard`** (sətir 606) — member card yenilənəcək:
   - Gradient top border və ya background
   - Avatar daha böyük və mərkəzi
   - Skills badges daha yaxşı düzülüş
   - Connect button daha prominent

5. **`CommunitiesPage`** (sətir 609-616) — icma siyahısı yenidən qurulacaq:
   - CommunityCard daha zəngin olacaq (category badge daha stilizə, member count vizual)
   - Hover effektləri
   - Join/Joined state daha aydın

6. **`CommunityCard`** (sətir 616) — icma card yenilənəcək:
   - Card-ın üst hissəsində gradient border
   - Category badge daha yaxşı yerləşmə
   - Members count vizual göstərici
   - Join button daha prominent

7. **`PersonRow`** (sətir 607) — aside-dəki member row yenilənəcək (daha yaxşı avatar + info + button)

8. **`Trend`** (sətir 595) — trend items daha vizual maraqlı olacaq

**Dəyişməyəcək funksiyalar:**
- JobsPage, JobCard, MessagesPage, ProfilePage, LandingPage, AppShell, AuthPage və s.

[Classes]
Heç bir sinif dəyişikliyi yoxdur. Bütün komponentlər funksional komponentlərdir.

[Dependencies]
Heç bir yeni dependency əlavə olunmayacaq. Mövcud `lucide-react`, `tailwind-merge`, `clsx` və `class-variance-authority` kifayət edir.

[Testing]
- `npm run dev` ilə vizual yoxlama
- `npm run build` ilə build-in uğurlu olduğunu yoxlama
- Feed, Network, Communities səhifələrinin əsas funksionallığının işlədiyini əl ilə test etmə (post create, like, connect, join)

[Implementation Order]
Dəyişikliklər bir faylda (`src/app.tsx`) olduğu üçün, hər səhifə ayrı-ayrı replace_in_file blokları ilə dəyişdiriləcək.

1. FeedPage + PostCard + PostAction dizayn yeniləməsi
2. NetworkPage + PersonCard + PersonRow + Trend dizayn yeniləməsi  
3. CommunitiesPage + CommunityCard dizayn yeniləməsi
4. Build testi (`npm run build`)