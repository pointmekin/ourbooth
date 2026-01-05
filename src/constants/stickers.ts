// Sticker pack definitions
// All stickers are stored in /public/assets/images/stickers/

export interface StickerPack {
  id: string
  name: string
  icon: string  // Emoji or icon for the tab
  stickers: StickerItem[]
}

export interface StickerItem {
  id: string
  name: string
  src: string
  type: 'emoji' | 'image'
}

// Emoji stickers (using Twemoji CDN)
function getEmojiUrl(emoji: string): string {
  const codePoints = [...emoji]
    .map(char => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join('-')
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${codePoints}.png`
}

// Emoji pack with Twemoji URLs
const EMOJI_STICKERS: StickerItem[] = [
  '🎀', '✨', '💖', '🔥', '👑', '🕶️', '🌸', '💀',
  '⭐', '🌈', '🦋', '💫', '🎉', '💝', '🌟', '🍀'
].map(emoji => ({
  id: `emoji-${emoji}`,
  name: emoji,
  src: getEmojiUrl(emoji),
  type: 'emoji' as const
}))

// Love sticker pack (WebP files)
const LOVE_STICKERS: StickerItem[] = [
  { id: 'love-1', name: 'Cassette Tape', src: '/assets/images/stickers/love/cassette-tape.webp', type: 'image' },
  { id: 'love-2', name: 'Chocolate Box', src: '/assets/images/stickers/love/chocolate-box.webp', type: 'image' },
  { id: 'love-3', name: 'Coffee Cup', src: '/assets/images/stickers/love/coffee-cup.webp', type: 'image' },
  { id: 'love-4', name: 'Cookies', src: '/assets/images/stickers/love/cookies.webp', type: 'image' },
  { id: 'love-5', name: 'Love Letter', src: '/assets/images/stickers/love/love-letter.webp', type: 'image' },
  { id: 'love-6', name: 'Love Message', src: '/assets/images/stickers/love/love-message.webp', type: 'image' },
  { id: 'love-7', name: 'Love Song', src: '/assets/images/stickers/love/love-song.webp', type: 'image' },
  { id: 'love-8', name: 'Love', src: '/assets/images/stickers/love/love.webp', type: 'image' },
  { id: 'love-9', name: 'Stamp', src: '/assets/images/stickers/love/stamp.webp', type: 'image' },
  { id: 'love-10', name: 'Valentines Day', src: '/assets/images/stickers/love/valentines-day.webp', type: 'image' },
  { id: 'love-11', name: 'Heart 1', src: '/assets/images/stickers/love/4289411.webp', type: 'image' },
  { id: 'love-12', name: 'Heart 2', src: '/assets/images/stickers/love/4289412.webp', type: 'image' },
  { id: 'love-13', name: 'Heart 3', src: '/assets/images/stickers/love/4289413.webp', type: 'image' },
  { id: 'love-14', name: 'Heart 4', src: '/assets/images/stickers/love/4289414.webp', type: 'image' },
  { id: 'love-15', name: 'Heart 5', src: '/assets/images/stickers/love/4289415.webp', type: 'image' },
  { id: 'love-16', name: 'Heart 6', src: '/assets/images/stickers/love/4289416.webp', type: 'image' },
  { id: 'love-17', name: 'Heart 7', src: '/assets/images/stickers/love/4289417.webp', type: 'image' },
  { id: 'love-18', name: 'Heart 8', src: '/assets/images/stickers/love/4289418.webp', type: 'image' },
  { id: 'love-19', name: 'Heart 9', src: '/assets/images/stickers/love/4289419.webp', type: 'image' },
  { id: 'love-20', name: 'Heart 10', src: '/assets/images/stickers/love/4289420.webp', type: 'image' },
]

export const STICKER_PACKS: StickerPack[] = [
  {
    id: 'emoji',
    name: 'Emoji',
    icon: '😊',
    stickers: EMOJI_STICKERS,
  },
  {
    id: 'love',
    name: 'Love',
    icon: '💕',
    stickers: LOVE_STICKERS,
  },
]
