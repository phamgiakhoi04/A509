import { useLanguage as useUILanguage } from "@/contexts/LanguageContext";
import { translateUI } from "@/utils/uiTranslations";
import { useState, useEffect } from "react";
import { commentApi } from "@/api/commentApi";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Send, Edit2, Trash2, User } from "lucide-react";
import type { Comment } from "@/types/models";

interface CommentSectionProps {
  uniformId?: number;
  articleId?: number;
  variant?: "default" | "legacy";
}

export default function CommentSection({
  uniformId,
  articleId,
  variant = "default",
}: CommentSectionProps) {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const legacy = variant === "legacy";
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if ((uniformId && !isNaN(uniformId)) || (articleId && !isNaN(articleId))) {
      fetchComments();
    } else {
      console.error("❌ uniformId không hợp lệ:", uniformId);
    }
  }, [uniformId, articleId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const data = articleId
        ? await commentApi.getCommentsByArticle(articleId)
        : await commentApi.getCommentsByUniform(uniformId!);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      setComments([]);
      setLoadError(
        uiText("Không thể tải bình luận lúc này. Vui lòng thử lại sau."),
      );
      console.error("Lỗi tải comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      if (articleId)
        await commentApi.createArticleComment(articleId, newComment.trim());
      else await commentApi.createComment(uniformId!, newComment.trim());
      setNewComment("");
      fetchComments();
    } catch (error: any) {
      alert(error.response?.data || uiText("Lỗi khi thêm bình luận"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: number) => {
    if (!editContent.trim() || submitting) return;

    try {
      setSubmitting(true);
      await commentApi.updateComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent("");
      fetchComments();
    } catch (error: any) {
      alert(error.response?.data || uiText("Lỗi khi sửa bình luận"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm(uiText("Xác nhận xóa bình luận này?"))) return;

    try {
      await commentApi.deleteComment(commentId);
      fetchComments();
    } catch (error: any) {
      alert(error.response?.data || uiText("Lỗi khi xóa bình luận"));
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canModify = (comment: Comment) => {
    if (!user) return false;
    return user.id === comment.userId || user.roleName === "ADMIN";
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Login is intentionally kept in the Homepage sidebar. Send readers there
    // instead of opening a second Login form inside AuthModal.
    window.location.assign("/");
  };

  return (
    <div
      className={
        legacy
          ? "bg-white"
          : "rounded-3xl border-4 border-brand-yellow/20 bg-white p-8 shadow-pop"
      }
    >
      <div
        className={
          legacy
            ? "mb-4 bg-[#f1f1f1] px-3 py-2"
            : "mb-6 flex items-center gap-3"
        }
      >
        {!legacy && <MessageCircle className="text-brand-red" size={28} />}
        <h3
          className={
            legacy
              ? "font-display text-2xl font-black uppercase text-brand-red"
              : "font-display text-2xl font-black text-brand-redDark"
          }
        >
          {legacy ? uiText("Ý kiến bạn đọc") : `BÌNH LUẬN (${comments.length})`}
        </h3>
      </div>

      {isAuthenticated && (
        <div className="mb-8">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={20} className="text-brand-redDark" />
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={uiText("Viết bình luận của bạn...")}
                className="w-full border-2 border-brand-red/30 rounded-xl p-4 text-base focus:ring-4 focus:ring-brand-yellow focus:border-brand-yellow outline-none resize-none transition-all"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || submitting}
                  className="px-6 py-2 bg-brand-red text-white rounded-xl font-bold shadow-pop hover:bg-brand-redDark disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                  <Send size={18} />
                  {submitting ? uiText("Đang gửi...") : uiText("Gửi")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-brand-text/70">
          {uiText("Đang tải bình luận...")}
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {loadError}
          <button
            type="button"
            onClick={fetchComments}
            className="ml-2 font-bold underline"
          >
            {uiText("Thử lại")}{" "}
          </button>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-brand-text/50 mb-3">
            {uiText("Chưa có bình luận nào")}
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-brand-text/70">
              <button
                onClick={handleLoginClick}
                className="text-brand-red hover:underline font-bold"
              >
                {uiText("Đăng nhập")}{" "}
              </button>{" "}
              {uiText("để trở thành người bình luận đầu tiên")}{" "}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-brand-bg rounded-2xl p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0">
                  {comment.userAvatarUrl ? (
                    <img
                      src={comment.userAvatarUrl}
                      alt={comment.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-brand-redDark" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-brand-redDark">
                        {comment.username}
                      </span>
                      <span className="text-sm text-brand-text/60 ml-3">
                        {formatDate(comment.createdAt)}
                      </span>
                      {comment.createdAt !== comment.updatedAt && (
                        <span className="text-xs text-brand-text/50 ml-2">
                          {uiText("(đã chỉnh sửa)")}
                        </span>
                      )}
                    </div>

                    {canModify(comment) && editingId !== comment.id && (
                      <div className="flex gap-2">
                        {user?.id === comment.userId && (
                          <button
                            onClick={() => startEdit(comment)}
                            className="p-2 text-brand-yellow hover:bg-brand-yellow/20 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-2 text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full border-2 border-brand-red/30 rounded-xl p-3 text-base focus:ring-4 focus:ring-brand-yellow outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(comment.id)}
                          disabled={!editContent.trim() || submitting}
                          className="px-4 py-2 bg-brand-red text-white rounded-lg font-bold hover:bg-brand-redDark disabled:opacity-50 transition-all"
                        >
                          {submitting ? uiText("Đang lưu...") : uiText("Lưu")}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-all"
                        >
                          {uiText("Hủy")}{" "}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-brand-text whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!isAuthenticated && (
            <div className="text-center py-6 px-4 bg-brand-bg/50 rounded-2xl border-2 border-dashed border-brand-yellow/30">
              <p className="text-brand-text/70 font-bold">
                <button
                  onClick={handleLoginClick}
                  className="text-brand-red hover:underline"
                >
                  {uiText("Đăng nhập")}{" "}
                </button>{" "}
                {uiText("để tham gia thảo luận")}{" "}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
