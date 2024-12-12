// js for creating a new post

async function create_post(postContent) {
    const csrftoken = document.querySelector('[name=csrf-token]').content;
    fetch('/compose', {
        method: 'POST',
        body: JSON.stringify({
            body: postContent
        }), 
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(result => {
        // load first page
        load_posts(1);
    })
}

function load_posts(page_num) {
    const containerDiv = document.querySelector('#posts-view')
    const posts = fetch(`/posts?page=${page_num}`, {
        method: 'GET'
        // todo : pagination
    })
    .then(response => response.json())
    .then(result => {
        if (result.data && Array.isArray(result.data)) {
            const containerDiv = document.querySelector('#posts-view');
            containerDiv.innerHTML = "";

        // Each Post
            result.data.forEach(post => {
                const clone = document.querySelector('template#post').content.cloneNode(true);
                clone.id = `post_${post.id}`;
                const picImg = clone.querySelector('#profile_pic img');
                picImg.src = `${post.pic_url}`;
                clone.querySelector('#username').innerHTML = post.username;
                
                const restDiv = clone.querySelector('#rest');
                restDiv.querySelector('#body').innerHTML = post.body;
                let isoString = post.edited_at;
                let date = new Date(isoString);
                let options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                }
                let displayDate = date.toLocaleString('en-US', options);
                restDiv.querySelector('#time').innerHTML = displayDate;

                const likeDiv = restDiv.querySelector('#like');
                const likeBtn = likeDiv.querySelector('#like-btn');

                if (post.liked_by) {
                    likeBtn.dataset.status = 'cancel';
                    likeBtn.querySelector('i').classList.add('bi-heart-fill');
                    likeBtn.querySelector('i').classList.remove('bi-heart');
                } else {
                    likeBtn.dataset.status = 'like';
                    likeBtn.querySelector('i').classList.remove('bi-heart-fill');
                    likeBtn.querySelector('i').classList.add('bi-heart');
                }
                likeBtn.querySelector('#like-count').innerHTML = `&nbsp;${post.like_count}`

                containerDiv.appendChild(clone);
                likeBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    fetch(`/like/${post.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            "X-CSRFToken": token
                        },
                        body: JSON.stringify({
                            post: post.id,
                            status: likeBtn.dataset.status
                        })
                    }).then(response => {
                        console.log(response);
                    })
                    // Not Done Yet.
                    if (likeBtn.dataset.status === 'like') {
                        likeBtn.dataset.status = 'cancel';
                        likeBtn.querySelector('i').classList.remove('bi-heart-fill');
                        likeBtn.querySelector('i').classList.add('bi-heart');
                    } else if (likeBtn.dataset.status === 'cancel') {
                        likeBtn.dataset.status = 'like';
                        likeBtn.querySelector('i').classList.add('bi-heart-fill');
                        likeBtn.querySelector('i').classList.remove('bi-heart');
                    }
                })
            }

            )
        }
        // pagination
        const prevDiv = document.querySelector('#page-previous');
        const nextDiv = document.querySelector('#page-next');

        if (!result.page.has_previous) {
            prevDiv.classList.add('disabled');
            prevDiv.style.display = 'none';
        } else {
            prevDiv.classList.remove('disabled');
            prevDiv.style.display = 'block';
            prevDiv.querySelector('button').addEventListener('click', (event) => {
                event.preventDefault();                
                load_posts(result.page.prev_page_num);
                return false;
            });
            
        }
        if (!result.page.has_next) {
            nextDiv.classList.add('disabled');
            nextDiv.style.display = 'none';
        } else {
            nextDiv.classList.remove('disabled');
            nextDiv.style.display = 'block';
        }
        document.querySelector('#pagination').style.display = 'block';

        nextDiv.querySelector('button').addEventListener('click', (event) => {
            event.preventDefault();
            load_posts(result.page.next_page_num);
            return false;
        })

        // focus post textarea after loading.
        document.querySelector('#compose-body').focus();
        
    });
}

// Load all posts
load_posts(1);


document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Contents are fully loaded.")
    // Event for Submit Button
    const submitForm = document.querySelector('#compose-view > form');
    submitForm.addEventListener("submit", (event) => {
        event.preventDefault()
        const postContent = submitForm.querySelector('#compose-body').value;
        create_post(postContent);
    })

})