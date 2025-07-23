'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { MessageCircle, Reply, Send, User } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  documentId: string;
  parentId?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  replies?: Comment[];
}

interface CommentsSectionProps {
  documentId: string;
}

export function CommentsSection({ documentId }: CommentsSectionProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取评论
  useEffect(() => {
    fetchComments();
  }, [documentId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments?documentId=${documentId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "认证失败",
        description: "请先登录后再评论"
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        variant: "destructive",
        title: "验证失败",
        description: "请输入评论内容"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          documentId,
        }),
      });

      if (response.ok) {
        setNewComment('');
        await fetchComments();
        toast({
          variant: "success",
          title: "评论成功",
          description: "您的评论已发表"
        });
      } else {
        const error = await response.text();
        toast({
          variant: "destructive",
          title: "发表评论失败",
          description: error || '发表评论失败'
        });
      }
    } catch (error) {
      console.error('发表评论失败:', error);
      toast({
        variant: "destructive",
        title: "发表评论失败",
        description: '发表评论失败，请重试'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "认证失败",
        description: "请先登录后再回复"
      });
      return;
    }

    if (!replyContent.trim()) {
      toast({
        variant: "destructive",
        title: "验证失败",
        description: "请输入回复内容"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          documentId,
          parentId,
        }),
      });

      if (response.ok) {
        setReplyContent('');
        setReplyTo(null);
        await fetchComments();
        toast({
          variant: "success",
          title: "回复成功",
          description: "您的回复已发表"
        });
      } else {
        const error = await response.text();
        toast({
          variant: "destructive",
          title: "回复失败",
          description: error || '回复失败'
        });
      }
    } catch (error) {
      console.error('回复失败:', error);
      toast({
        variant: "destructive",
        title: "回复失败",
        description: '回复失败，请重试'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CommentItem = ({ comment }: { comment: Comment }) => (
    <div className="space-y-4">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          {comment.author.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {comment.author.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(new Date(comment.createdAt))}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
          
          {session && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(comment.id)}
              className="text-xs"
            >
              <Reply className="w-3 h-3 mr-1" />
              回复
            </Button>
          )}
          
          {replyTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Input
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="写下你的回复..."
                className="text-sm"
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={isSubmitting}
                >
                  <Send className="w-3 h-3 mr-1" />
                  回复
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyContent('');
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-12">
      <div className="flex items-center mb-6">
        <MessageCircle className="w-5 h-5 mr-2" />
        <h3 className="text-lg font-semibold">评论 ({comments.length})</h3>
      </div>

      {/* 发表评论 */}
      {session ? (
        <div className="mb-8 space-y-4">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的评论..."
            className="w-full"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !newComment.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            发表评论
          </Button>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-2">登录后即可参与评论</p>
          <Link href="/auth/signin">
            <Button variant="outline" size="sm">
              立即登录
            </Button>
          </Link>
        </div>
      )}

      <Separator className="mb-6" />

      {/* 评论列表 */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">加载评论中...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">暂无评论，来发表第一条评论吧！</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
