"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useClickOutside } from "@/components/hooks/useClickOutside"; 
import Image from "next/image";
import { Heart, ChevronDown, ChevronUp, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 05/05/2026
 * funcionalidad: renderiza un comentario con diseño TikTok (aplanado), maneja likes reales de BD 
 * y soporta inyección optimista de respuestas.
 */
export interface AuthorData { name: string; avatar?: string; }
export interface CommentData {
  IntIdCom: number; StrContentCom: string; StrDateCom: string; ObjAuthorCom: AuthorData;
  IntLikesCount: number; IntRepliesCount: number; StrRepliedToName?: string;
  BolIsOwner?: boolean; BolCurrentUserLiked?: boolean;
  isOptimistic?: boolean;
}

export default function CommentItem({ comment, blogId, onReply, onDeleteSuccess, isReply = false, latestReply, rootId, isAuthenticated }: any) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLiked, setIsLiked] = useState(!!comment.BolCurrentUserLiked);
  const [likesCount, setLikesCount] = useState(comment.IntLikesCount);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentData[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const currentRootId = isReply ? rootId : comment.IntIdCom;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);
  useClickOutside([menuRef], closeMenu, { enabled: isMenuOpen });

  useEffect(() => {
    setIsLiked(!!comment.BolCurrentUserLiked);
    setLikesCount(comment.IntLikesCount);
  }, [comment.BolCurrentUserLiked, comment.IntLikesCount]);

  useEffect(() => {
    if (latestReply && latestReply.parentId === comment.IntIdCom) {
      if (!showReplies && replies.length === 0 && comment.IntRepliesCount > 1) {
        fetchReplies();
      }
      setReplies(prev => {
        const isIncomingOptimistic = latestReply.comment.isOptimistic;
        let updatedList = prev;
        if (!isIncomingOptimistic) {
          updatedList = prev.filter(c => !c.isOptimistic);
        }
        if (updatedList.some(c => c.IntIdCom === latestReply.comment.IntIdCom)) return updatedList;
        return [...updatedList, latestReply.comment];
      });
      
      setShowReplies(true);
    }
  }, [latestReply, comment.IntIdCom]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) return;
    setIsLiked(!isLiked);
    setLikesCount((prev: number) => isLiked ? prev - 1 : prev + 1);
    await fetch(`/api/home/blogs/${blogId}/comments/${comment.IntIdCom}/like`, { method: "POST" });
  };

  const fetchReplies = async () => {
    setIsLoadingReplies(true);
    try {
      const res = await fetch(`/api/home/blogs/${blogId}/comments?parentId=${comment.IntIdCom}&sort=antiguo`);
      if (res.ok) {
        const fetchedReplies = await res.json();
        setReplies((prev: CommentData[]) => {
          const existingIds = new Set(fetchedReplies.map((c: any) => c.IntIdCom));
          const keepFromPrev = prev.filter((c: any) => !existingIds.has(c.IntIdCom));
          return [...fetchedReplies, ...keepFromPrev];
        });
      }
    } finally { 
      setIsLoadingReplies(false); 
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await fetch(`/api/home/blogs/${blogId}/comments/${comment.IntIdCom}`, { method: "DELETE" });
    if (res.ok) {
      setIsModalOpen(false);
      onDeleteSuccess ? onDeleteSuccess() : setIsVisible(false);
    }
    setIsDeleting(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className={`flex flex-col w-full mb-5 relative group ${comment.isOptimistic ? "opacity-60 pointer-events-none" : "opacity-100 transition-opacity"}`}>
        <div className="flex gap-3 w-full">
            <div className="flex-shrink-0">
            {comment.ObjAuthorCom.avatar ? (
                <Image
                src={comment.ObjAuthorCom.avatar}
                alt={comment.ObjAuthorCom.name}
                width={isReply ? 28 : 36}
                height={isReply ? 28 : 36}
                className="rounded-full object-cover border border-card-border"
                style={{ width: isReply ? '28px' : '36px', height: isReply ? '28px' : '36px' }}
                />
            ) : (
                <div 
                className={`${isReply ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs"} rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold uppercase border border-card-border`}
                >
                {comment.ObjAuthorCom.name.charAt(0)}
                </div>
            )}
            </div>
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-bold text-foreground/80 flex items-center gap-1 truncate">
                {comment.ObjAuthorCom.name}
                {comment.StrRepliedToName && (
                  <span className="text-foreground/40 font-normal flex items-center gap-0.5">
                    <ChevronDown className="w-3 h-3 -rotate-90" /> {comment.StrRepliedToName}
                  </span>
                )}
              </span>
              {comment.BolIsOwner && (
                <div className="relative" ref={menuRef}> 
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground/30 hover:text-foreground p-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 top-6 bg-secondary-fund border border-card-border shadow-xl rounded-xl p-1 z-50 w-32">
                      <button onClick={() => {setIsModalOpen(true); setIsMenuOpen(false);}}
                      className="w-full flex items-center gap-2 px-3 py-2 text-destructive text-[13px] font-bold hover:bg-background rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-[15px] text-foreground leading-snug break-words">{comment.StrContentCom}</p>
            <div className="flex items-center gap-4 mt-1 text-[12px] text-foreground/50 font-bold">
              <span>{comment.StrDateCom}</span>
              {isAuthenticated && (
                <button onClick={() => onReply(comment, currentRootId)}
                className="hover:text-foreground">Responder</button>
              )}
            </div>

            {!isReply && comment.IntRepliesCount > 0 && (
              <button onClick={() => {setShowReplies(!showReplies); if(!showReplies) fetchReplies();}}
              className="flex items-center gap-2 mt-3 text-[12px] text-foreground/50 font-bold hover:text-foreground w-fit">
                <span className="w-6 border-t border-card-border"></span>
                {showReplies ? "Ocultar respuestas" : `Ver ${comment.IntRepliesCount} respuestas`}
                {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          <div className="flex flex-col items-center w-8 pt-1">
            <button onClick={handleToggleLike} className={!isAuthenticated ? "cursor-default opacity-60" : ""}>
              <Heart fill={isLiked ? "#ff3b5c" : "transparent"} stroke={isLiked ? "#ff3b5c" : "currentColor"} className={`w-4 h-4 ${isLiked ? "text-destructive" : "text-foreground/30"}`} />
            </button>
            <span className="text-[11px] text-foreground/50 font-medium">{likesCount}</span>
          </div>
        </div>

        {showReplies && (
          <div className={`mt-4 border-l-2 border-card-border/30 ${isReply ? "pl-4" : "pl-10"}`}>
            {replies.map(r => (
              <CommentItem 
                key={r.IntIdCom} 
                comment={r} 
                blogId={blogId} 
                onReply={onReply} 
                isReply={true} 
                rootId={currentRootId} 
                onDeleteSuccess={fetchReplies} 
                latestReply={latestReply}
                isAuthenticated={isAuthenticated}
              />
            ))}
            {isLoadingReplies && (
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary mt-3 mb-1" />
            )}
            
          </div>
        )}
      </div>
      <ConfirmModal isOpen={isModalOpen} title="¿Eliminar comentario?" isProcessing={isDeleting} onConfirm={handleDelete} onCancel={() => setIsModalOpen(false)} />
    </>
  );
}