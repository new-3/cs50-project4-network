
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API paths
    path("compose", views.compose, name="compose"),
    path("posts", views.all_posts, name="all"),
    path("users/<int:userprofile_id>/posts", views.user_posts, name="user"),
    path("users/<int:userprofile_id>/followed/posts", views.followed_posts, name="followed")
]
