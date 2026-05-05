// hooks/useBlogActions.ts
import { useState } from "react";
import { useRouter } from "next/navigation";

export const useBlogActions = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  const checkAndCreateBlog = async () => {
    try {
      setIsChecking(true);
      const response = await fetch("/api/home/blogs/checkPendingBlog");
      const data = await response.json();

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "No se pudo verificar el blog pendiente.");
      }

      if (data.hasPendingBlog) {
        router.push("/home/blogs/pending?existing=1");
      } else {
        router.push("/home/blogs/createBlog");
      }
    } catch (error) {
      console.error("[CHECK_PENDING_BEFORE_CREATE_BLOG_ERROR]", error);
      // Fallback seguro
      router.push("/home/blogs/createBlog");
    } finally {
      setIsChecking(false);
    }
  };

  return { checkAndCreateBlog, isChecking };
};