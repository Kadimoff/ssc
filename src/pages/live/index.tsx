import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { CalendarDays, Camera, CameraOff, Hand, MessageCircle, Mic, MicOff, Monitor, Newspaper, Phone, Send, Users, X } from 'lucide-react'
import { eventItems, newsItems } from '@/data/landing-content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { AuthRequired, PageLoading, UserAvatar } from '@/app/app-shared'
import { useSnapshot } from '@/app/app-data'

export function LivePage() {
  const navigate = useNavigate()
  const { data } = useSnapshot()
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [participantsOpen, setParticipantsOpen] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [chatMsg, setChatMsg] = useState('')
  const [messages, setMessages] = useState<Array<{ name: string; text: string; time: string }>>([
    { name: 'System', text: 'Welcome to the Keet room!', time: 'now' },
  ])
  const [remotePeers, _setRemotePeers] = useState(data?.users.filter((u) => u.id !== data.currentUser?.id).slice(0, 3) ?? [])
  const roomRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  const sendChat = () => {
    if (!chatMsg.trim()) return
    setMessages((prev) => [...prev, { name: data?.currentUser?.name ?? 'You', text: chatMsg, time: 'just now' }])
    setChatMsg('')
  }

  if (!data) return <PageLoading />
  if (!data.currentUser) return <AuthRequired title='Sign in to join the Keet' />

  const videoTiles = [
    { id: 'local', name: data.currentUser.name, isLocal: true, camOn },
    ...remotePeers.map((u) => ({ id: String(u.id), name: u.name, isLocal: false, camOn: true })),
  ]

  return (
    <div ref={roomRef} className='relative isolate flex min-h-[calc(100svh-4rem)] flex-col bg-neutral-950 dark:bg-neutral-950'>
      {/* Room header */}
      <div className='flex items-center justify-between border-b border-white/10 px-5 py-3'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <span className='relative flex size-2.5'>
              <span className='absolute inline-flex size-2.5 animate-ping rounded-full bg-emerald-400 opacity-75' />
              <span className='relative inline-flex size-2.5 rounded-full bg-emerald-400' />
            </span>
            <span className='text-sm font-medium text-white'>Student Startup Community · Keet</span>
          </div>
          <span className='hidden rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/60 sm:inline'>Beta</span>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='gap-1.5 text-white/70 hover:text-white hover:bg-white/10'
            onClick={() => setParticipantsOpen(!participantsOpen)}
          >
            <Users className='size-4' />
            <span className='hidden sm:inline'>{remotePeers.length + 1}</span>
          </Button>
          <span className='text-xs text-white/40'>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Main area: video grid + optional panels */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Video grid */}
        <div className='flex-1 overflow-y-auto p-3'>
          <div className={cn(
            'grid gap-3',
            videoTiles.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
            videoTiles.length <= 4 ? 'grid-cols-2' :
            'grid-cols-2 md:grid-cols-3'
          )}>
            {videoTiles.map((tile) => (
              <div
                key={tile.id}
                className={cn(
                  'relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 ring-1 ring-white/10 transition-all duration-300',
                  tile.isLocal && 'ring-primary/30'
                )}
              >
                {/* Avatar / video placeholder */}
                <div className='flex flex-col items-center gap-2'>
                  <div className={cn(
                    'grid size-20 place-items-center rounded-full bg-gradient-to-br from-neutral-700 to-neutral-600 text-3xl font-bold text-white shadow-lg',
                    tile.isLocal && 'ring-2 ring-primary/50'
                  )}>
                    {tile.name.split(/\s+/).map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <span className='text-sm font-medium text-white/80'>{tile.isLocal ? 'You' : tile.name}</span>
                  {!tile.camOn && <span className='text-xs text-white/40'>Camera off</span>}
                </div>
                {/* Mic/off badge */}
                {tile.isLocal && !micOn && (
                  <div className='absolute bottom-3 right-3 rounded-full bg-rose-500/20 p-1.5'>
                    <MicOff className='size-3.5 text-rose-400' />
                  </div>
                )}
                {/* Local badge */}
                {tile.isLocal && (
                  <div className='absolute left-3 top-3 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60'>
                    You
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* News & Events during meet */}
          <div className='mt-6 space-y-5'>
            <div>
              <div className='mb-3 flex items-center gap-2'>
                <Newspaper className='size-4 text-white/50' />
                <span className='text-xs font-semibold uppercase tracking-wider text-white/40'>Latest news</span>
              </div>
              <div className='grid gap-3 sm:grid-cols-2'>
                {newsItems.slice(0, 2).map((item) => (
                  <div key={item.title} className='rounded-xl bg-white/5 p-4 ring-1 ring-white/10 transition-all hover:bg-white/10'>
                    <div className='flex items-center gap-2 text-[10px] text-white/40'>
                      <span className='rounded bg-white/10 px-1.5 py-0.5 font-medium text-white/60'>{item.category}</span>
                      <span>{item.date}</span>
                    </div>
                    <h4 className='mt-2 text-sm font-medium text-white'>{item.title}</h4>
                    <p className='mt-1 text-xs text-white/50 line-clamp-2'>{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className='mb-3 flex items-center gap-2'>
                <CalendarDays className='size-4 text-white/50' />
                <span className='text-xs font-semibold uppercase tracking-wider text-white/40'>Upcoming events</span>
              </div>
              <div className='grid gap-3 sm:grid-cols-2'>
                {eventItems.slice(0, 2).map((event) => (
                  <div key={event.title} className='flex items-center gap-4 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 transition-all hover:bg-white/10'>
                    <div className='grid size-14 shrink-0 place-items-center rounded-lg bg-white/10 text-center'>
                      <b className='block text-lg font-bold text-white'>{event.day}</b>
                      <span className='text-[9px] font-bold uppercase tracking-wider text-white/50'>{event.month}</span>
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h4 className='text-sm font-medium text-white'>{event.title}</h4>
                      <p className='mt-0.5 text-xs text-white/50'>{event.time} · {event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {chatOpen && (
          <div className='flex w-80 flex-col border-l border-white/10 bg-neutral-900/80 backdrop-blur-xl animate-in slide-in-from-right-2 duration-200'>
            <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
              <b className='text-sm text-white'>Room chat</b>
              <Button variant='ghost' size='icon' className='size-7 text-white/50 hover:text-white' onClick={() => setChatOpen(false)}>
                <X className='size-4' />
              </Button>
            </div>
            <div ref={chatRef} className='flex-1 space-y-3 overflow-y-auto p-4'>
              {messages.map((msg, i) => (
                <div key={i} className={cn('rounded-xl p-3', msg.name === 'System' ? 'bg-white/5 text-center text-xs text-white/40' : 'bg-white/10')}>
                  {msg.name !== 'System' && <b className='block text-xs text-white/70'>{msg.name}</b>}
                  <p className='text-sm text-white'>{msg.text}</p>
                </div>
              ))}
            </div>
            <div className='border-t border-white/10 p-3'>
              <form onSubmit={(e) => { e.preventDefault(); sendChat() }} className='flex gap-2'>
                <Input
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  placeholder='Type a message...'
                  className='h-9 border-white/20 bg-white/5 text-sm text-white placeholder:text-white/30'
                />
                <Button size='sm' type='submit' className='shrink-0 bg-primary hover:brightness-110'>
                  <Send className='size-3.5' />
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Participants panel */}
        {participantsOpen && (
          <div className='flex w-64 flex-col border-l border-white/10 bg-neutral-900/80 backdrop-blur-xl animate-in slide-in-from-right-2 duration-200'>
            <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
              <b className='text-sm text-white'>People ({remotePeers.length + 1})</b>
              <Button variant='ghost' size='icon' className='size-7 text-white/50 hover:text-white' onClick={() => setParticipantsOpen(false)}>
                <X className='size-4' />
              </Button>
            </div>
            <div className='flex-1 space-y-1 overflow-y-auto p-3'>
              <div className='flex items-center gap-3 rounded-xl bg-white/5 p-2.5'>
                <UserAvatar user={data.currentUser} className='size-8 ring-2 ring-primary/40' />
                <div className='min-w-0 flex-1'>
                  <b className='block text-sm text-white'>{data.currentUser.name}</b>
                  <span className='text-xs text-emerald-400'>You · Host</span>
                </div>
              </div>
              {remotePeers.map((user) => (
                <div key={user.id} className='flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/5'>
                  <UserAvatar user={user} className='size-8' />
                  <div className='min-w-0 flex-1'>
                    <b className='block text-sm text-white'>{user.name}</b>
                    <span className='text-xs text-white/40'>{user.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className='border-t border-white/10 bg-neutral-900/90 px-4 py-4 backdrop-blur-xl'>
        <div className='mx-auto flex max-w-lg items-center justify-center gap-2 sm:gap-3'>
          <ControlButton
            icon={micOn ? Mic : MicOff}
            active={micOn}
            danger={!micOn}
            label='Mic'
            onClick={() => setMicOn(!micOn)}
          />
          <ControlButton
            icon={camOn ? Camera : CameraOff}
            active={camOn}
            danger={!camOn}
            label='Camera'
            onClick={() => setCamOn(!camOn)}
          />
          <ControlButton
            icon={Monitor}
            active={false}
            label='Share'
            disabled
            onClick={() => undefined}
          />
          <ControlButton
            icon={Hand}
            active={handRaised}
            label='Hand'
            onClick={() => { setHandRaised(!handRaised); toast.success(handRaised ? 'Hand lowered' : 'Hand raised') }}
          />
          <ControlButton
            icon={MessageCircle}
            active={chatOpen}
            label='Chat'
            onClick={() => { setChatOpen(!chatOpen); setParticipantsOpen(false) }}
          />
          <ControlButton
            icon={Users}
            active={participantsOpen}
            label='People'
            onClick={() => { setParticipantsOpen(!participantsOpen); setChatOpen(false) }}
          />
          <button
            onClick={() => navigate({ to: '/feed' })}
            className='flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition-all duration-200 hover:bg-rose-600 hover:shadow-rose-500/25 hover:scale-105 active:scale-95 sm:h-12 sm:w-12'
            aria-label='End call'
          >
            <Phone className='size-5 rotate-[135deg]' />
          </button>
        </div>
      </div>
    </div>
  )
}

function ControlButton({ icon: Icon, active, danger, disabled, label, onClick }: { icon: typeof Mic; active: boolean; danger?: boolean; disabled?: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-200 active:scale-90',
        active ? 'bg-primary text-white shadow-sm shadow-primary/20' :
        danger ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' :
        'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
        'h-10 w-10 sm:h-12 sm:w-12 disabled:cursor-not-allowed disabled:opacity-35'
      )}
      aria-label={label}
      title={label}
    >
      <Icon className='size-4 sm:size-5' />
    </button>
  )
}
