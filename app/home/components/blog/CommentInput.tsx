"use client";

import { useState } from "react";
import { Send, Loader2, X } from "lucide-react";
import { CommentData } from "./CommentItem";
/**
 * dev: Rodrigo Saul Zarate Villarroel       fecha: 04/05/2026
 * funcionalidad: renderiza el formulario de entrada para crear nuevos comentarios o responder a comentarios existentes,
 * gestionando la vista previa del modo respuesta y el envío de datos a la API
 */
interface CommentInputProps {
  blogId: string;
  onCommentAdded: (newComment: CommentData) => void;
  replyingTo: CommentData | null;
  onCancelReply: () => void;
}

export default function CommentInput({ blogId, onCommentAdded, replyingTo, onCancelReply }: CommentInputProps) {
  const [comentario, setComentario] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/home/blogs/${blogId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenido: comentario,
          id_padre: replyingTo ? replyingTo.IntIdCom : null, 
        }),
      });

      if (res.ok) {
        const newCommentFromServer = await res.json();
        setComentario(""); 
        onCancelReply();
        onCommentAdded(newCommentFromServer);
      } else {
        const errorData = await res.json();
        console.error("Error al publicar comentario:", errorData);
      }
    } catch (error) {
      console.error("Error de red al publicar", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t border-card-border bg-card-bg sm:rounded-b-2xl flex flex-col">
      {/* ver a quién respondes */}
      {replyingTo && (
        <div className="px-4 pt-3 pb-1 flex items-center animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex-1 bg-secondary-fund/50 border-l-4 border-primary rounded-r-lg p-2.5 relative flex items-start justify-between">
            <div className="flex flex-col overflow-hidden">
              <span className="text-primary font-semibold text-[13px] mb-0.5">
                {replyingTo.ObjAuthorCom.name}
              </span>
              <span className="text-foreground/70 text-[13px] line-clamp-1">
                {replyingTo.StrContentCom}
              </span>
            </div>
            <button 
              type="button" 
              onClick={onCancelReply} 
              className="p-1 hover:bg-card-border rounded-full text-foreground/70 transition-colors ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* formulario normal */}
      <form onSubmit={handleSubmit} className="p-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 bg-secondary-fund rounded-full px-4 py-2 border border-card-border/50 focus-within:border-primary/50 transition-colors">
          <input 
            type="text" 
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder={replyingTo ? `Respondiendo a ${replyingTo.ObjAuthorCom.name.split(' ')[0]}...` : "Añadir comentario..."} 
            disabled={isSubmitting}
            className="bg-transparent text-foreground placeholder:text-foreground/50 border-none outline-none w-full text-[14px] disabled:opacity-50"
          />
        </div>
        <button 
          type="submit" 
          disabled={!comentario.trim() || isSubmitting}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:bg-card-border disabled:text-foreground/40 transition-colors flex-shrink-0"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
        </button>
      </form>
    </div>
  );
}