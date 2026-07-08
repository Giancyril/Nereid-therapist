import React from 'react';
import { TrendingUp, BarChart2, Smile, AlertTriangle, Calendar, Heart, ShieldAlert, Info } from 'lucide-react';
import './Insights.css';

const Insights = ({ chats = [] }) => {
  // Aggregate stats from chats
  let totalUserMessages = 0;
  let moodCounts = { anxious: 0, sad: 0, neutral: 0, happy: 0, overwhelmed: 0, crisis: 0 };
  let topicCounts = {};
  let distressTrend = []; // List of { level: number, mood: string, label: string }
  let urgencyCounts = { low: 0, moderate: 0, high: 0, immediate: 0 };

  chats.forEach((chat) => {
    chat.messages.forEach((msg) => {
      if (msg.sender === 'user') {
        totalUserMessages++;
        
        const analysis = msg.analysis;
        if (analysis) {
          // 1. Mood
          const mood = analysis.emotional_state || 'neutral';
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;

          // 2. Urgency
          const urgency = analysis.urgency || 'low';
          urgencyCounts[urgency] = (urgencyCounts[urgency] || 0) + 1;

          // 3. Topics
          const topics = analysis.topics || [];
          topics.forEach((t) => {
            topicCounts[t] = (topicCounts[t] || 0) + 1;
          });

          // 4. Trend point
          let level = 1; // Low
          if (urgency === 'moderate') level = 2;
          if (urgency === 'high') level = 3;
          if (urgency === 'immediate') level = 4;
          
          distressTrend.push({
            level,
            mood,
            time: msg.timestamp || ''
          });
        }
      }
    });
  });

  // Calculate dominant mood
  let dominantMood = 'neutral';
  let maxMoodCount = -1;
  Object.keys(moodCounts).forEach((mood) => {
    if (moodCounts[mood] > maxMoodCount && moodCounts[mood] > 0) {
      maxMoodCount = moodCounts[mood];
      dominantMood = mood;
    }
  });

  // Build line chart SVG elements if data exists
  const buildTrendLine = () => {
    const points = distressTrend.slice(-10); // Display last 10 messages
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
  };

  const trendData = buildTrendLine();

  // Get Advice based on dominant mood
  const getActionableAdvice = () => {
    switch (dominantMood) {
      case 'anxious':
        return {
          title: 'Managing Anxiety & Stress',
          text: 'We noticed you have been feeling anxious recently. Box breathing can help stimulate your vagus nerve and slow your heart rate.',
          recommendation: 'Try a 5-minute Box Breathing exercise on the Resources tab.',
          color: 'teal'
        };
      case 'overwhelmed':
        return {
          title: 'Overcoming Sensory / Mind Overload',
          text: 'When feeling overwhelmed, taking immediate action can be difficult. Breaking tasks down and using grounding methods helps.',
          recommendation: 'Try the 5-4-3-2-1 Grounding Method on the Resources tab.',
          color: 'blue'
        };
      case 'sad':
        return {
          title: 'Coping with Sadness & Low Mood',
          text: 'Sadness is a natural emotional release. Remember to be gentle with yourself. Small actions, like writing thoughts down, help process it.',
          recommendation: 'Explore the Journaling prompts on the Resources tab.',
          color: 'purple'
        };
      case 'crisis':
        return {
          title: 'Important Support Notice',
          text: 'Your entries show significant distress. Please consider talking to a healthcare professional or a crisis line.',
          recommendation: 'Dial 988 or reach out using the Emergency resources.',
          color: 'red'
        };
      default:
        return {
          title: 'Maintaining Positive Mental Wellness',
          text: 'You are doing great! Consistently reviewing your emotional state helps build emotional intelligence and resilience over time.',
          recommendation: 'Continue chatting with Nereid and practicing mindful reflections.',
          color: 'teal'
        };
    }
  };

  const advice = getActionableAdvice();

  // Format topic labels
  const formatTopic = (topic) => {
    return topic
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Check if we have any analysis data
  const hasData = totalUserMessages > 0 && Object.values(moodCounts).some((v) => v > 0);

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
          <p>Once you start sharing and chatting with Nereid, we will generate your mood analysis, distressed trends, and wellness advice here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-container">
      {/* ── Header ── */}
      <div className="insights-header">
        <div>
          <h1 className="insights-title">Emotional Insights</h1>
          <p className="insights-subtitle">Analysis of your mood, topics, and wellbeing trends</p>
        </div>
        <div className="last-updated-badge">
          <Calendar size={12} />
          <span>Active Session Analysis</span>
        </div>
      </div>

      <div className="insights-content">
        
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
              <span>{totalUserMessages} Messages</span>
            </div>
            <p className="stat-desc">Total emotional inputs shared with Nereid in this session.</p>
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
            <p className="chart-desc">Intensity of distress over your last 10 messages.</p>
            
            <div className="trend-chart-container">
              {trendData ? (
                <div className="svg-chart-wrap">
                  <svg viewBox="0 0 500 150" className="trend-svg">
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
                    <path d={trendData.areaD} fill="url(#chartGradient)" />

                    {/* Line path */}
                    <path d={trendData.pathD} fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Interactive dots */}
                    {trendData.xCoords.map((x, idx) => (
                      <circle
                        key={idx}
                        cx={x}
                        cy={trendData.yCoords[idx]}
                        r="4"
                        fill="#0d1117"
                        stroke="#2dd4bf"
                        strokeWidth="2"
                        className="trend-dot"
                      />
                    ))}
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
                const percentage = Math.round((count / totalUserMessages) * 100);
                
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
                  const percentage = Math.round((count / totalUserMessages) * 100);
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
