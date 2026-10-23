import React, { useState } from 'react';
import { FeedbackItem, Station } from '../types';
import { MessageSquare, ThumbsUp, Star, AlertTriangle, CheckCircle, Plus, Send } from 'lucide-react';

interface CommunityFeedbackProps {
  feedbackList: FeedbackItem[];
  stations: Station[];
  onSubmitFeedback: (item: FeedbackItem) => void;
  onUpvoteFeedback: (id: string) => void;
}

export const CommunityFeedback: React.FC<CommunityFeedbackProps> = ({
  feedbackList,
  stations,
  onSubmitFeedback,
  onUpvoteFeedback,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stationId, setStationId] = useState(stations[0]?.id || '');
  const [category, setCategory] = useState<FeedbackItem['category']>('STATION');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const matchedStation = stations.find((s) => s.id === stationId);
    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      stationId,
      stationName: matchedStation?.name || 'General Platform',
      userEmail: 'driver.verified@fuelsync.in',
      category,
      rating,
      comment: comment.trim(),
      timestamp: 'Just now',
      upvotes: 1,
      resolved: false,
    };

    onSubmitFeedback(newItem);
    setComment('');
    setIsSubmitting(false);
  };

  const filteredItems = feedbackList.filter(
    (item) => filterCategory === 'ALL' || item.category === filterCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>COMMUNITY SENSOR AUDIT &amp; REVIEWS</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Driver Community &amp; Station Trust</h2>
          <p className="text-xs text-slate-400">
            Real driver reports on charger uptime, CNG line pressure accuracy, and highway amenity cleanlines.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitting(!isSubmitting)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isSubmitting ? 'Cancel' : 'Post Station Report'}</span>
        </button>
      </div>

      {/* Submission Form */}
      {isSubmitting && (
        <form onSubmit={handleSubmit} className="p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-4 text-xs">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Submit Driver Feedback / Hardware Report</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Select Station</label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2 text-xs"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Report Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackItem['category'])}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2 text-xs"
              >
                <option value="STATION">Station Experience</option>
                <option value="CHARGER">EV Charger Hardware</option>
                <option value="CNG_PRESSURE">CNG Manifold Pressure</option>
                <option value="QUEUE_ACCURACY">Queue Time Accuracy</option>
                <option value="APP">App Feature Request</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2 text-xs font-mono"
              >
                <option value={5}>★★★★★ (5 - Excellent)</option>
                <option value={4}>★★★★☆ (4 - Good)</option>
                <option value={3}>★★★☆☆ (3 - Average / Slow)</option>
                <option value={2}>★★☆☆☆ (2 - Hardware Defect)</option>
                <option value={1}>★☆☆☆☆ (1 - Inoperable)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Details &amp; Observations</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. CCS2 120kW bay charged smoothly at 95kW. Café lounge had good WiFi."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded p-2.5 text-xs"
            ></textarea>
          </div>

          <button
            type="submit"
            className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Report</span>
          </button>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
        {['ALL', 'STATION', 'CHARGER', 'CNG_PRESSURE', 'QUEUE_ACCURACY'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-colors ${
              filterCategory === cat
                ? 'bg-slate-800 border-emerald-500 text-emerald-300 font-semibold'
                : 'border-slate-800 text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{item.stationName}</span>
                <span className="text-[11px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {item.category.replace('_', ' ')}
                </span>
                {item.resolved && (
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Station Verified</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-amber-400 font-mono">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">{item.comment}</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span>{item.userEmail}</span>
                <span aria-hidden="true">·</span>
                <span>{item.timestamp}</span>
              </div>

              <button
                onClick={() => onUpvoteFeedback(item.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <ThumbsUp className="w-3 h-3 text-emerald-400" />
                <span className="font-mono">{item.upvotes} Helpful</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
