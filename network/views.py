import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, UserProfile, Post


def index(request):
    return render(request, "network/index.html")


def all_posts(request):
    # this is temporary function for early developing.
    # should be replaced by fetching API Calls.
    posts = Post.objects.all()
    print(posts)
    return render(request, "network/index.html", {
        'title': "All Posts",
        'posts': posts
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


# APIs
# Compose Post
@login_required
def compose(request):
    # print(f"Request Header: {request.headers}")
    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "Post request required."}, status=400)
    
    data = json.loads(request.body)
    user = request.user
    profile = user.profile
    body = data.get("body", "")

    # Check body of post
    
    if body == "":
        return JsonResponse({
            "error": "Body must be non-empty."
        })
    
    post = Post(user_profile=profile, body=body)
    post.save()
    return JsonResponse({"message": "Post is successfully saved."}, status=201)


## Comment Added form Laptop