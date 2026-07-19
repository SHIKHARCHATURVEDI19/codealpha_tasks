from django.urls import path
from . import views

urlpatterns = [
    path('like/<int:post_id>/', views.toggle_like, name='toggle_like'),
    path('follow/<str:username>/', views.toggle_follow, name='toggle_follow'),
    path('bookmark/<int:post_id>/', views.toggle_bookmark, name='toggle_bookmark'),
]
