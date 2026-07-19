import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_project.settings')
django.setup()

from accounts.models import User
from posts.models import Post, Comment
from interactions.models import Like, Follow

def seed():
    # Create users
    user1, created = User.objects.get_or_create(username='alice', email='alice@test.com', defaults={'bio': 'Tech enthusiast and designer.'})
    if created: user1.set_password('password123'); user1.save()
    
    user2, created = User.objects.get_or_create(username='bob', email='bob@test.com', defaults={'bio': 'Just a guy who loves coding.'})
    if created: user2.set_password('password123'); user2.save()
    
    user3, created = User.objects.get_or_create(username='carol', email='carol@test.com', defaults={'bio': 'Photographer and traveler.'})
    if created: user3.set_password('password123'); user3.save()

    # Follows
    Follow.objects.get_or_create(follower=user2, following=user1)
    Follow.objects.get_or_create(follower=user3, following=user1)
    Follow.objects.get_or_create(follower=user1, following=user2)

    # Posts
    post1, _ = Post.objects.get_or_create(author=user1, content='Just launched my new portfolio website! Super excited to share it with everyone here. What do you guys think?')
    post2, _ = Post.objects.get_or_create(author=user2, content='Been working with Django and Vanilla JS all day. The glassmorphism UI trend is actually really clean when done right.')
    post3, _ = Post.objects.get_or_create(author=user3, content='Planning my next trip to Japan. Any recommendations for places to visit in Kyoto?')

    # Comments
    Comment.objects.get_or_create(post=post1, author=user2, content='Looks amazing Alice! Great work.')
    Comment.objects.get_or_create(post=post1, author=user3, content='Love the color palette you used.')
    Comment.objects.get_or_create(post=post2, author=user1, content='Totally agree. It gives such a premium feel.')

    # Likes
    Like.objects.get_or_create(user=user2, post=post1)
    Like.objects.get_or_create(user=user3, post=post1)
    Like.objects.get_or_create(user=user1, post=post2)
    Like.objects.get_or_create(user=user3, post=post2)

    print('Dummy data added successfully!')

if __name__ == '__main__':
    seed()
