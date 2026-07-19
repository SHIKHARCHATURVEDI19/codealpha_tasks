import uuid
import os
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify

def get_image_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('avatars/' if isinstance(instance, User) else 'covers/', filename)

class User(AbstractUser):
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to=get_image_upload_path, null=True, blank=True)
    cover_image = models.ImageField(upload_to=get_image_upload_path, null=True, blank=True)
    slug = models.SlugField(unique=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.username)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
