from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing_view, name='landing'),
    path('feed/', views.feed_view, name='feed'),
    path('post/create/', views.create_post_view, name='create_post'),
    path('post/<int:post_id>/', views.post_detail_view, name='post_detail'),
    path('post/<int:post_id>/comments/', views.get_comments_view, name='get_comments'),
    path('post/<int:post_id>/comment/', views.add_comment_view, name='add_comment'),
    path('post/<int:post_id>/delete/', views.delete_post_view, name='delete_post'),
    path('search/', views.search_view, name='search'),
]
