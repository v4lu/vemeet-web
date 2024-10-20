import { goto } from '$app/navigation';
import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { Comment } from '$lib/types/comment.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { Post } from '$lib/types/post.types';
import type { Reaction } from '$lib/types/reaction.types';
import { HTTPError } from 'ky';

class SinglePost {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);

	isPostDeletionSubmitting = $state(false);
	isCreateCommentSubmitting = $state(false);
	isCreateReplySubmitting = $state(false);
	isDeleteCommentSubmitting = $state(false);
	isEditCommentSubmitting = $state(false);
	isEditingPostSubmitting = $state(false);

	post = $state<Post>();
	comments = $state<Comment[]>([]);
	reactions = $state<Reaction[]>([]);
}

export function useSignlePost(postId: number, authToken: string) {
	const res = new SinglePost();
	const api = authAPI(authToken);

	async function fetchPost() {
		res.isLoading = true;
		try {
			const post = await api.get<Post>(`posts/${postId}`).json();
			res.post = post;
			res.comments = post.comments;
			res.reactions = post.reactions;
			res.isLoading = false;
		} catch (err) {
			if (err instanceof HTTPError) {
				if (err.response.status === 404) goto('/404');
				else if (err.response.status === 401) goto('/sign-in');
				else toast.error('Something went wrong, Please try again.');
			}
		}
	}

	async function deletePost() {
		res.isPostDeletionSubmitting = true;
		try {
			await api.delete(`posts/${postId}`).json();
			goto('/profile');
		} catch (err) {
			if (err instanceof HTTPError) {
				res.error = (await err.response.json()) as ServerErrorResponse;
			}
			toast.error('Failed to delete post. Please try again.');
			goto('/profile');
		}
		res.isPostDeletionSubmitting = false;
	}

	async function patchPost(content: string) {
		res.isEditingPostSubmitting = true;
		try {
			const response = await api.patch<Post>(`posts/${postId}`, { json: { content } }).json();
			res.post = response;
		} catch (err) {
			toast.error('Something went wrong. Please try again.');
		}

		res.isEditingPostSubmitting = false;
	}

	async function handlePostLike(isLiked: boolean) {
		try {
			let updatedPost: Post;
			if (isLiked) {
				updatedPost = await api.delete<Post>(`posts/${postId}/reactions`).json();
			} else {
				updatedPost = await api
					.post<Post>(`posts/${postId}/reactions`, {
						json: { reactionType: 'LIKE' }
					})
					.json();
			}

			res.post = updatedPost;
			res.reactions = updatedPost.reactions;
		} catch (error) {
			console.error('Error toggling like:', error);
			toast.error('Failed to update like status. Please try again.');
		}
	}

	async function postComment(newComment: string) {
		res.isCreateCommentSubmitting = true;
		try {
			const response = await api
				.post<Comment>(`comments/posts/${postId}/comments`, {
					json: { content: newComment }
				})
				.json();

			res.comments.push(response);
		} catch (err) {
			console.error('Error posting comment:', err);
			toast.error('Failed to post comment. Please try again.');
		}
		res.isCreateCommentSubmitting = false;
	}

	async function postReply(parentId: number, content: string) {
		res.isCreateReplySubmitting = true;
		try {
			const response = await api
				.post<Comment>(`comments/posts/${postId}/comments`, {
					json: { content, parentId }
				})
				.json();
			res.comments.find((c) => c.id === parentId)?.replies.push(response);
		} catch (error) {
			console.error('Error adding reply:', error);
			toast.error('Failed to add reply. Please try again.');
		}
		res.isCreateReplySubmitting = false;
	}

	async function deleteComment(commentId: number) {
		res.isDeleteCommentSubmitting = true;
		try {
			const parentComment = res.comments.find((c) => c.replies.find((ci) => ci.id === commentId));
			const childComment = parentComment?.replies.find((c) => c.id === commentId);

			await api.delete(`comments/${commentId}`, {}).json();

			if (childComment && parentComment) {
				res.comments = res.comments.map((comment) => {
					if (comment.id === parentComment.id) {
						return {
							...comment,
							replies: comment.replies.filter((reply) => reply.id !== commentId)
						};
					}
					return comment;
				});
			} else {
				const newComments = res.comments.filter((r) => {
					return r.id !== commentId;
				});
				res.comments = [...newComments];
			}
			toast.success('Comment deleted successfully!');
		} catch (error) {
			console.error('Error deleting comment:', error);
			toast.error('Failed to delete comment. Please try again.');
		}
		res.isDeleteCommentSubmitting = false;
	}

	async function editComment(commentId: number, content: string) {
		res.isEditCommentSubmitting = true;
		try {
			const response = await api
				.patch<Comment>(`comments/${commentId}`, {
					json: { content }
				})
				.json();

			// Update top-level comments
			res.comments = res.comments.map((comment) => (comment.id === commentId ? response : comment));

			// Update replies
			res.comments = res.comments.map((comment) => {
				if (comment.replies) {
					comment.replies = comment.replies.map((reply) =>
						reply.id === commentId ? response : reply
					);
				}
				return comment;
			});

			toast.success('Comment updated successfully!');
		} catch (error) {
			console.error('Error updating comment:', error);
			toast.error('Failed to update comment. Please try again.');
		} finally {
			res.isEditCommentSubmitting = false;
		}
	}

	async function handleCommentLike(isLiked: boolean, commentId: number) {
		try {
			let updatedComment: Comment;
			if (isLiked) {
				updatedComment = await api.delete<Comment>(`comments/${commentId}/reactions`).json();
			} else {
				updatedComment = await api
					.post<Comment>(`comments/${commentId}/reactions`, {
						json: { reactionType: 'LIKE' }
					})
					.json();
			}

			res.comments = res.comments.map((comment) => {
				if (comment.id === commentId) {
					return updatedComment;
				}
				return comment;
			});

			res.comments = res.comments.map((comment) => {
				if (comment.replies) {
					comment.replies = comment.replies.map((reply) => {
						if (reply.id === commentId) {
							return updatedComment;
						}
						return reply;
					});
				}
				return comment;
			});
		} catch (error) {
			console.error('Error liking/unliking comment:', error);
			toast.error('Failed to update like status. Please try again.');
		}
	}
	fetchPost();

	return {
		postComment,
		deletePost,
		deleteComment,
		editComment,
		postReply,
		handleCommentLike,
		handlePostLike,
		patchPost,
		res
	};
}
