import type { TierConfig } from './types'

// ─── App Info ─────────────────────────────────────────────
export const APP_NAME = 'Brain2'
export const APP_TAGLINE = 'Bộ Não Thứ 2 — AI Hiểu Bạn'
export const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin

// ─── Supabase ─────────────────────────────────────────────
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sauuvyffudkmdbeglspb.supabase.co'
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// ─── Edge Functions ──────────────────────────────────────
export const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1`

// ─── Tier Configs ────────────────────────────────────────
export const TIER_CONFIGS: TierConfig[] = [
  {
    tier: 'free',
    label: 'Free',
    messages_per_day: 20,
    notes_limit: 50,
    monthly_price_vnd: 0,
    features: [
      '20 tin nhắn/ngày',
      '50 notes',
      '4 AI modes',
      'Semantic search',
    ],
  },
  {
    tier: 'pro',
    label: 'Pro',
    messages_per_day: 200,
    notes_limit: 200,
    monthly_price_vnd: 499_000,
    features: [
      '200 tin nhắn/ngày',
      '200 notes',
      'Tất cả AI modes',
      'Priority AI',
      'Import Notion & Files',
      'Knowledge Dashboard',
    ],
  },
  {
    tier: 'vip',
    label: 'VIP',
    messages_per_day: 9999,
    notes_limit: 9999,
    monthly_price_vnd: 999_000,
    features: [
      'Không giới hạn tin nhắn',
      'Không giới hạn notes',
      'Tất cả AI modes',
      'AI tốc độ cao',
      'Import Notion & Files',
      'Knowledge Dashboard',
      'Early access features',
    ],
  },
]

export const TIER_COLORS: Record<string, string> = {
  free: '#9BA0AD',
  pro: '#D4A537',
  vip: '#E8A020',
}

export const TIER_ICONS: Record<string, string> = {
  free: '🆓',
  pro: '💫',
  vip: '👑',
}

// ─── AI Models ────────────────────────────────────────────
export interface ModelInfo {
  id: string
  name: string
  provider: string
  icon: string
  tier: string
  desc: string
}

export const AI_MODELS: ModelInfo[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', icon: '⚡', tier: 'free', desc: 'Nhanh, thông minh — mặc định' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', icon: '💎', tier: 'free', desc: 'Suy luận sâu, phức tạp' },
  { id: 'prx/claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'Anthropic', icon: '🌸', tier: 'free', desc: 'Nhanh, tiết kiệm token' },
  { id: 'Claude-r1', name: 'Claude R1', provider: 'Claude', icon: '🔮', tier: 'free', desc: 'Suy luận mạnh, miễn phí' },
  { id: 'prx/claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', icon: '🎭', tier: 'pro', desc: 'Viết tốt, sáng tạo' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: '🟢', tier: 'pro', desc: 'Đa năng, mạnh mẽ' },
  { id: 'prx/claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'Anthropic', icon: '👑', tier: 'vip', desc: 'Mạnh nhất, suy luận cực sâu' },
]

// ─── Onboarding Goals ─────────────────────────────────────
export const ONBOARDING_GOALS = [
  { id: 'learn', label: 'Học & Phát triển bản thân', icon: '📚' },
  { id: 'create', label: 'Tạo nội dung / Sáng tạo', icon: '✨' },
  { id: 'grow', label: 'Phát triển kinh doanh', icon: '🚀' },
  { id: 'coach', label: 'Coaching / Mentoring', icon: '🎯' },
  { id: 'reflect', label: 'Chiêm nghiệm & Tự nhận thức', icon: '🪞' },
  { id: 'research', label: 'Nghiên cứu chuyên sâu', icon: '🔬' },
]

// ─── Note Types ───────────────────────────────────────────
export const NOTE_TYPES = [
  { value: 'concept', label: 'Concept', icon: '💡' },
  { value: 'insight', label: 'Insight', icon: '💎' },
  { value: 'story', label: 'Story / Trải nghiệm', icon: '📖' },
  { value: 'question', label: 'Câu hỏi', icon: '❓' },
  { value: 'action', label: 'Action / Hành động', icon: '⚡' },
]

// ─── Maturity Levels ─────────────────────────────────────
export const MATURITY_LEVELS = [
  { value: 'seed', label: 'Seed', icon: '🌱', desc: 'Mới ghi nhận' },
  { value: 'growing', label: 'Growing', icon: '🌿', desc: 'Đang phát triển' },
  { value: 'permanent', label: 'Permanent', icon: '🌳', desc: 'Kiến thức cốt lõi' },
]

// ─── Navigation ───────────────────────────────────────────
export const NAV_ITEMS = [
  { to: '/chat', label: 'Chat', icon: '💬' },
  { to: '/vault', label: 'Vault', icon: '📚' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/import', label: 'Import', icon: '📥' },
  { to: '/settings', label: 'Cài đặt', icon: '⚙️' },
]

// ─── Admin Emails ─────────────────────────────────────────
export const ADMIN_EMAILS = [
  'thong@thongphan.com',
  'thongphan.official@gmail.com',
]
