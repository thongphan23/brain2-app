import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { supabase } from '../../lib/supabase'

interface DailyUsage {
  day: string
  messages: number
  cost: number
}

interface TokenUsageChartProps {
  userId: string | undefined
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'hsl(225, 18%, 14%)',
        border: '1px solid hsl(225, 15%, 25%)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-primary)',
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: '4px 0 0', color: 'hsl(220, 70%, 55%)' }}>
          💬 Tin nhắn: <strong>{payload[0]?.value ?? 0}</strong>
        </p>
        {payload[1]?.value > 0 && (
          <p style={{ margin: '2px 0 0', color: 'hsl(45, 85%, 55%)' }}>
            💰 Chi phí: <strong>${payload[1]?.value?.toFixed(4)}</strong>
          </p>
        )}
      </div>
    )
  }
  return null
}

export function TokenUsageChart({ userId }: TokenUsageChartProps) {
  const [data, setData] = useState<DailyUsage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        // Fetch last 7 days of usage
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 6)

        const { data: rows } = await supabase
          .from('usage_daily')
          .select('date, messages_used, ai_cost_usd')
          .eq('user_id', userId)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: true })

        // Fill in missing days with zeros
        const dayMap = new Map<string, DailyUsage>()
        // Build a 7-day map
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const key = d.toISOString().split('T')[0]
          const dayLabel = d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })
          dayMap.set(key, { day: dayLabel, messages: 0, cost: 0 })
        }

        if (rows) {
          for (const row of rows) {
            const d = new Date(row.date)
            const dayLabel = d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })
            dayMap.set(row.date, {
              day: dayLabel,
              messages: row.messages_used ?? 0,
              cost: row.ai_cost_usd ?? 0,
            })
          }
        }

        setData(Array.from(dayMap.values()))
      } catch (err) {
        console.error('[TokenUsageChart] load error:', err)
        // Fallback: show empty 7-day frame
        const fallback: DailyUsage[] = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          fallback.push({
            day: d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' }),
            messages: 0,
            cost: 0,
          })
        }
        setData(fallback)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  if (loading) {
    return (
      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Đang tải biểu đồ...</span>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Chưa có dữ liệu sử dụng</span>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="msgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4A537" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#D4A537" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(225, 15%, 18%)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fill: 'hsl(220, 8%, 45%)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: 'hsl(220, 8%, 45%)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'hsl(220, 8%, 45%)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(3)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="messages"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#msgGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#3B82F6' }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="cost"
            stroke="#D4A537"
            strokeWidth={2}
            fill="url(#costGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#D4A537' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
