from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


class User(AbstractUser):

    def __str__(self) -> str:
        return f"{self.username}"

class UserProfile(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, related_name='profile')
    photo = models.ImageField(upload_to="network/users/pictures/", default="network/users/pictures/default.jpg")
    following = models.ManyToManyField('self', related_name='followers', symmetrical=False, null=True, blank=True)
    follower_count = models.IntegerField(default=0)
    following_count = models.IntegerField(default=0)


# Update followers/following count when related change occured.
@receiver(post_save, sender=UserProfile.following.through)
def update_follower_count_on_add(sender, instance, **kwargs):
    instance.follower_count = instance.followers.count()
    instance.save()

@receiver(post_delete, sender=UserProfile.following.through)
def update_follower_count_on_remove(sender, instance, **kwargs):
    instance.follower_count = instance.followers.count()
    instance.save()

@receiver(post_save, sender=UserProfile.followers.through)
def update_following_count_on_add(sender, instance, **kwargs):
    instance.following_count = instance.following.count()
    instance.save()

@receiver(post_delete, sender=UserProfile.followers.through)
def update_following_count_on_remove(sender, instance, **kwargs):
    instance.following_count = instance.following.count()
    instance.save()


class Post(models.Model):
    user_profile = models.ForeignKey('UserProfile', on_delete=models.CASCADE, related_name='posts')
    body = models.TextField(null=False, default="EMPTY")
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField('UserProfile', related_name="likes")
    like_count = models.IntegerField(default=0)

    def serialize(self):
        return {
            "id": self.id,
            "body": self.body,
            "created_at": self.created_at,
            "edited_at": self.edited_at,
            "liked_users": self.likes.all(),
            "like_count": self.like_count
        }

@receiver(post_save, sender=Post.likes.through)
def update_likes_count_on_add(sender, instance, **kwargs):
    instance.like_count = instance.likes.count()
    instance.save()

@receiver(post_delete, sender=Post.likes.through)
def update_likes_count_on_remove(sender, instance, **kwargs):
    instance.like_count = instance.likes.count()
    instance.save()
