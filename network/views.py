import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from .models import User, UserProfile, Post


def index(request):
    return render(request, "network/index.html")


# def all_posts(request):
#     # this is temporary function for early developing.
#     # should be replaced by fetching API Calls.
#     posts = Post.objects.all()
#     print(posts)
#     return render(request, "network/index.html", {
#         'title': "All Posts",
#         'posts': posts
#     })


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

            # automatically create userprofile instace
            UserProfile.objects.create(user=user)

        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


######### API functions ##########

# 'POST' Compose Post
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


# function for returning posts by filter
def filter_posts(userprofile_id, followed=False):
    if userprofile_id and not followed:
        return Post.objects.filter(user_profile=userprofile_id)
    
    if userprofile_id and followed:
        followed_group = UserProfile.objects.get(pk=userprofile_id).following
        posts = Post.objects.none()
        for userprofile in followed_group:
            posts = posts.union(Post.objects.filter(user_profile=userprofile))

        return posts


PPV = 10  # Posts Per View
# 'GET' return ALL posts
def all_posts(request):

    page_number = request.GET.get("page") or 1
    paginator = Paginator(Post.objects.order_by('-created_at').all(), PPV)
    page_obj = paginator.page(page_number).object_list
    print(f"Type of page_obj: {type(page_obj)}")
    print(f"page_obj: {page_obj}")

    data = []
    for post in page_obj:
        new_post = post.serialize()
        if request.user.profile.id in new_post['liked_users']:
            new_post['liked_by'] = True
        else:
            new_post['liked_by'] = False
        data.append(new_post)
    # data = [post.serialize() for post in page_obj]

    page = paginator.get_page(page_number)
    
    prev_page_num = page.previous_page_number() if page.has_previous() else None
    next_page_num = page.next_page_number() if page.has_next() else None

    page_data = {
        'page': page.number,
        'num_pages': paginator.num_pages,
        'has_previous': page.has_previous(),
        'prev_page_num': prev_page_num,
        'has_next': page.has_next(),
        'next_page_num': next_page_num}

    print(page_data)

    return JsonResponse({
        'data': data,
        'page': page_data},
        safe=False) 

# 'GET' return posts by specific user
def user_posts(request):
    page_number = request.GET.get("page")
    pass


# 'GET return posts by followed users
@login_required
def followed_posts(request):
    page_number = request.GET.get("page")
    pass


# 'PUT' 
@login_required
def toggle_like(request):
    print("toggle like")
    if request.method != 'PUT':
        return JsonResponse({"error": "Put request required."}, status=400)
    
    data = json.loads(request.body)
    # post id, userid
    cur_user = request.user
    body = data["body"]
    postID = body["id"]
    post = Post.objects.get(id=postID)
    post_profileID = body["user_profile"]
    post_profile = UserProfile.objects.get(id=post_profileID)
    print(f"현재 로그인 유저: {cur_user}")
    print(f"포스트 작성 user: {post_profile.user}")

    # check if request user is post user (deny)
    if cur_user == post_profile.user:
        return JsonResponse({"error": "Cannot like own post."}, status=400)
    
    print("Current User's PROFILE")
    print(type(post_profile))
    print(post_profile)
    print("LIKES 목록")
    for liked_user_profile in post.likes.all():
        if cur_user == liked_user_profile.user:
            print(f"{cur_user} == {liked_user_profile.user}")
        else:
            print(f"{cur_user} != {liked_user_profile.user}")


    # If the user has already liked the post, CANCEL like. 
    if cur_user.profile in post.likes.all():
        post.likes.remove(cur_user.profile)
        post.like_count = post.likes.count()
        post.save()
        print(post.like_count)
        msg = f"{cur_user} ({cur_user.profile}) Canceled the like on post {postID}"
        print(msg)
        return JsonResponse({
            "message": msg,
            "count": post.like_count,
            "liked_by": False
        }, status=201)

    # If the user has not liked the post yet, LIKE.
    else:
        post.likes.add(cur_user.profile)  
        post.like_count = post.likes.count()
        post.save()
        print(post)
        msg = f"{cur_user} ({cur_user.profile}) Liked the post {postID}"
        print(msg)
        return JsonResponse({
            "message": msg,
            "count": post.like_count,
            "liked_by": True
        }, status=201)
    
    # post.likes.add(user.profile)
    # post.save()
    
    # todo : cancel like (when already liked)