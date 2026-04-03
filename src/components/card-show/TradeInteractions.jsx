import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ThumbsUp, ThumbsDown, MessageCircle, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TradeInteractions({ tradeId, currentUserEmail }) {
  const [reactions, setReactions] = useState([]);
  const [comments, setComments] = useState([]);
  const [userReaction, setUserReaction] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [pendingMsg, setPendingMsg] = useState('');

  useEffect(() => {
    base44.entities.TradeReaction.filter({ trade_id: tradeId }).then(data => {
      setReactions(data);
      const mine = data.find(r => r.user_email === currentUserEmail);
      setUserReaction(mine?.reaction || null);
    });
    base44.entities.TradeComment.filter({ trade_id: tradeId, status: 'approved' }, '-created_date').then(setComments);
  }, [tradeId]);

  const likes = reactions.filter(r => r.reaction === 'like').length;
  const dislikes = reactions.filter(r => r.reaction === 'dislike').length;

  const handleReact = async (type) => {
    if (reacting) return;
    setReacting(true);

    const existing = reactions.find(r => r.user_email === currentUserEmail);

    if (existing) {
      if (existing.reaction === type) {
        // Toggle off
        await base44.entities.TradeReaction.delete(existing.id);
        setReactions(prev => prev.filter(r => r.id !== existing.id));
        setUserReaction(null);
      } else {
        // Switch reaction
        await base44.entities.TradeReaction.update(existing.id, { reaction: type });
        setReactions(prev => prev.map(r => r.id === existing.id ? { ...r, reaction: type } : r));
        setUserReaction(type);
      }
    } else {
      const created = await base44.entities.TradeReaction.create({
        trade_id: tradeId,
        user_email: currentUserEmail,
        reaction: type
      });
      setReactions(prev => [...prev, created]);
      setUserReaction(type);
    }

    setReacting(false);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    setPendingMsg('');

    const res = await base44.functions.invoke('moderateAndPostComment', {
      trade_id: tradeId,
      text: commentText.trim()
    });

    if (res.data?.approved) {
      setComments(prev => [res.data.comment, ...prev]);
      setCommentText('');
      setShowComments(true);
    } else {
      setPendingMsg(res.data?.reason || 'Your comment was not approved.');
    }

    setSubmitting(false);
  };

  const commentCount = comments.length;

  return (
    <div className="border-t border-border/30 px-3.5 pt-2.5 pb-3">
      {/* Reaction + comment toggle row */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleReact('like')}
          disabled={reacting}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${userReaction === 'like' ? 'bg-green-400/15 border-green-400/40 text-green-400' : 'border-border/40 text-muted-foreground hover:text-green-400 hover:border-green-400/30'}`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />{likes > 0 && <span>{likes}</span>}
        </button>

        <button
          onClick={() => handleReact('dislike')}
          disabled={reacting}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${userReaction === 'dislike' ? 'bg-red-400/15 border-red-400/40 text-red-400' : 'border-border/40 text-muted-foreground hover:text-red-400 hover:border-red-400/30'}`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />{dislikes > 0 && <span>{dislikes}</span>}
        </button>

        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-border/40 text-muted-foreground hover:text-foreground transition-colors ml-auto"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}` : 'Comment'}
          {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary border border-border/50 flex items-center justify-center shrink-0 text-[10px] font-bold text-muted-foreground uppercase">
                    {(c.user_name || c.user_email)?.[0]}
                  </div>
                  <div className="flex-1 bg-secondary/40 rounded-xl px-2.5 py-1.5">
                    <p className="text-[11px] font-semibold text-foreground">{c.user_name || c.user_email}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{c.text}</p>
                  </div>
                </div>
              ))}

              {/* Input */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
                  placeholder="Add a comment..."
                  maxLength={280}
                  className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={submitting || !commentText.trim()}
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>

              {pendingMsg && (
                <p className="text-[11px] text-red-400 mt-1 px-1">{pendingMsg}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}