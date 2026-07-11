import React, { useState, useMemo } from 'react';
import { TrendingUp, BarChart2, Smile, AlertTriangle, Heart, Info, BookOpen, MessageSquare, Download, Calendar } from 'lucide-react';
import { getJournalEntries } from '../utils/journalStorage';
import './Insights.css';

const Insights = ({ chats = [] }) => {
  const [filter, setFilter] = useState('both'); // both, chat, journal
  const [digestPeriod, setDigestPeriod] = useState('week'); // 'week' | 'month'

  const journalEntries = useMemo(() => getJournalEntries(), []);

  // Aggregate stats from chats and/or journal
  const {
    totalReflections,
    moodCounts,
    topicCounts,
    distressTrend,
    urgencyCounts,
    hasData
  } = useMemo(() => {
    let totalReflections = 0;
    let moodCounts = { anxious: 0, sad: 0, neutral: 0, happy: 0, overwhelmed: 0, crisis: 0 };
    let topicCounts = {};
    let distressTrend = []; // List of { level: number, mood: string, time: string, timestamp: number, source: string }
    let urgencyCounts = { low: 0, moderate: 0, high: 0, immediate: 0 };
    let hasData = false;

    const includeChat = filter === 'both' || filter === 'chat';
    const includeJournal = filter === 'both' || filter === 'journal';

    if (includeChat) {
      chats.forEach((chat) => {
        chat.messages.forEach((msg) => {
          if (msg.sender === 'user') {
            const analysis = msg.analysis;
            if (analysis) {
              hasData = true;
              totalReflections++;
              const mood = analysis.emotional_state || 'neutral';
              moodCounts[mood] = (moodCounts[mood] || 0) + 1;
              
              const urgency = analysis.urgency || 'low';
              urgencyCounts[urgency] = (urgencyCounts[urgency] || 0) + 1;
              
              const topics = analysis.topics || [];
              topics.forEach((t) => {
                topicCounts[t] = (topicCounts[t] || 0) + 1;
              });

              let level = 1;
              if (urgency === 'moderate') level = 2;
              if (urgency === 'high') level = 3;
              if (urgency === 'immediate') level = 4;

              distressTrend.push({
                level,
                mood,
                time: msg.timestamp || '',
                timestamp: msg.id || Date.now(),
                source: 'chat'
              });
            }
          }
        });
      });
    }

    if (includeJournal) {
      journalEntries.forEach((entry) => {
        if (entry.sentiment) {
          hasData = true;
          totalReflections++;
          const mood = entry.sentiment || 'neutral';
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
          
          const urgency = entry.urgency || 'low';
          urgencyCounts[urgency] = (urgencyCounts[urgency] || 0) + 1;
          
          const topics = entry.topics || [];
          topics.forEach((t) => {
            topicCounts[t] = (topicCounts[t] || 0) + 1;
          });

          let level = 1;
          if (urgency === 'moderate') level = 2;
          if (urgency === 'high') level = 3;
          if (urgency === 'immediate') level = 4;

          distressTrend.push({
            level,
            mood,
            time: new Date(entry.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            timestamp: new Date(entry.createdAt).getTime(),
            source: 'journal'
          });
        }
      });
    }

    // Sort chronologically for the chart path
    distressTrend.sort((a, b) => a.timestamp - b.timestamp);

    return {
      totalReflections,
      moodCounts,
      topicCounts,
      distressTrend,
      urgencyCounts,
      hasData
    };
  }, [chats, journalEntries, filter]);

  // Calculate dominant mood
  const dominantMood = useMemo(() => {
    let domMood = 'neutral';
    let maxMoodCount = -1;
    Object.keys(moodCounts).forEach((mood) => {
      if (moodCounts[mood] > maxMoodCount && moodCounts[mood] > 0) {
        maxMoodCount = moodCounts[mood];
        domMood = mood;
      }
    });
    return domMood;
  }, [moodCounts]);

  // Build line chart SVG elements if data exists
  const trendData = useMemo(() => {
    const points = distressTrend.slice(-10); // Display last 10 points
    if (points.length < 2) return null;

    const width = 500;
    const height = 150;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const xCoords = points.map((_, i) => padding + (i / (points.length - 1)) * chartWidth);
    const yCoords = points.map((p) => {
      const percent = (p.level - 1) / 3; // Normalize 1-4 level to 0-1
      return height - padding - percent * chartHeight;
    });

    let pathD = `M ${xCoords[0]} ${yCoords[0]}`;
    for (let i = 1; i < xCoords.length; i++) {
      // Create smooth Bezier curve connection
      const cpX1 = xCoords[i - 1] + (xCoords[i] - xCoords[i - 1]) / 2;
      const cpY1 = yCoords[i - 1];
      const cpX2 = cpX1;
      const cpY2 = yCoords[i];
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${xCoords[i]} ${yCoords[i]}`;
    }

    const areaD = `${pathD} L ${xCoords[xCoords.length - 1]} ${height - padding} L ${xCoords[0]} ${height - padding} Z`;

    return { pathD, areaD, xCoords, yCoords, points };
  }, [distressTrend]);

  // Get Advice based on dominant mood
  const advice = useMemo(() => {
    switch (dominantMood) {
      case 'anxious':
        return {
          title: 'Managing Anxiety & Stress',
          text: 'We noticed you have been feeling anxious recently. Box breathing can help stimulate your vagus nerve and slow your heart rate.',
          recommendation: 'Try a 3-minute guided breathing session in the Resources tab.',
          color: 'purple',
        };
      case 'overwhelmed':
        return {
          title: 'Grounding in Heavy Moments',
          text: 'When distress scales quickly, grounding brings us back. Connecting to physical surroundings interrupts rising panic loops.',
          recommendation: 'Open the Resources tab and use the 5-4-3-2-1 Grounding Method.',
          color: 'red',
        };
      case 'sad':
        return {
          title: 'Processing Low Moments',
          text: 'Feeling sad or low is a natural process. Journaling or putting down thoughts without filters helps externalize emotional pressure.',
          recommendation: 'Spend a few minutes in Journal mode to reflect privately.',
          color: 'blue',
        };
      case 'happy':
        return {
          title: 'Preserving Joy & Ease',
          text: 'Experiencing comfort or happiness is wonderful. Write down what created this feeling to anchor it in memory.',
          recommendation: 'Add a positive reflection inside your Journal to read back later.',
          color: 'green',
        };
      case 'crisis':
        return {
          title: 'Professional Support First',
          text: 'You have been walking through extremely heavy waves. Please let professional supporters help guide you to safer shores.',
          recommendation: 'Reach out to the 988 Crisis Line or open your saved Safety Plan.',
          color: 'red',
        };
      default:
        return {
          title: 'Mindfulness & Grounding',
          text: 'Reflective practices strengthen resilience over time. Check in regularly with Nereid or write in your private journal.',
          recommendation: 'Consider scheduling a quiet 5-minute reflection block today.',
          color: 'teal',
        };
    }
  }, [dominantMood]);

  // ── Digest: filter data by selected period ────────────────────────────────
  const digestStats = useMemo(() => {
    const now = Date.now();
    const windowMs = digestPeriod === 'week' ? 7 * 86400000 : 30 * 86400000;
    const prevWindowMs = windowMs * 2;
    const cutoff = now - windowMs;
    const prevCutoff = now - prevWindowMs;

    let current = [];
    let previous = [];

    const includeChat = filter === 'both' || filter === 'chat';
    const includeJournal = filter === 'both' || filter === 'journal';

    if (includeChat) {
      chats.forEach(chat => {
        chat.messages.forEach(msg => {
          if (msg.sender === 'user' && msg.analysis) {
            const ts = msg.id; // Date.now() integer
            if (ts >= cutoff) current.push({ ts, analysis: msg.analysis, source: 'chat' });
            else if (ts >= prevCutoff) previous.push({ ts, analysis: msg.analysis, source: 'chat' });
          }
        });
      });
    }
    if (includeJournal) {
      journalEntries.forEach(entry => {
        if (entry.sentiment && entry.createdAt) {
          const ts = new Date(entry.createdAt).getTime();
          const fakeAnalysis = { urgency: entry.urgency || 'low', emotional_state: entry.sentiment, topics: entry.topics || [] };
          if (ts >= cutoff) current.push({ ts, analysis: fakeAnalysis, source: 'journal' });
          else if (ts >= prevCutoff) previous.push({ ts, analysis: fakeAnalysis, source: 'journal' });
        }
      });
    }

    // Topic counts for current period
    const topicMap = {};
    let distressSum = 0;
    let distressCount = 0;
    current.forEach(({ analysis }) => {
      (analysis.topics || []).forEach(t => { topicMap[t] = (topicMap[t] || 0) + 1; });
      const lvl = analysis.urgency === 'immediate' ? 4 : analysis.urgency === 'high' ? 3 : analysis.urgency === 'moderate' ? 2 : 1;
      distressSum += lvl;
      distressCount++;
    });

    const avgDistress = distressCount > 0 ? (distressSum / distressCount).toFixed(1) : null;
    const prevAvgDistress = previous.length > 0
      ? (previous.reduce((s, { analysis }) => {
          const lvl = analysis.urgency === 'immediate' ? 4 : analysis.urgency === 'high' ? 3 : analysis.urgency === 'moderate' ? 2 : 1;
          return s + lvl;
        }, 0) / previous.length).toFixed(1)
      : null;

    const topTopics = Object.entries(topicMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Plain-language mood summary
    const moodMap = {};
    current.forEach(({ analysis }) => {
      const m = analysis.emotional_state || 'neutral';
      moodMap[m] = (moodMap[m] || 0) + 1;
    });
    const dominantThisPeriod = Object.entries(moodMap).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return { count: current.length, topTopics, avgDistress, prevAvgDistress, dominantThisPeriod };
  }, [chats, journalEntries, filter, digestPeriod]);

  // ── Time-of-day distribution ──────────────────────────────────────────────
  const timeOfDayStats = useMemo(() => {
    // Buckets: morning(6-12), afternoon(12-17), evening(17-21), night(21-6)
    const buckets = { morning: { sum: 0, n: 0 }, afternoon: { sum: 0, n: 0 }, evening: { sum: 0, n: 0 }, night: { sum: 0, n: 0 } };
    const getBucket = (hour) => {
      if (hour >= 6 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 17) return 'afternoon';
      if (hour >= 17 && hour < 21) return 'evening';
      return 'night';
    };
    distressTrend.forEach(pt => {
      const hour = new Date(pt.timestamp).getHours();
      const bucket = getBucket(hour);
      const lvl = pt.level;
      buckets[bucket].sum += lvl;
      buckets[bucket].n++;
    });
    return [
      { key: 'morning',   label: '🌅 Morning',   ...buckets.morning },
      { key: 'afternoon', label: '☀️ Afternoon',  ...buckets.afternoon },
      { key: 'evening',   label: '🌇 Evening',    ...buckets.evening },
      { key: 'night',     label: '🌙 Night',      ...buckets.night },
    ].map(b => ({ ...b, avg: b.n > 0 ? b.sum / b.n : 0 }));
  }, [distressTrend]);

  // ── Day-of-week averages ──────────────────────────────────────────────────
  const dayOfWeekStats = useMemo(() => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const buckets = days.map(() => ({ sum: 0, n: 0 }));
    distressTrend.forEach(pt => {
      const d = new Date(pt.timestamp);
      const idx = (d.getDay() + 6) % 7; // Mon=0…Sun=6
      buckets[idx].sum += pt.level;
      buckets[idx].n++;
    });
    return days.map((label, i) => ({
      label,
      avg: buckets[i].n > 0 ? buckets[i].sum / buckets[i].n : 0,
      n: buckets[i].n,
    }));
  }, [distressTrend]);

  // ── CSV export ────────────────────────────────────────────────────────────
  const handleCSVExport = () => {
    const rows = [['Date','Time','Source','Mood','Urgency','Topics','Distress Level']];
    const includeChat = filter === 'both' || filter === 'chat';
    const includeJournal = filter === 'both' || filter === 'journal';

    if (includeChat) {
      chats.forEach(chat => {
        chat.messages.forEach(msg => {
          if (msg.sender === 'user' && msg.analysis) {
            const d = new Date(msg.id);
            rows.push([
              d.toLocaleDateString(),
              d.toLocaleTimeString(),
              'Chat',
              msg.analysis.emotional_state || '',
              msg.analysis.urgency || '',
              (msg.analysis.topics || []).join('; '),
              msg.analysis.urgency === 'immediate' ? 4 : msg.analysis.urgency === 'high' ? 3 : msg.analysis.urgency === 'moderate' ? 2 : 1,
            ]);
          }
        });
      });
    }
    if (includeJournal) {
      journalEntries.forEach(entry => {
        if (entry.sentiment) {
          const d = new Date(entry.createdAt);
          rows.push([
            d.toLocaleDateString(),
            d.toLocaleTimeString(),
            'Journal',
            entry.sentiment,
            entry.urgency || '',
            (entry.topics || []).join('; '),
            entry.urgency === 'immediate' ? 4 : entry.urgency === 'high' ? 3 : entry.urgency === 'moderate' ? 2 : 1,
          ]);
        }
      });
    }

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nereid-mood-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── PDF/Print export ──────────────────────────────────────────────────────
  const handlePrintExport = () => window.print();

  const formatTopic = (t) => {
    return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (!hasData) {
    return (
      <div className="insights-container">
        <div className="insights-header">
          <div>
            <h1 className="insights-title">Emotional Insights</h1>
            <p className="insights-subtitle">Analysis of your mood, topics, and wellbeing trends</p>
          </div>
        </div>
        <div className="insights-empty-state">
          <div className="empty-icon-wrap">
            <BarChart2 size={48} className="text-muted" />
          </div>
          <h2>Awaiting Emotional Data</h2>
          <p>Once you start sharing, chatting, or writing in your journal, we will generate your mood analysis, distress trends, and wellness advice here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-container">
      {/* ── Header ── */}
      <div className="insights-header-row">
        <div className="insights-header">
          <div>
            <h1 className="insights-title">Emotional Insights</h1>
            <p className="insights-subtitle">Analysis of your mood, topics, and wellbeing trends</p>
          </div>
        </div>

        {/* Export buttons */}
        <div className="insights-export-group">
          <button className="export-btn" onClick={handleCSVExport} title="Export as CSV">
            <Download size={13} /> CSV
          </button>
          <button className="export-btn" onClick={handlePrintExport} title="Print / Save as PDF">
            <Download size={13} /> PDF
          </button>
        </div>

        {/* Filter Toggle */}
        <div className="insights-filter-group">
          <button className={`filter-btn ${filter === 'both' ? 'active' : ''}`} onClick={() => setFilter('both')}>All Data</button>
          <button className={`filter-btn ${filter === 'chat' ? 'active' : ''}`} onClick={() => setFilter('chat')}>
            <MessageSquare size={12} /><span>Chat Only</span>
          </button>
          <button className={`filter-btn ${filter === 'journal' ? 'active' : ''}`} onClick={() => setFilter('journal')}>
            <BookOpen size={12} /><span>Journal Only</span>
          </button>
        </div>
      </div>

      <div className="insights-content">

        {/* ── DIGEST ────────────────────────────────────────────────────── */}
        <div className="digest-card">
          <div className="digest-header">
            <div className="digest-header-left">
              <Calendar size={16} className="text-teal" />
              <span className="digest-title">
                {digestPeriod === 'week' ? "This Week's Digest" : "This Month's Digest"}
              </span>
            </div>
            <div className="digest-period-toggle">
              <button className={`period-btn ${digestPeriod === 'week' ? 'active' : ''}`} onClick={() => setDigestPeriod('week')}>Week</button>
              <button className={`period-btn ${digestPeriod === 'month' ? 'active' : ''}`} onClick={() => setDigestPeriod('month')}>Month</button>
            </div>
          </div>
          {digestStats.count === 0 ? (
            <p className="digest-empty">No entries in this period yet — start chatting or journaling to see your digest.</p>
          ) : (
            <div className="digest-body">
              <div className="digest-summary-row">
                <div className="digest-stat">
                  <span className="digest-stat-val">{digestStats.count}</span>
                  <span className="digest-stat-label">check-ins</span>
                </div>
                {digestStats.avgDistress && (
                  <div className="digest-stat">
                    <span className="digest-stat-val">{digestStats.avgDistress}<span className="digest-stat-of">/4</span></span>
                    <span className="digest-stat-label">avg distress
                      {digestStats.prevAvgDistress && (
                        <span className={`digest-delta ${parseFloat(digestStats.avgDistress) < parseFloat(digestStats.prevAvgDistress) ? 'delta-better' : 'delta-worse'}`}>
                          {parseFloat(digestStats.avgDistress) < parseFloat(digestStats.prevAvgDistress) ? ' ↓' : ' ↑'}
                          {Math.abs(digestStats.avgDistress - digestStats.prevAvgDistress).toFixed(1)}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {digestStats.dominantThisPeriod && (
                  <div className="digest-stat">
                    <span className="digest-stat-val digest-mood-pill">{digestStats.dominantThisPeriod}</span>
                    <span className="digest-stat-label">primary mood</span>
                  </div>
                )}
              </div>
              {digestStats.topTopics.length > 0 && (
                <div className="digest-topics">
                  <span className="digest-topics-label">Top topics this period:</span>
                  {digestStats.topTopics.map(([t, c]) => (
                    <span key={t} className="digest-topic-chip">
                      {formatTopic(t)} <span className="chip-count">×{c}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>


        {/* Top Row Overview Cards */}
        <div className="insights-grid-three">
          <div className="insight-stat-card">
            <h3>Dominant Mood</h3>
            <div className="stat-val dominant-mood-val">
              <Smile className={`mood-icon-${dominantMood}`} size={20} />
              <span>{dominantMood.charAt(0).toUpperCase() + dominantMood.slice(1)}</span>
            </div>
            <p className="stat-desc">Primary emotional state analyzed from your responses.</p>
          </div>

          <div className="insight-stat-card">
            <h3>Distress Level</h3>
            <div className="stat-val">
              <AlertTriangle className={urgencyCounts.high > 0 || urgencyCounts.immediate > 0 ? 'text-red' : 'text-teal'} size={20} />
              <span>
                {urgencyCounts.immediate > 0 ? 'Urgent crisis support needed' : 
                 urgencyCounts.high > 0 ? 'High Distress' : 
                 urgencyCounts.moderate > 0 ? 'Moderate Distress' : 'Low / Calm'}
              </span>
            </div>
            <p className="stat-desc">Urgency classification based on message distress level.</p>
          </div>

          <div className="insight-stat-card">
            <h3>Total Reflections</h3>
            <div className="stat-val text-teal">
              <Heart size={20} />
              <span>{totalReflections} Inputs</span>
            </div>
            <p className="stat-desc">Total inputs analyzed from your selected reflections.</p>
          </div>
        </div>

        {/* Middle Row Charts */}
        <div className="insights-charts-grid">
          
          {/* Trend Line Chart */}
          <div className="insight-chart-card trend-chart">
            <div className="chart-header">
              <TrendingUp size={16} className="text-teal" />
              <h3>Emotional Distress Trend</h3>
            </div>
            <p className="chart-desc">
              Intensity of distress over last 10 inputs. 
              <span className="legend-marker chat-marker">●</span> Chat 
              <span className="legend-marker journal-marker">●</span> Journal
            </p>
            
            <div className="trend-chart-container">
              {trendData ? (
                <div className="svg-chart-wrap">
                  <svg
                    viewBox="0 0 500 150"
                    className="trend-svg"
                    role="img"
                    aria-label="Line chart showing your emotional distress trend over the last 10 entries. Use Tab to inspect individual points."
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    <line x1="20" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="20" y1="60" x2="480" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="20" y1="100" x2="480" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="20" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

                    {/* Gradient Area under line */}
                    <path d={trendData.areaD} fill="url(#chartGradient)" aria-hidden="true" />

                    {/* Line path */}
                    <path d={trendData.pathD} fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" />

                    {/* Interactive dots */}
                    {trendData.xCoords.map((x, idx) => {
                      const pt = trendData.points[idx];
                      const strokeColor = pt.source === 'journal' ? 'var(--mood-anxious)' : '#2dd4bf';
                      const distressLabels = ['Low / Calm', 'Moderate Distress', 'High Distress', 'Urgent Crisis'];
                      const distressText = distressLabels[pt.level - 1] || `${pt.level} out of 4`;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={trendData.yCoords[idx]}
                          r="4.5"
                          fill="#0d1117"
                          stroke={strokeColor}
                          strokeWidth="2.5"
                          className="trend-dot"
                          role="img"
                          tabIndex={0}
                          aria-label={`Point ${idx + 1}: ${pt.source === 'journal' ? 'Journal entry' : 'Chat message'} with ${distressText} recorded at ${pt.time}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                            }
                          }}
                        />
                      );
                    })}
                  </svg>
                  <div className="chart-y-axis-labels">
                    <span>Crisis</span>
                    <span>High</span>
                    <span>Mod</span>
                    <span>Low</span>
                  </div>
                </div>
              ) : (
                <div className="chart-fallback">
                  <p>Need at least 2 entries to calculate distress trends.</p>
                </div>
              )}
            </div>
          </div>

          {/* Mood Breakdown Circular percentage items */}
          <div className="insight-chart-card mood-breakdown">
            <div className="chart-header">
              <Smile size={16} className="text-teal" />
              <h3>Mood Breakdown</h3>
            </div>
            <p className="chart-desc">Distribution of moods detected across messages.</p>
            
            <div className="mood-bars-wrap">
              {Object.keys(moodCounts).map((mood) => {
                const count = moodCounts[mood];
                if (count === 0) return null;
                const percentage = Math.round((count / totalReflections) * 100);
                
                return (
                  <div key={mood} className="mood-progress-row">
                    <div className="mood-progress-meta">
                      <span className="mood-name">{mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
                      <span className="mood-count">{count} ({percentage}%)</span>
                    </div>
                    <div className="mood-progress-bar-bg">
                      <div 
                        className={`mood-progress-bar-fill bar-${mood}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── TIME PATTERNS ──────────────────────────────────────────────── */}
        <div className="insights-charts-grid insights-time-grid">

          {/* Time of Day */}
          <div
            className="insight-chart-card"
            role="img"
            aria-label={`Distress level by time of day: ${timeOfDayStats.map(b => `${b.label}: ${b.n > 0 ? b.avg.toFixed(1) + ' average distress' : 'no check-ins'}`).join(', ')}`}
          >
            <div className="chart-header">
              <span style={{ fontSize: 16 }} aria-hidden="true">⏰</span>
              <h3>Mood by Time of Day</h3>
            </div>
            <p className="chart-desc" aria-hidden="true">Average distress level per time slot (1 = calm, 4 = crisis).</p>
            <div className="tod-bars" aria-hidden="true">
              {timeOfDayStats.map(b => (
                <div key={b.key} className="tod-bar-row">
                  <span className="tod-label">{b.label}</span>
                  <div className="tod-bar-bg">
                    <div
                      className={`tod-bar-fill tod-fill-${b.key}`}
                      style={{ width: b.n > 0 ? `${(b.avg / 4) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="tod-count">{b.n > 0 ? `${b.avg.toFixed(1)} (${b.n})` : '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Day of Week */}
          <div
            className="insight-chart-card"
            role="img"
            aria-label={`Distress level by day of week: ${dayOfWeekStats.map(d => `${d.label}: ${d.n > 0 ? d.avg.toFixed(1) + ' average distress' : 'no check-ins'}`).join(', ')}`}
          >
            <div className="chart-header">
              <span style={{ fontSize: 16 }} aria-hidden="true">📅</span>
              <h3>Mood by Day of Week</h3>
            </div>
            <p className="chart-desc" aria-hidden="true">Average distress per day. Taller bars = more distress recorded.</p>
            <div className="dow-bars" aria-hidden="true">
              {dayOfWeekStats.map(d => (
                <div key={d.label} className="dow-col">
                  <div className="dow-bar-wrap">
                    <div
                      className="dow-bar-fill"
                      style={{ height: d.n > 0 ? `${(d.avg / 4) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="dow-label">{d.label}</span>
                  {d.n > 0 && <span className="dow-count">{d.avg.toFixed(1)}</span>}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Row Advice and Topics Grid */}
        <div className="insights-bottom-grid">
          
          {/* Actionable Advice Card */}
          <div className={`advice-card border-${advice.color}`}>
            <div className="advice-header">
              <Heart className={`text-${advice.color}`} size={18} />
              <h2>{advice.title}</h2>
            </div>
            <p className="advice-text">{advice.text}</p>
            <div className="advice-recommendation">
              <Info size={14} />
              <span>{advice.recommendation}</span>
            </div>
          </div>

          {/* Topics Card */}
          <div className="insight-chart-card topics-card">
            <div className="chart-header">
              <BarChart2 size={16} className="text-teal" />
              <h3>Discussion Topics</h3>
            </div>
            <p className="chart-desc">Common discussion subjects identified in your entries.</p>
            
            <div className="topics-list-wrap">
              {Object.keys(topicCounts).length > 0 ? (
                Object.keys(topicCounts).map((topic) => {
                  const count = topicCounts[topic];
                  const percentage = Math.round((count / totalReflections) * 100);
                  return (
                    <div key={topic} className="topic-bar-row">
                      <div className="topic-name">{formatTopic(topic)}</div>
                      <div className="topic-bar-bg">
                        <div className="topic-bar-fill" style={{ width: `${percentage}%` }} />
                      </div>
                      <div className="topic-percent">{percentage}%</div>
                    </div>
                  );
                })
              ) : (
                <div className="no-topics-fallback">
                  <p>No specific topics classified yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Insights;
