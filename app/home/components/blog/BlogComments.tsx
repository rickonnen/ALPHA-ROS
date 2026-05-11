"use client";

import { useState, useEffect } from "react";
import CommentsDrawer from "./CommentsDrawer";
import CommentItem, { CommentData } from "./CommentItem"; 
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 04/05/2026
 * funcionalidad: renderiza la sección principal de comentarios de un blog,
 * mostrando una vista previa del comentario más relevante y gestionando la apertura del cajón
 */
interface BlogCommentsProps {
  blogId: string;
  isAuthenticated?: boolean;
}

export default function BlogComments({ blogId, isAuthenticated = false }: BlogCommentsProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userForcedPreview, setUserForcedPreview] = useState(false);

  useEffect(() => {
    const fetchTopComment = async () => {
      try {
        const res = await fetch(`/api/home/blogs/${blogId}/comments?sort=relevante&limit=1`, {
          cache: 'no-store'
        });
        
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.error("Error al cargar comentarios", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!isDrawerOpen && !userForcedPreview) {
      fetchTopComment();
    }
  }, [blogId, isDrawerOpen, userForcedPreview]);
  const handleNewUserComment = (newComment: CommentData) => {
    setComments([newComment]);
    setUserForcedPreview(true);
  };

  if (isLoading) return <div className="animate-pulse w-full h-24 bg-secondary-fund rounded-xl mt-8"></div>;

  const topComment = comments[0];

  return (
    <div className="w-full mt-10 pt-6 border-t border-card-border">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
        Comentarios
      </h3>
      {topComment ? (
        <CommentItem comment={topComment} blogId={blogId} isAuthenticated={isAuthenticated} />
      ) : (
        <p className="text-foreground/60 mt-4 mb-4 italic text-sm">Sé el primero en comentar.</p>
      )}
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="w-full py-3 bg-secondary-fund hover:bg-card-border/50 text-foreground font-semibold rounded-xl transition-colors mt-2"
      >
        Ver comentarios y opinar
      </button>
      {/* El cajón flotante */}
      <CommentsDrawer 
        blogId={blogId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNewUserComment={handleNewUserComment} 
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}