from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    likes = models.ManyToManyField('Post', related_name="liked_by")


class Post(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)


