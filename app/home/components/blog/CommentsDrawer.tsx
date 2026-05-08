"use client";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 04/05/2026
 * funcionalidad: renderiza un cajón flotante (drawer) interactivo que muestra la lista completa de comentarios, gestiona el estado de carga y coordina la acción de responder entre los comentarios y el formulario de entrada
 */
import { useEffect, useState, useCallback } from "react";
import { X, SlidersHorizontal, Loader2 } from "lucide-react";
import CommentInput from "./CommentInput";
import CommentItem, { CommentData } from "./CommentItem";

export default function CommentsDrawer({ blogId, isOpen, onClose }: any) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);
  const [latestReply, setLatestReply] = useState<{parentId: number, comment: CommentData} | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/home/blogs/${blogId}/comments?sort=reciente`);
      if (res.ok) setComments(await res.json());
    } finally { setIsLoading(false); }
  }, [blogId]);

  useEffect(() => { if (isOpen) { fetchComments(); setReplyingTo(null); } }, [isOpen, fetchComments]);

  const handleCommentAdded = (newComment: CommentData) => {
    if (!replyingTo) {
      setComments(prev => [newComment, ...prev]);
    } else {
      setLatestReply({ parentId: replyingTo.IntIdCom, comment: newComment });
      setComments(prev => prev.map(c => c.IntIdCom === replyingTo.IntIdCom ? { ...c, IntRepliesCount: c.IntRepliesCount + 1 } : c));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-black/60 backdrop-blur-sm transition-opacity px-0 sm:px-4">
      <div className="w-full sm:max-w-xl h-[85vh] sm:h-[80vh] bg-card-bg sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 border border-card-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-card-border sticky top-0 bg-card-bg z-10">
          <div className="w-8"></div>
          <div className="flex items-center gap-2 font-bold text-[15px] text-foreground">
            {comments.length} comentarios <SlidersHorizontal className="w-4 h-4 ml-1 opacity-70" />
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary-fund transition-colors text-foreground"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-custom">
          {isLoading ? (
            <div className="flex justify-center mt-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : comments.length === 0 ? (
            <p className="text-center text-foreground/50 mt-10 italic">Sé el primero en comentar.</p>
          ) : (
            comments.map((comment) => (
              <CommentItem 
                key={comment.IntIdCom} 
                comment={comment} 
                blogId={blogId}
                onReply={(cmt: CommentData) => setReplyingTo(cmt)} 
                onDeleteSuccess={fetchComments} 
                latestReply={latestReply}
              />
            ))
          )}
        </div>
        <CommentInput blogId={blogId} onCommentAdded={handleCommentAdded} replyingTo={replyingTo} onCancelReply={() => setReplyingTo(null)} />
      </div>
    </div>
  );
}