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
        // pagination
        const prevDiv = document.querySelector('#page-previous');
        const nextDiv = document.querySelector('#page-next');
        if (!result.page.has_previous) {
            prevDiv.classList.add('disabled');
        } else {
            prevDiv.classList.remove('disabled');
            prevDiv.addEventListener('click', (event) => {
                event.preventDefault();                
                load_posts(result.page.prev_page_num);
                return false;
            });
        }
        if (!result.page.has_next) {
            nextDiv.classList.add('disabled');
        } else {
            nextDiv.classList.remove('disabled');
            nextDiv.addEventListener('click', (event) => {
                event.preventDefault();                
                load_posts(result.page.next_page_num);
                return false;
            })
        }

        // focus post textarea after loading.
        document.querySelector('#compose-body').focus();
        
    });
}

// Load all posts
load_posts(1);


document.addEventListener('DOMContentLoaded', (event) => {


    // Event for Submit Button
    const submitForm = document.querySelector('#compose-view > form');
    submitForm.addEventListener("submit", (event) => {
        event.preventDefault()
        const postContent = submitForm.querySelector('#compose-body').value;
        create_post(postContent);
    })
})