"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Download,
  Calendar,
  FileText,
  Search,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  BarChart3,
  PieChartIcon,
  Sparkles,
  Send,
  Loader2,
  Eye,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldInfo {
  id: string
  label: string
  name: string
  type: string
  options?: any
  matrixRows?: any
  matrixColumns?: any
  matrixType?: string
  scaleStart?: number | null
  scaleEnd?: number | null
  scaleStep?: number | null
  leftLabel?: string | null
  centerLabel?: string | null
  rightLabel?: string | null
}

interface FormSubmission {
  id: string
  formId: string
  createdAt: string
  meta: any
  values: {
    id: string
    fieldId: string
    value: string | null
    field: FieldInfo
  }[]
}

interface FormSection {
  id: string
  title: string
  fields: FieldInfo[]
}

interface Form {
  id: string
  title: string
  description?: string
  isActive?: boolean
  isPublic?: boolean
  settings?: any
  sections: FormSection[]
  user?: { id: string }
}

interface SheetStatus {
  googleConnected: boolean
  sheetLinked: boolean
  spreadsheetId: string | null
  spreadsheetUrl: string | null
}

type SortDir = "asc" | "desc"
type TabType = "analytics" | "table" | "ai"

// ---------------------------------------------------------------------------
// Constants — Google Forms color palette
// ---------------------------------------------------------------------------

const COLORS = [
  "#4285f4",
  "#ea4335",
  "#fbbc04",
  "#34a853",
  "#ff6d01",
  "#46bdc6",
  "#7baaf7",
  "#f07b72",
  "#fcd04f",
  "#71c287",
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJsonSafe(val: string): any {
  try {
    return JSON.parse(val)
  } catch {
    return null
  }
}

function formatCellValue(val: string | null | undefined): string {
  if (!val) return ""
  const parsed = parseJsonSafe(val)
  if (Array.isArray(parsed)) return parsed.join(", ")
  if (parsed && typeof parsed === "object") {
    return Object.values(parsed).join(", ")
  }
  return val
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "..." : s
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

function buildHistogramBuckets(
  nums: number[],
  bucketCount = 10
): { range: string; count: number }[] {
  if (nums.length === 0) return []
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  if (min === max) return [{ range: String(min), count: nums.length }]
  const step = (max - min) / bucketCount
  const buckets: { range: string; count: number }[] = []
  for (let i = 0; i < bucketCount; i++) {
    const lo = min + i * step
    const hi = lo + step
    const label = `${lo.toFixed(1)}-${hi.toFixed(1)}`
    const count = nums.filter(
      (n) => (i === bucketCount - 1 ? n >= lo && n <= hi : n >= lo && n < hi)
    ).length
    buckets.push({ range: label, count })
  }
  return buckets.filter((b) => b.count > 0)
}

// ---------------------------------------------------------------------------
// Tooltip style (for Recharts)
// ---------------------------------------------------------------------------

const tooltipStyle = {
  contentStyle: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "13px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  itemStyle: { color: "#1f2937" },
  labelStyle: { color: "#6b7280", fontWeight: 600 },
}

// ---------------------------------------------------------------------------
// Chart Type Toggle (top-right corner of each card)
// ---------------------------------------------------------------------------

function ChartTypeToggle({
  chartType,
  onToggle,
}: {
  chartType: "bar" | "pie"
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      title={
        chartType === "bar" ? "Switch to pie chart" : "Switch to bar chart"
      }
    >
      {chartType === "bar" ? (
        <PieChartIcon className="w-4 h-4" />
      ) : (
        <BarChart3 className="w-4 h-4" />
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Summary: Response Timeline (line chart at top)
// ---------------------------------------------------------------------------

function ResponseTimeline({
  submissions,
}: {
  submissions: FormSubmission[]
}) {
  const data = useMemo(() => {
    if (submissions.length === 0) return []
    const counts: Record<string, number> = {}
    submissions.forEach((s) => {
      const d = new Date(s.meta?.submittedAt || s.createdAt)
      const key = d.toISOString().slice(0, 10)
      counts[key] = (counts[key] || 0) + 1
    })
    const sorted = Object.keys(counts).sort()
    if (sorted.length >= 2) {
      const start = new Date(sorted[0])
      const end = new Date(sorted[sorted.length - 1])
      const cursor = new Date(start)
      while (cursor <= end) {
        const k = cursor.toISOString().slice(0, 10)
        if (!counts[k]) counts[k] = 0
        cursor.setDate(cursor.getDate() + 1)
      }
    }
    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count,
      }))
  }, [submissions])

  if (data.length === 0) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
        Response Timeline
      </h3>
      <p className="text-[13px] text-gray-500 mb-4">
        Submissions over time
      </p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              stroke="#e5e7eb"
              interval="preserveStartEnd"
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              stroke="#e5e7eb"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip {...tooltipStyle} />
            <Line
              type="monotone"
              dataKey="count"
              stroke={COLORS[0]}
              strokeWidth={2.5}
              dot={{ fill: COLORS[0], r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              name="Responses"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary: Donut Chart (MULTIPLE_CHOICE / DROPDOWN)
// ---------------------------------------------------------------------------

function DonutChart({
  field,
  rawValues,
  totalSubmissions,
}: {
  field: FieldInfo
  rawValues: string[]
  totalSubmissions: number
}) {
  const [chartType, setChartType] = useState<"bar" | "pie">("pie")

  const data = useMemo(() => {
    const counts: Record<string, number> = {}
    rawValues.forEach((v) => {
      counts[v] = (counts[v] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name: truncate(name, 50),
        count,
        pct: Math.round((count / rawValues.length) * 100),
      }))
  }, [rawValues])

  const responseLabel =
    rawValues.length === totalSubmissions
      ? `${rawValues.length} responses`
      : `${rawValues.length} of ${totalSubmissions} responded`

  if (chartType === "bar") {
    const barHeight = Math.max(data.length * 44 + 20, 120)
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-[15px] font-semibold text-gray-900">
              {field.label}
            </h4>
            <p className="text-[13px] text-gray-500 mt-1 mb-4">
              {responseLabel}
            </p>
          </div>
          <ChartTypeToggle
            chartType={chartType}
            onToggle={() => setChartType("pie")}
          />
        </div>
        <div style={{ height: barHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 0, right: 40 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={180}
                tick={{ fontSize: 13, fill: "#374151" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(value: number, _name: string, props: any) => [
                  `${value} (${props.payload.pct}%)`,
                  "Responses",
                ]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  // Donut (default)
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-[15px] font-semibold text-gray-900">
            {field.label}
          </h4>
          <p className="text-[13px] text-gray-500 mt-1 mb-4">
            {responseLabel}
          </p>
        </div>
        <ChartTypeToggle
          chartType={chartType}
          onToggle={() => setChartType("bar")}
        />
      </div>
      <div className="flex items-center">
        <div style={{ width: 220, height: 220 }} className="shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                {...tooltipStyle}
                formatter={(value: number, name: string) => [
                  `${value} responses`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Custom legend on the right */}
        <div className="ml-6 flex-1 space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-[13px] text-gray-700 flex-1 truncate">
                {item.name}
              </span>
              <span className="text-[13px] text-gray-900 font-medium tabular-nums">
                {item.count}
              </span>
              <span className="text-[13px] text-gray-500 tabular-nums w-12 text-right">
                {item.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary: Horizontal Bar Chart (CHECKBOXES / MULTI_SELECT)
// ---------------------------------------------------------------------------

function HorizontalBarChart({
  field,
  rawValues,
  totalSubmissions,
}: {
  field: FieldInfo
  rawValues: string[]
  totalSubmissions: number
}) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar")

  const { data, respondents } = useMemo(() => {
    const counts: Record<string, number> = {}
    let respondentCount = 0
    rawValues.forEach((v) => {
      respondentCount++
      const parsed = parseJsonSafe(v)
      if (Array.isArray(parsed)) {
        parsed.forEach((item: string) => {
          const key = String(item).trim()
          if (key) counts[key] = (counts[key] || 0) + 1
        })
      } else {
        counts[v] = (counts[v] || 0) + 1
      }
    })
    const dataArr = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name: truncate(name, 50),
        count,
        pct: Math.round((count / respondentCount) * 100),
      }))
    return { data: dataArr, respondents: respondentCount }
  }, [rawValues])

  const responseLabel =
    respondents === totalSubmissions
      ? `${respondents} responses`
      : `${respondents} of ${totalSubmissions} responded`

  // Find max count for proportional bars
  const maxCount = useMemo(
    () => Math.max(...data.map((d) => d.count), 1),
    [data]
  )

  if (chartType === "pie") {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-[15px] font-semibold text-gray-900">
              {field.label}
            </h4>
            <p className="text-[13px] text-gray-500 mt-1 mb-4">
              {responseLabel}
            </p>
          </div>
          <ChartTypeToggle
            chartType={chartType}
            onToggle={() => setChartType("bar")}
          />
        </div>
        <div className="flex items-center">
          <div style={{ width: 220, height: 220 }} className="shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, name: string) => [
                    `${value} selections`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="ml-6 flex-1 space-y-2">
            {data.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-[13px] text-gray-700 flex-1 truncate">
                  {item.name}
                </span>
                <span className="text-[13px] text-gray-900 font-medium tabular-nums">
                  {item.count}
                </span>
                <span className="text-[13px] text-gray-500 tabular-nums w-12 text-right">
                  {item.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default: Custom horizontal bar (no axes, no grid — Google Forms style)
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-[15px] font-semibold text-gray-900">
            {field.label}
          </h4>
          <p className="text-[13px] text-gray-500 mt-1 mb-4">
            {responseLabel}
          </p>
        </div>
        <ChartTypeToggle
          chartType={chartType}
          onToggle={() => setChartType("pie")}
        />
      </div>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] text-gray-700">{item.name}</span>
              <span className="text-[13px] text-gray-500 tabular-nums">
                {item.count} ({item.pct}%)
              </span>
            </div>
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: COLORS[0],
                  minWidth: item.count > 0 ? "8px" : "0px",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary: Text Response List (SHORT_TEXT / LONG_TEXT / EMAIL / PHONE / URL)
// ---------------------------------------------------------------------------

function TextResponseList({
  field,
  rawValues,
  totalSubmissions,
}: {
  field: FieldInfo
  rawValues: string[]
  totalSubmissions: number
}) {
  const { grouped, uniqueCount, hasRepeats } = useMemo(() => {
    const counts: Record<string, number> = {}
    rawValues.forEach((v) => {
      const key = v.trim()
      if (key) counts[key] = (counts[key] || 0) + 1
    })
    const unique = Object.keys(counts).length
    const repeats = Object.values(counts).some((c) => c > 1)
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return {
      grouped: sorted,
      uniqueCount: unique,
      hasRepeats: repeats,
    }
  }, [rawValues])

  const responseLabel =
    rawValues.length === totalSubmissions
      ? `${rawValues.length} responses`
      : `${rawValues.length} of ${totalSubmissions} responded`

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h4 className="text-[15px] font-semibold text-gray-900">
        {field.label}
      </h4>
      <p className="text-[13px] text-gray-500 mt-1 mb-4">
        {responseLabel}
        {uniqueCount !== rawValues.length && ` (${uniqueCount} unique)`}
      </p>
      <div className="max-h-[300px] overflow-y-auto">
        {hasRepeats
          ? grouped.map(([value, count], i) => (
              <div
                key={i}
                className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0"
              >
                <span className="text-[13px] text-gray-700 whitespace-pre-wrap break-words mr-4 flex-1">
                  {value}
                </span>
                {count > 1 && (
                  <span className="text-[12px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full shrink-0 tabular-nums">
                    {count}x
                  </span>
                )}
              </div>
            ))
          : rawValues.map((value, i) => (
              <div
                key={i}
                className="py-2.5 border-b border-gray-100 last:border-0"
              >
                <span className="text-[13px] text-gray-700 whitespace-pre-wrap break-words">
                  {value}
                </span>
              </div>
            ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary: Number Stats Card (NUMBER / SCORE / CALCULATED)
// ---------------------------------------------------------------------------

function NumberStatsCard({
  field,
  rawValues,
  totalSubmissions,
}: {
  field: FieldInfo
  rawValues: string[]
  totalSubmissions: number
}) {
  const { nums, min, max, mean, med, histogram } = useMemo(() => {
    const nums = rawValues.map(Number).filter((n) => !isNaN(n))
    if (nums.length === 0)
      return { nums: [], min: 0, max: 0, mean: 0, med: 0, histogram: [] }
    const sum = nums.reduce((a, b) => a + b, 0)
    const m = sum / nums.length
    return {
      nums,
      min: Math.min(...nums),
      max: Math.max(...nums),
      mean: m,
      med: median(nums),
      histogram: buildHistogramBuckets(nums, Math.min(10, nums.length)),
    }
  }, [rawValues])

  const responseLabel =
    rawValues.length === totalSubmissions
      ? `${rawValues.length} responses`
      : `${rawValues.length} of ${totalSubmissions} responded`

  if (nums.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h4 className="text-[15px] font-semibold text-gray-900">
          {field.label}
        </h4>
        <p className="text-[13px] text-gray-500 mt-1">No numeric data</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h4 className="text-[15px] font-semibold text-gray-900">
        {field.label}
      </h4>
      <p className="text-[13px] text-gray-500 mt-1 mb-4">{responseLabel}</p>

      {/* Stats row */}
      <div className="flex gap-6 mb-5">
        <div>
          <p className="text-[12px] text-gray-400 uppercase tracking-wider">
            Average
          </p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {mean.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[12px] text-gray-400 uppercase tracking-wider">
            Median
          </p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {med.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[12px] text-gray-400 uppercase tracking-wider">
            Range
          </p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {min.toFixed(2)} - {max.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Histogram */}
      {histogram.length > 1 && (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogram}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                stroke="#e5e7eb"
                interval={0}
                angle={-30}
                textAnchor="end"
                height={45}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...tooltipStyle} />
              <Bar
                dataKey="count"
                fill={COLORS[0]}
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary: Scale / Rating Chart (LINEAR_SCALE / RATING)
// ---------------------------------------------------------------------------

function ScaleBarChart({
  field,
  rawValues,
  totalSubmissions,
}: {
  field: FieldInfo
  rawValues: string[]
  totalSubmissions: number
}) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar")

  const { data, avg, count } = useMemo(() => {
    const nums = rawValues.map(Number).filter((n) => !isNaN(n))
    if (nums.length === 0) return { data: [], avg: 0, count: 0 }
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length
    const counts: Record<number, number> = {}
    nums.forEach((n) => {
      counts[n] = (counts[n] || 0) + 1
    })
    const lo = field.scaleStart ?? Math.min(...nums)
    const hi = field.scaleEnd ?? Math.max(...nums)
    const step = field.scaleStep ?? 1
    const dataArr: { score: string; count: number; pct: number }[] = []
    for (let i = Number(lo); i <= Number(hi); i += Number(step)) {
      const c = counts[i] || 0
      dataArr.push({
        score: String(i),
        count: c,
        pct: Math.round((c / nums.length) * 100),
      })
    }
    return { data: dataArr, avg, count: nums.length }
  }, [rawValues, field.scaleStart, field.scaleEnd, field.scaleStep])

  const responseLabel =
    count === totalSubmissions
      ? `${count} responses`
      : `${count} of ${totalSubmissions} responded`

  if (count === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h4 className="text-[15px] font-semibold text-gray-900">
          {field.label}
        </h4>
        <p className="text-[13px] text-gray-500 mt-1">No responses</p>
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  if (chartType === "pie") {
    const pieData = data.filter((d) => d.count > 0)
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-[15px] font-semibold text-gray-900">
              {field.label}
            </h4>
            <p className="text-[13px] text-gray-500 mt-1 mb-2">
              {responseLabel}
            </p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-[#4285f4]">
                {avg.toFixed(1)}
              </span>
              <span className="text-[13px] text-gray-500">average</span>
            </div>
          </div>
          <ChartTypeToggle
            chartType={chartType}
            onToggle={() => setChartType("bar")}
          />
        </div>
        <div className="flex items-center">
          <div style={{ width: 200, height: 200 }} className="shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="score"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="ml-6 flex-1 space-y-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-[13px] text-gray-700">
                  {item.score}
                </span>
                <span className="text-[13px] text-gray-900 font-medium tabular-nums">
                  {item.count}
                </span>
                <span className="text-[13px] text-gray-500 tabular-nums">
                  ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default: horizontal bar for each scale value
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-[15px] font-semibold text-gray-900">
            {field.label}
          </h4>
          <p className="text-[13px] text-gray-500 mt-1 mb-2">
            {responseLabel}
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-[#4285f4]">
              {avg.toFixed(1)}
            </span>
            <span className="text-[13px] text-gray-500">average</span>
          </div>
        </div>
        <ChartTypeToggle
          chartType={chartType}
          onToggle={() => setChartType("pie")}
        />
      </div>
      {field.leftLabel || field.rightLabel ? (
        <div className="flex justify-between text-[12px] text-gray-400 mb-2 px-1">
          <span>{field.leftLabel || ""}</span>
          {field.centerLabel && <span>{field.centerLabel}</span>}
          <span>{field.rightLabel || ""}</span>
        </div>
      ) : null}
      <div className="space-y-2.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[13px] text-gray-700 w-8 text-right tabular-nums shrink-0">
              {item.score}
            </span>
            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: COLORS[0],
                  minWidth: item.count > 0 ? "8px" : "0px",
                }}
              />
            </div>
            <span className="text-[13px] text-gray-500 w-16 text-right tabular-nums shrink-0">
              {item.count} ({item.pct}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary: Matrix Chart
// ---------------------------------------------------------------------------

function MatrixStackedChart({
  field,
  rawValues,
  totalSubmissions,
}: {
  field: FieldInfo
  rawValues: string[]
  totalSubmissions: number
}) {
  const { columnLabels, rowData } = useMemo(() => {
    const matrixRows: string[] = Array.isArray(field.matrixRows)
      ? field.matrixRows
      : []
    const matrixColumns: string[] = Array.isArray(field.matrixColumns)
      ? field.matrixColumns
      : []

    const rowColumnCounts: Record<string, Record<string, number>> = {}
    const columnLabelsSet = new Set<string>()

    rawValues.forEach((v) => {
      const parsed = parseJsonSafe(v)
      if (!parsed || typeof parsed !== "object") return
      Object.entries(parsed).forEach(([rowKey, colVal]) => {
        const col = String(colVal).trim()
        if (!col) return
        if (!rowColumnCounts[rowKey]) rowColumnCounts[rowKey] = {}
        rowColumnCounts[rowKey][col] =
          (rowColumnCounts[rowKey][col] || 0) + 1
        columnLabelsSet.add(col)
      })
    })

    const cols =
      matrixColumns.length > 0
        ? matrixColumns
        : Array.from(columnLabelsSet).sort()

    const data = Object.keys(rowColumnCounts)
      .sort()
      .map((rowKey) => {
        const idx = parseInt(rowKey.replace("row_", ""), 10)
        const rowLabel =
          matrixRows[idx] || rowKey.replace("row_", "Row ")
        const entry: Record<string, any> = {
          row: truncate(rowLabel, 30),
        }
        let total = 0
        cols.forEach((col) => {
          const c = rowColumnCounts[rowKey]?.[col] || 0
          entry[col] = c
          total += c
        })
        entry._total = total
        return entry
      })

    return { columnLabels: cols, rowData: data }
  }, [rawValues, field.matrixRows, field.matrixColumns])

  const responseLabel =
    rawValues.length === totalSubmissions
      ? `${rawValues.length} responses`
      : `${rawValues.length} of ${totalSubmissions} responded`

  if (rowData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h4 className="text-[15px] font-semibold text-gray-900">
          {field.label}
        </h4>
        <p className="text-[13px] text-gray-500 mt-1">No matrix data</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h4 className="text-[15px] font-semibold text-gray-900">
        {field.label}
      </h4>
      <p className="text-[13px] text-gray-500 mt-1 mb-4">{responseLabel}</p>

      {/* Legend at top */}
      <div className="flex flex-wrap gap-4 mb-4">
        {columnLabels.map((col, i) => (
          <div key={col} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: COLORS[i % COLORS.length],
              }}
            />
            <span className="text-[13px] text-gray-700">{col}</span>
          </div>
        ))}
      </div>

      {/* Per-row mini stacked bars */}
      <div className="space-y-4">
        {rowData.map((row, ri) => {
          const total = row._total || 1
          return (
            <div key={ri}>
              <p className="text-[13px] text-gray-700 font-medium mb-1.5">
                {row.row}
              </p>
              <div className="flex h-7 rounded-md overflow-hidden bg-gray-100">
                {columnLabels.map((col, ci) => {
                  const count = row[col] || 0
                  if (count === 0) return null
                  const pct = (count / total) * 100
                  return (
                    <div
                      key={ci}
                      className="h-full flex items-center justify-center text-[11px] text-white font-medium transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: COLORS[ci % COLORS.length],
                        minWidth: count > 0 ? "20px" : 0,
                      }}
                      title={`${col}: ${count} (${Math.round(pct)}%)`}
                    >
                      {pct > 8 ? count : ""}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Per-field analytics dispatcher for Summary tab
// ---------------------------------------------------------------------------

function SummaryFieldCard({
  field,
  submissions,
}: {
  field: FieldInfo
  submissions: FormSubmission[]
}) {
  const rawValues = useMemo(() => {
    return submissions
      .map((s) => {
        const entry = s.values?.find((v) => v.field.name === field.name)
        return entry?.value ?? null
      })
      .filter((v): v is string => v !== null && v.trim() !== "")
  }, [submissions, field.name])

  const totalSubmissions = submissions.length

  if (rawValues.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h4 className="text-[15px] font-semibold text-gray-900">
          {field.label}
        </h4>
        <p className="text-[13px] text-gray-500 mt-1">
          0 of {totalSubmissions} responded
        </p>
      </div>
    )
  }

  const type = field.type

  // MULTIPLE_CHOICE / DROPDOWN -> Donut chart
  if (type === "MULTIPLE_CHOICE" || type === "DROPDOWN") {
    return (
      <DonutChart
        field={field}
        rawValues={rawValues}
        totalSubmissions={totalSubmissions}
      />
    )
  }

  // CHECKBOXES / MULTI_SELECT -> Horizontal bar chart
  if (type === "CHECKBOXES" || type === "MULTI_SELECT") {
    return (
      <HorizontalBarChart
        field={field}
        rawValues={rawValues}
        totalSubmissions={totalSubmissions}
      />
    )
  }

  // NUMBER / SCORE / CALCULATED -> Stats summary card
  if (type === "NUMBER" || type === "SCORE" || type === "CALCULATED") {
    return (
      <NumberStatsCard
        field={field}
        rawValues={rawValues}
        totalSubmissions={totalSubmissions}
      />
    )
  }

  // LINEAR_SCALE / RATING -> Horizontal bar distribution
  if (type === "LINEAR_SCALE" || type === "RATING") {
    return (
      <ScaleBarChart
        field={field}
        rawValues={rawValues}
        totalSubmissions={totalSubmissions}
      />
    )
  }

  // MATRIX -> Stacked bars per row
  if (type === "MATRIX") {
    return (
      <MatrixStackedChart
        field={field}
        rawValues={rawValues}
        totalSubmissions={totalSubmissions}
      />
    )
  }

  // TEXT-like: SHORT_TEXT, LONG_TEXT, EMAIL, PHONE, URL, etc.
  return (
    <TextResponseList
      field={field}
      rawValues={rawValues}
      totalSubmissions={totalSubmissions}
    />
  )
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function FormSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string
  const { user } = useAuth()

  const [form, setForm] = useState<Form | null>(null)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<string>("_date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailId, setDetailId] = useState<string | null>(null)
  const [tab, setTab] = useState<TabType>("analytics")

  // Toolbar state (mirrors edit page)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [sheetStatus, setSheetStatus] = useState<SheetStatus | null>(null)
  const [sheetLoading, setSheetLoading] = useState(false)

  // Sync email toggle from form settings
  useEffect(() => {
    if (form?.settings?.notifyEmails && form.settings.notifyEmails.length > 0) {
      setEmailEnabled(true)
    } else {
      setEmailEnabled(false)
    }
  }, [form?.settings?.notifyEmails])

  // Fetch sheet status
  useEffect(() => {
    if (!formId) return
    fetch(`/api/forms/${formId}/google-sheets`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setSheetStatus(d) })
      .catch(() => {})
  }, [formId])

  const toggleAcceptResponses = async () => {
    if (!form) return
    try {
      const newActive = !form.isActive
      const res = await fetch(`/api/forms/${formId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ isActive: newActive, isPublic: newActive }),
      })
      if (res.ok) setForm({ ...form, isActive: newActive, isPublic: newActive })
    } catch {}
  }

  const toggleEmailNotifications = async () => {
    if (!form) return
    const newEnabled = !emailEnabled
    try {
      const updatedSettings = { ...(form.settings || {}) }
      if (newEnabled) {
        updatedSettings.notifyEmails = updatedSettings.notifyEmails?.length ? updatedSettings.notifyEmails : ['default']
      } else {
        delete updatedSettings.notifyEmails
      }
      const res = await fetch(`/api/forms/${formId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ settings: updatedSettings }),
      })
      if (res.ok) { const updated = await res.json(); setForm(updated); setEmailEnabled(newEnabled) }
    } catch {}
  }

  const connectGoogleAccount = () => { window.location.href = `/api/auth/google-sheets?formId=${formId}` }

  const connectSheet = async () => {
    setSheetLoading(true)
    try {
      const res = await fetch(`/api/forms/${formId}/google-sheets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({}) })
      if (res.ok) { const data = await res.json(); setSheetStatus({ googleConnected: true, sheetLinked: true, spreadsheetId: data.spreadsheetId, spreadsheetUrl: data.spreadsheetUrl }) }
    } catch {} finally { setSheetLoading(false) }
  }

  const disconnectSheet = async () => {
    if (!confirm('Disconnect Google Sheet?')) return
    setSheetLoading(true)
    try {
      const res = await fetch(`/api/forms/${formId}/google-sheets`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) setSheetStatus(prev => prev ? { ...prev, sheetLinked: false, spreadsheetId: null, spreadsheetUrl: null } : null)
    } catch {} finally { setSheetLoading(false) }
  }

  // AI Analysis state
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiAssumption, setAiAssumption] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiHistory, setAiHistory] = useState<{ prompt: string; response: string }[]>([])

  const handleAiAnalyze = async (customPrompt?: string) => {
    const basePrompt = customPrompt || aiPrompt.trim()
    if (!basePrompt || aiLoading) return
    const prompt = aiAssumption.trim()
      ? `Context/Assumptions: ${aiAssumption.trim()}\n\nQuestion: ${basePrompt}`
      : basePrompt
    setAiLoading(true)
    setAiResponse("")
    setAiPrompt("")

    try {
      const res = await fetch(`/api/forms/${formId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        const errText = await res.text()
        setAiResponse(`Error: ${errText || "Failed to analyze"}`)
        setAiLoading(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) { setAiLoading(false); return }

      const decoder = new TextDecoder()
      let full = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        full += chunk
        setAiResponse(full)
      }
      setAiHistory((prev) => [...prev, { prompt, response: full }])
    } catch {
      setAiResponse("Error: Failed to connect to AI service.")
    } finally {
      setAiLoading(false)
    }
  }

  const fetchAll = useCallback(async () => {
    try {
      setError(null)
      const [formRes, subRes] = await Promise.all([
        fetch(`/api/forms/${formId}`, { credentials: "include" }),
        fetch(`/api/forms/${formId}/submissions?includeValues=true`, {
          credentials: "include",
        }),
      ])

      if (!formRes.ok) {
        setError(
          formRes.status === 401 ? "Please log in." : "Form not found."
        )
        return
      }
      if (!subRes.ok) {
        setError("Failed to load submissions.")
        return
      }

      const formData = await formRes.json()
      setForm({
        id: formData.id,
        title: formData.title,
        description: formData.description,
        isActive: formData.isActive,
        isPublic: formData.isPublic,
        settings: formData.settings,
        user: formData.user,
        sections:
          formData.sections?.map((s: any) => ({
            id: s.id,
            title: s.title,
            fields:
              s.fields?.map((f: any) => ({
                id: f.id,
                name: f.name,
                label: f.label,
                type: f.type,
                options: f.options,
                matrixRows: f.matrixRows,
                matrixColumns: f.matrixColumns,
                matrixType: f.matrixType,
                scaleStart: f.scaleStart,
                scaleEnd: f.scaleEnd,
                scaleStep: f.scaleStep,
                leftLabel: f.leftLabel,
                centerLabel: f.centerLabel,
                rightLabel: f.rightLabel,
              })) || [],
          })) || [],
      })

      setSubmissions(await subRes.json())
    } catch {
      setError("Network error.")
    } finally {
      setLoading(false)
    }
  }, [formId])

  useEffect(() => {
    if (formId) fetchAll()
  }, [formId, fetchAll])

  // All fields flattened
  const allFields = useMemo(
    () => form?.sections?.flatMap((s) => s.fields) || [],
    [form]
  )

  // Get cell value
  const getCellValue = useCallback(
    (submission: FormSubmission, fieldName: string): string => {
      const val = submission.values?.find((v) => v.field.name === fieldName)
      return val?.value || ""
    },
    []
  )

  // Filtered & sorted
  const processed = useMemo(() => {
    let list = [...submissions]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.values?.some((v) => v.value?.toLowerCase().includes(q)) ||
          new Date(s.meta?.submittedAt || s.createdAt)
            .toLocaleString()
            .toLowerCase()
            .includes(q)
      )
    }

    list.sort((a, b) => {
      let va: string, vb: string
      if (sortField === "_date") {
        va = a.meta?.submittedAt || a.createdAt || ""
        vb = b.meta?.submittedAt || b.createdAt || ""
      } else {
        va = getCellValue(a, sortField)
        vb = getCellValue(b, sortField)
      }
      const cmp = va.localeCompare(vb, undefined, { numeric: true })
      return sortDir === "asc" ? cmp : -cmp
    })

    return list
  }, [submissions, search, sortField, sortDir, getCellValue])

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    )
  }

  // Selection
  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const toggleSelectAll = () => {
    if (selected.size === processed.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(processed.map((s) => s.id)))
    }
  }

  // Delete
  const handleDelete = async (ids: string[]) => {
    if (
      !confirm(
        `Delete ${ids.length} submission${ids.length > 1 ? "s" : ""}?`
      )
    )
      return
    try {
      const res = await fetch(`/api/forms/${formId}/submissions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ submissionIds: ids }),
      })
      if (res.ok) {
        setSubmissions(submissions.filter((s) => !ids.includes(s.id)))
        setSelected(new Set())
        setDetailId(null)
      }
    } catch {
      alert("Failed to delete.")
    }
  }

  // Clear all submissions — destructive, requires typed confirmation modal.
  const [clearOpen, setClearOpen] = useState(false)
  const [clearInput, setClearInput] = useState('')
  const [clearSubmitting, setClearSubmitting] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)
  const clearAll = async () => {
    if (!form) return
    setClearSubmitting(true)
    setClearError(null)
    try {
      const res = await fetch(`/api/forms/${form.id}/submissions/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirm: clearInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to clear')
      setSubmissions([])
      setSelected(new Set())
      setDetailId(null)
      setClearOpen(false)
      setClearInput('')
    } catch (e: any) {
      setClearError(e.message)
    } finally {
      setClearSubmitting(false)
    }
  }

  // Export CSV
  const exportCSV = () => {
    if (!form || processed.length === 0) return
    const headers = ["#", "Submitted At", ...allFields.map((f) => f.label)]
    const rows = processed.map((s, i) => {
      const date = s.meta?.submittedAt
        ? new Date(s.meta.submittedAt).toLocaleString()
        : ""
      const vals = allFields.map(
        (f) =>
          `"${(formatCellValue(getCellValue(s, f.name)) || "").replace(
            /"/g,
            '""'
          )}"`
      )
      return [i + 1, `"${date}"`, ...vals].join(",")
    })
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${form.title}-submissions.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isOwner = !!user && !!form?.user && form.user.id === user.id

  // Detail submission
  const detailSubmission = submissions.find((s) => s.id === detailId)

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        {/* Sticky toolbar — same as form edit page */}
        <div className="sticky top-[57px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
          <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-3">

            {/* ── Left: Back + Title + Status ── */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => router.push("/my-content")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Back to forms"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="text-border/60 select-none">|</span>

              <h2 className="text-sm font-medium truncate max-w-[180px] sm:max-w-[280px]" title={form?.title}>
                {form?.title || "Submissions"}
              </h2>

              <span
                className={`inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                  form?.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {form?.isActive ? 'Accepting responses' : 'Closed'}
              </span>
            </div>

            {/* ── Right: Controls ── */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">

              {/* Accept Responses toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleAcceptResponses}
                  role="switch"
                  aria-checked={form?.isActive}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    form?.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${form?.isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                </button>
                <span className="text-[11px] text-muted-foreground hidden sm:inline whitespace-nowrap">
                  {form?.isActive ? 'Active' : 'Closed'}
                </span>
              </div>

              <span className="w-px h-4 bg-border/60 hidden sm:block" />

              {/* Email Notifications toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleEmailNotifications}
                  role="switch"
                  aria-checked={emailEnabled}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    emailEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${emailEnabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                </button>
                <span className="text-[11px] text-muted-foreground hidden sm:inline whitespace-nowrap">
                  Email alerts
                </span>
              </div>

              <span className="w-px h-4 bg-border/60 hidden sm:block" />

              {/* Google Sheets */}
              {sheetStatus?.sheetLinked ? (
                <div className="flex items-center gap-0.5">
                  <a href={sheetStatus.spreadsheetUrl!} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors"
                    title="Open linked Google Sheet"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" /></svg>
                    Sheet
                  </a>
                  <button onClick={disconnectSheet} disabled={sheetLoading}
                    className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50" title="Disconnect Google Sheet"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : sheetStatus?.googleConnected ? (
                <button onClick={connectSheet} disabled={sheetLoading}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" /></svg>
                  {sheetLoading ? 'Creating...' : 'Create Sheet'}
                </button>
              ) : sheetStatus ? (
                <button onClick={connectGoogleAccount}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Connect Google
                </button>
              ) : null}

              {sheetStatus && <span className="w-px h-4 bg-border/60 hidden sm:block" />}

              {/* Responses — current page, highlighted */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-muted">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden sm:inline">Responses</span>
                <span className="tabular-nums">({submissions.length})</span>
              </span>

              {/* Export CSV */}
              <button onClick={exportCSV} disabled={submissions.length === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Download all submissions as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              {/* Clear all responses — owner only */}
              {isOwner && (
                <button
                  onClick={() => { setClearOpen(true); setClearInput(''); setClearError(null) }}
                  disabled={submissions.length === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Delete every submission on this form"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear responses</span>
                </button>
              )}

              {/* Preview */}
              <button onClick={() => window.open(`/forms/public/${formId}`, '_blank')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-muted transition-colors" title="Preview public form"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden sm:inline">Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clear-responses confirmation modal — portaled to body so the header
            stacking context can't overlap it. */}
        {clearOpen && form && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4" onClick={() => !clearSubmitting && setClearOpen(false)}>
            <div className="bg-background rounded-lg border shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <Trash2 className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Clear all responses</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete <strong>{submissions.length}</strong> submission{submissions.length === 1 ? '' : 's'} on
                <span className="font-medium text-foreground"> {form.title}</span>. This cannot be undone.
              </p>
              <p className="text-sm mb-2">
                To confirm, type the form name exactly:
                <span className="block mt-1 rounded bg-muted px-2 py-1 text-xs font-mono">{form.title}</span>
              </p>
              <input
                type="text"
                value={clearInput}
                onChange={(e) => setClearInput(e.target.value)}
                placeholder="Type form name to confirm"
                className="mt-2 w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                autoFocus
              />
              {clearError && <p className="mt-2 text-xs text-red-600">{clearError}</p>}
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setClearOpen(false)}
                  disabled={clearSubmitting}
                  className="px-3 py-1.5 text-xs font-medium rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={clearAll}
                  disabled={
                    clearSubmitting ||
                    clearInput.trim().toLowerCase() !== form.title.trim().toLowerCase()
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {clearSubmitting ? 'Clearing…' : `Delete ${submissions.length} submission${submissions.length === 1 ? '' : 's'}`}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

        {/* Tabs bar — sticky below toolbar (57px header + 48px toolbar = 105px) */}
        <div className="sticky top-[105px] z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setTab("analytics")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  tab === "analytics"
                    ? "bg-background shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
                Analytics
              </button>
              <button
                onClick={() => setTab("table")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  tab === "table"
                    ? "bg-background shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                Table
              </button>
              <button
                onClick={() => setTab("ai")}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  tab === "ai"
                    ? "bg-background shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
                AI Powered
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700 tabular-nums">
                {submissions.length} response{submissions.length !== 1 ? "s" : ""}
              </span>
              {tab === "table" && (
                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search responses..."
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-8" />
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* ============================================================= */}
          {/* TABLE TAB                                                     */}
          {/* ============================================================= */}
          {tab === "table" && (
            <>
              {processed.length === 0 ? (
                <div className="bg-background rounded-xl border p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium mb-1">
                    {submissions.length === 0
                      ? "No responses yet"
                      : "No matching responses"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {submissions.length === 0
                      ? "Share your form to start collecting responses."
                      : "Try a different search term."}
                  </p>
                </div>
              ) : (
                <div className="bg-background rounded-xl border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40">
                          {isOwner && (
                            <th className="w-10 px-3 py-3">
                              <input
                                type="checkbox"
                                checked={
                                  selected.size === processed.length &&
                                  processed.length > 0
                                }
                                onChange={toggleSelectAll}
                                className="rounded"
                              />
                            </th>
                          )}
                          <th
                            className="px-3 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                            onClick={() => toggleSort("_date")}
                          >
                            Date <SortIcon field="_date" />
                          </th>
                          {allFields.map((field) => (
                            <th
                              key={field.id}
                              className="px-3 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                              onClick={() => toggleSort(field.name)}
                            >
                              {field.label}{" "}
                              <SortIcon field={field.name} />
                            </th>
                          ))}
                          {isOwner && <th className="w-10 px-3 py-3" />}
                        </tr>
                      </thead>
                      <tbody>
                        {processed.map((submission) => (
                          <tr
                            key={submission.id}
                            className={`border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${
                              selected.has(submission.id)
                                ? "bg-primary/5"
                                : ""
                            }`}
                            onClick={() => setDetailId(submission.id)}
                          >
                            {isOwner && (
                              <td
                                className="px-3 py-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected.has(submission.id)}
                                  onChange={() => toggleSelect(submission.id)}
                                  className="rounded"
                                />
                              </td>
                            )}
                            <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                              {new Date(
                                submission.meta?.submittedAt ||
                                  submission.createdAt
                              ).toLocaleDateString()}{" "}
                              <span className="text-xs">
                                {new Date(
                                  submission.meta?.submittedAt ||
                                    submission.createdAt
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </td>
                            {allFields.map((field) => {
                              const raw = getCellValue(
                                submission,
                                field.name
                              )
                              const display = formatCellValue(raw)
                              return (
                                <td
                                  key={field.id}
                                  className="px-3 py-3 max-w-[200px] truncate"
                                  title={display}
                                >
                                  {display || (
                                    <span className="text-muted-foreground/40">
                                      --
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                            {isOwner && (
                              <td
                                className="px-3 py-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleDelete([submission.id])}
                                  className="p-1 rounded hover:bg-red-50 text-muted-foreground/40 hover:text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============================================================= */}
          {/* ANALYTICS TAB                                                 */}
          {/* ============================================================= */}
          {tab === "analytics" && (
            <div className="space-y-5">
              {/* Response Timeline */}
              <ResponseTimeline submissions={submissions} />

              {/* Per-section field cards */}
              {form?.sections?.map((section) => {
                if (section.fields.length === 0) return null
                return (
                  <div key={section.id}>
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-8 mb-3">
                      {section.title}
                    </div>
                    <div className="space-y-5">
                      {section.fields.map((field) => (
                        <SummaryFieldCard
                          key={field.id}
                          field={field}
                          submissions={submissions}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}

              {submissions.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="font-medium text-gray-900 mb-1">
                    No data to analyze
                  </p>
                  <p className="text-[13px] text-gray-500">
                    Summary will appear once you receive responses.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================= */}
          {/* AI POWERED TAB                                                */}
          {/* ============================================================= */}
          {tab === "ai" && (
            <div className="space-y-5 max-w-4xl mx-auto">
              {/* Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">AI Powered Responses</h2>
                    <p className="text-[13px] text-gray-500">
                      Analyze your {submissions.length} response{submissions.length !== 1 ? "s" : ""} with custom assumptions and questions
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom assumption / context */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Assumption / Context
                </label>
                <textarea
                  value={aiAssumption}
                  onChange={(e) => setAiAssumption(e.target.value)}
                  placeholder="e.g. Assume this survey targets UAS operators in East Africa. Focus on organizations with 10+ employees. Consider the regulatory environment of Rwanda..."
                  rows={3}
                  className="w-full resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Set context or assumptions to tailor the AI analysis to your specific needs
                </p>
              </div>

              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2">
                {[
                  "Summarize the key findings from all responses",
                  "What are the top 3 trends in this data?",
                  "Identify the most common responses and outliers",
                  "What actionable recommendations can you draw?",
                  "Compare and contrast the different respondent profiles",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAiAnalyze(q)}
                    disabled={aiLoading}
                    className="text-[13px] px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat input */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleAiAnalyze() }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleAiAnalyze()
                      }
                    }}
                    placeholder="Ask a question about your responses..."
                    rows={2}
                    className="flex-1 resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    disabled={aiLoading}
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="p-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>

              {/* AI Response */}
              {(aiResponse || aiLoading) && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-900">AI Response</span>
                    {aiLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />}
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4 [&_p]:mb-2 [&_h1]:mb-2 [&_h2]:mb-2 [&_h2]:mt-4 [&_h3]:mb-1 [&_h3]:mt-3 [&_strong]:font-semibold whitespace-pre-wrap">
                    {aiResponse || "Analyzing your data..."}
                  </div>
                </div>
              )}

              {/* Previous analyses */}
              {aiHistory.length > 1 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500">Previous analyses</h3>
                  {aiHistory.slice(0, -1).reverse().map((item, i) => (
                    <details key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                      <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50">
                        {item.prompt}
                      </summary>
                      <div className="px-4 pb-4 pt-1 prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap border-t border-gray-100">
                        {item.response}
                      </div>
                    </details>
                  ))}
                </div>
              )}

              {submissions.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                  <Sparkles className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="font-medium text-gray-900 mb-1">No data yet</p>
                  <p className="text-[13px] text-gray-500">
                    AI analysis will be available once you receive responses.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail Side Panel */}
        {detailSubmission && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end">
            <div
              className="w-full max-w-md h-full bg-background border-l shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center justify-between z-10">
                <h3 className="font-semibold">Response Detail</h3>
                <div className="flex items-center gap-2">
                  {isOwner && (
                    <button
                      onClick={() => handleDelete([detailSubmission.id])}
                      className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setDetailId(null)}
                    className="p-1.5 rounded hover:bg-muted"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(
                    detailSubmission.meta?.submittedAt ||
                      detailSubmission.createdAt
                  ).toLocaleString()}
                </div>
                {form?.sections?.map((section) => (
                  <div key={section.id}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-3">
                      {section.title}
                    </p>
                    {section.fields.map((field) => {
                      const raw = getCellValue(
                        detailSubmission,
                        field.name
                      )
                      const display = formatCellValue(raw)
                      return (
                        <div
                          key={field.id}
                          className="border-b pb-3 mb-3"
                        >
                          <p className="text-xs text-muted-foreground mb-1">
                            {field.label}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">
                            {display || (
                              <span className="text-muted-foreground/40 italic">
                                No response
                              </span>
                            )}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
