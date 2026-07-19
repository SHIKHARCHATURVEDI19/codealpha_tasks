from django.shortcuts import render, redirect, get_object_or_404
import json
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.models import Q
from .models import Post, Comment
from interactions.models import Like, Notification
from accounts.models import User

@login_required
def feed_view(request):
    posts = Post.objects.all().select_related('author').prefetch_related('comments', 'likes')
    user_liked_posts = Like.objects.filter(user=request.user).values_list('post_id', flat=True)

    context = {
        'posts': posts,
        'user_liked_posts': user_liked_posts,
    }
    return render(request, 'feed.html', context)

def landing_view(request):
    if request.user.is_authenticated:
        return redirect('feed')
    return render(request, 'landing.html')

@login_required
def create_post_view(request):
    if request.method == 'POST':
        content = request.POST.get('content')
        image = request.FILES.get('image')
        if content:
            Post.objects.create(author=request.user, content=content, image=image)
    return redirect('feed')

@login_required
def post_detail_view(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    user_has_liked = Like.objects.filter(user=request.user, post=post).exists()
    
    context = {
        'post': post,
        'user_has_liked': user_has_liked,
    }
    return render(request, 'post_detail.html', context)

@login_required
def get_comments_view(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    comments = post.comments.all().select_related('author')
    data = []
    for c in comments:
        data.append({
            'id': c.id,
            'author': c.author.username,
            'content': c.content,
            'created_at': c.created_at.strftime('%Y-%m-%d %H:%M')
        })
    return JsonResponse({'comments': data})

@login_required
def add_comment_view(request, post_id):
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id)
        try:
            data = json.loads(request.body)
            content = data.get('content')
        except:
            content = request.POST.get('content')
            
        if content:
            Comment.objects.create(post=post, author=request.user, content=content)
            if post.author != request.user:
                Notification.objects.create(sender=request.user, receiver=post.author, notification_type='comment', post=post)
            return JsonResponse({'success': True})
    return JsonResponse({'success': False})

@login_required
def search_view(request):
    query = request.GET.get('q', '')
    if len(query) < 2:
        return JsonResponse({'users': [], 'posts': []})
    users = User.objects.filter(username__icontains=query)[:5]
    posts = Post.objects.filter(content__icontains=query)[:5]
    user_data = [{'username': u.username} for u in users]
    post_data = [{'id': p.id, 'content': p.content[:50] + '...'} for p in posts]
    return JsonResponse({'users': user_data, 'posts': post_data})

@login_required
def delete_post_view(request, post_id):
    if request.method == 'POST':
        post = get_object_or_404(Post, id=post_id, author=request.user)
        post.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False})
