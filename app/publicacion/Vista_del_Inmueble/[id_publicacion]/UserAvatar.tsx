"use client";

interface UserAvatarProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

const FALLBACK = "https://i.imgur.com/WxNkK7J.png";

export default function UserAvatar({ src, alt, className }: UserAvatarProps) {
  return (
    <img
      src={src?.trim() || FALLBACK}
      alt={alt}
      className={className}
      onError={(e) => { e.currentTarget.src = FALLBACK; }}
    />
  );
}