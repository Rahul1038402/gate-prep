import type { Subject } from '@/types'

interface Props {
  subject: Subject
  completedTopics: Set<string>
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutSegmentPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startAngle: number, endAngle: number
): string {
  const os = polarToCartesian(cx, cy, outerR, startAngle)
  const oe = polarToCartesian(cx, cy, outerR, endAngle)
  const is = polarToCartesian(cx, cy, innerR, startAngle)
  const ie = polarToCartesian(cx, cy, innerR, endAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return [
    `M ${os.x} ${os.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${oe.x} ${oe.y}`,
    `L ${ie.x} ${ie.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${is.x} ${is.y}`,
    'Z',
  ].join(' ')
}

export default function SubjectProgressChart({ subject, completedTopics }: Props) {
  const chapters = subject.chapters ?? []

  // Only weighted topics count toward progress %
  const weightedTopicCount = (ch: typeof chapters[0]) =>
    ch.topics.filter(t => !ch.zeroWeightTopics?.includes(t)).length

  const totalWeightedTopics = chapters.reduce((s, c) => s + weightedTopicCount(c), 0)

  if (!chapters.length || totalWeightedTopics === 0) return null

  const CX = 120, CY = 120, OR = 105, IR = 68
  const GAP_DEG = chapters.length > 1 ? 4 : 0
  const usableDeg = 360 - GAP_DEG * chapters.length

  let cursor = -90
  const segments = chapters.map(ch => {
    const weighted = weightedTopicCount(ch)
    const chDeg = (weighted / totalWeightedTopics) * usableDeg

    const completedWeighted = ch.topics.filter(t =>
      !ch.zeroWeightTopics?.includes(t) && completedTopics.has(`${ch.id}:${t}`)
    ).length
    const completedDeg = weighted > 0 ? (completedWeighted / weighted) * chDeg : 0

    const totalAll = ch.topics.length
    const completedAll = ch.topics.filter(t => completedTopics.has(`${ch.id}:${t}`)).length

    const seg = {
      chapter: ch,
      startAngle: cursor,
      completedEndAngle: cursor + completedDeg,
      endAngle: cursor + chDeg,
      completedWeighted,
      weightedTotal: weighted,
      completedAll,
      totalAll,
    }
    cursor += chDeg + GAP_DEG
    return seg
  })

  const totalCompleted = segments.reduce((s, seg) => s + seg.completedWeighted, 0)
  const overallPct = Math.round((totalCompleted / totalWeightedTopics) * 100)

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 animate-slide-up">
      <h2 className="text-white font-semibold text-sm mb-6">Syllabus Progress</h2>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Donut chart */}
        <div className="flex-shrink-0">
          <svg viewBox="0 0 240 240" width="200" height="200">
            <circle
              cx={CX} cy={CY} r={(OR + IR) / 2}
              fill="none" stroke="#1e1e1e" strokeWidth={OR - IR}
            />

            {segments.map(seg => {
              const { startAngle, completedEndAngle, endAngle, chapter } = seg
              const hasCompleted = completedEndAngle - startAngle > 0.5
              const hasRemaining = endAngle - (hasCompleted ? completedEndAngle : startAngle) > 0.5
              if (endAngle - startAngle < 0.5) return null

              return (
                <g key={chapter.id}>
                  {hasRemaining && (
                    <path
                      d={donutSegmentPath(
                        CX, CY, OR, IR,
                        hasCompleted ? completedEndAngle : startAngle,
                        endAngle
                      )}
                      fill="#2a2a2a"
                    />
                  )}
                  {hasCompleted && (
                    <path
                      d={donutSegmentPath(CX, CY, OR, IR, startAngle, completedEndAngle)}
                      fill={subject.color} opacity={0.85}
                    />
                  )}
                </g>
              )
            })}

            <text x={CX} y={CY - 10} textAnchor="middle" fill="white"
              fontSize="30" fontWeight="600" fontFamily="ui-monospace, monospace">
              {overallPct}%
            </text>
            <text x={CX} y={CY + 13} textAnchor="middle" fill="#666"
              fontSize="11" fontFamily="ui-monospace, monospace">
              complete
            </text>
            <text x={CX} y={CY + 30} textAnchor="middle" fill="#555"
              fontSize="10" fontFamily="ui-monospace, monospace">
              {totalCompleted}/{totalWeightedTopics} topics
            </text>
          </svg>
        </div>

        {/* Chapter legend */}
        <div className="flex-1 w-full space-y-3.5 min-w-0">
          {segments.map(seg => {
            const pct = seg.weightedTotal > 0
              ? (seg.completedWeighted / seg.weightedTotal) * 100
              : 0
            const hasUnweighted = seg.totalAll > seg.weightedTotal

            return (
              <div key={seg.chapter.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-sm font-medium truncate mr-2">
                    {seg.chapter.name}
                  </span>
                  <span className="text-muted text-xs font-mono shrink-0 flex items-center gap-1.5">
                    {seg.completedWeighted}/{seg.weightedTotal}
                    {hasUnweighted && (
                      <span className="text-[10px] text-muted/50 font-mono">+basics</span>
                    )}
                  </span>
                </div>
                <div className="bg-surface rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ backgroundColor: subject.color, width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}