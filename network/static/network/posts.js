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
        console.log(result);
        load_posts()
    })
}

function load_posts() {
    const containerDiv = document.querySelector('#posts-view')
    const posts = fetch('/posts', {
        method: 'GET'
        // todo : pagination
    })
    .then(response => response.json())
    .then(result => {
        console.log(Array.isArray(result.data));
        if (result.data && Array.isArray(result.data)) {
            const containerDiv = document.querySelector('#posts-view');
            containerDiv.innerHTML = "";

            result.data.forEach(post => {
                // debug
                // console.log(post);

                const postDiv = document.createElement('div');
                postDiv.id = `post_${post.id}`;
                postDiv.className = 'post-container border bg-light m-2 p-2 row';
                
                const picDiv = document.createElement('div');
                picDiv.className = 'col-2 col-2-md justify-content-center';
                picDiv.innerHTML = `<img src='${post.pic_url}' width=75px height=75px>`

                const restDiv = document.createElement('div');
                restDiv.className = 'col';

                const userDiv = document.createElement('div');
                userDiv.className = "py-1 ";
                userDiv.innerHTML = post.username;
                // todo: link to profile
                
                const bodyDiv = document.createElement('div');
                bodyDiv.className = "py-1 ";
                bodyDiv.innerHTML = post.body;
                
                const timeDiv = document.createElement('div');
                timeDiv.className = "py-1 ";

                if (post.edited_at !== post.created_at) {
                    timeDiv.innerHTML = `Edited: ${post.edited_at}`;
                } else {
                    timeDiv.innerHTML = `Created: ${post.created_at}`;
                }
                postDiv.appendChild(picDiv);

                restDiv.appendChild(userDiv);
                restDiv.appendChild(bodyDiv);
                restDiv.appendChild(timeDiv);
                postDiv.appendChild(restDiv);                
   
                containerDiv.appendChild(postDiv);
            })
        }
        
    });
}

// Load all posts
load_posts();


document.addEventListener('DOMContentLoaded', (event) => {


    // Event for Submit Button
    const submitForm = document.querySelector('#compose-view > form');
    submitForm.addEventListener("submit", (event) => {
        event.preventDefault()
        const postContent = submitForm.querySelector('#compose-body').value;
        create_post(postContent);
    })
})