import json
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from posts.models import Post
from accounts.models import User
from .models import Like, Follow, Bookmark, Notification

@login_required
def toggle_like(request, post_id):
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            like.delete()
            liked = False
        else:
            liked = True
            # Create notification
            if post.author != request.user:
                Notification.objects.create(sender=request.user, receiver=post.author, notification_type='like', post=post)
            
        return JsonResponse({'liked': liked, 'like_count': post.likes.count()})
    return JsonResponse({'error': 'Invalid method'}, status=400)

@login_required
def toggle_follow(request, username):
    if request.method == 'POST':
        target_user = get_object_or_404(User, username=username)
        if target_user == request.user:
            return JsonResponse({'error': 'Cannot follow yourself'}, status=400)
            
        follow, created = Follow.objects.get_or_create(follower=request.user, following=target_user)
        
        if not created:
            follow.delete()
            following = False
        else:
            following = True
            # Create notification
            Notification.objects.create(sender=request.user, receiver=target_user, notification_type='follow')
            
        return JsonResponse({'following': following, 'followers_count': target_user.followers.count()})
    return JsonResponse({'error': 'Invalid method'}, status=400)

@login_required
def toggle_bookmark(request, post_id):
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id)
        bookmark, created = Bookmark.objects.get_or_create(user=request.user, post=post)
        if not created:
            bookmark.delete()
            bookmarked = False
        else:
            bookmarked = True
        return JsonResponse({'bookmarked': bookmarked})
    return JsonResponse({'error': 'Invalid method'}, status=400)
