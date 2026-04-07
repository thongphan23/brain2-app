// ─── Core Domain Types ─────────────────────────────────────

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  usage_goals: string[]
  onboarding_completed: boolean
  tier: TierType
  created_at: string
}

export type TierType = 'free' | 'pro' | 'vip'

// ─── Cognitive Tools ──────────────────────────────────────

export interface CognitiveTool {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  category: string
  required_tier: string
  is_active: boolean
  aligned_goals: string[]
}

// ─── Conversations ─────────────────────────────────────────

export interface Conversation {
  id: string
  user_id: string
  tool_slug: string
  title: string | null
  last_message_at: string | null
  created_at: string
  deleted_at: string | null
}

// ─── Messages ─────────────────────────────────────────────

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  created_at: string
}

export type MessageRole = 'user' | 'assistant' | 'system'

// ─── Notes (Vault) ────────────────────────────────────────

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  domain: string | null
  note_type: NoteType
  maturity: MaturityLevel
  tags: string[]
  created_at: string
  updated_at: string
}

export type NoteType = 'concept' | 'insight' | 'story' | 'question' | 'action'
export type MaturityLevel = 'seed' | 'growing' | 'permanent'

// ─── Analytics ─────────────────────────────────────────────

export interface DomainScore {
  domain: string
  score: number // 0-1
}

export interface KnowledgeAnalytics {
  id: string
  user_id: string
  snapshot_date: string
  total_notes: number
  total_connections: number
  domain_scores: DomainScore[]
  maturity_distribution: Record<MaturityLevel, number>
  note_type_distribution: Record<NoteType, number>
  overall_score: number
  suggested_domains: string[]
  created_at: string
}

// ─── Recommendations ───────────────────────────────────────

export interface Recommendation {
  id: string
  type: RecommendationType
  title: string
  description: string
  related_note_ids: string[]
  priority: number
  created_at: string
}

export type RecommendationType = 'study_topic' | 'connect_notes' | 'review_note' | 'create_note'

// ─── Payments ─────────────────────────────────────────────

export interface Payment {
  id: string
  user_id: string
  tier_target: TierType
  amount: number
  currency: string
  transaction_code: string | null
  payment_method: string
  status: PaymentStatus
  verified_at: string | null
  verified_by: string | null
  expires_at: string | null
  created_at: string
}

export type PaymentStatus = 'pending' | 'verified' | 'rejected' | 'expired'

// ─── Usage ────────────────────────────────────────────────

export interface UsageDaily {
  id: string
  user_id: string
  date: string
  messages_used: number
  notes_created: number
  ai_cost_usd: number
  created_at: string
}

// ─── Tier Config ──────────────────────────────────────────

export interface TierConfig {
  tier: TierType
  label: string
  messages_per_day: number
  notes_limit: number
  monthly_price_vnd: number
  features: string[]
}

// ─── AI Chat ─────────────────────────────────────────────

export interface ChatRequest {
  message: string
  conversation_id?: string
  tool_slug: string
  model?: string
}

export interface ChatResponse {
  conversation_id: string
  message_id: string
  usage?: {
    input_tokens: number
    output_tokens: number
    model_used: string
  }
}

export interface NoteSuggestion {
  title: string
  content: string
  note_type: NoteType
  domain?: string
}
