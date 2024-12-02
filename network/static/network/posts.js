// js for creating a new post

async function create_post(postContent) {
    const jsonRequest = JSON.stringify({
        body: postContent,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    console.log(jsonRequest);
    fetch('/compose', {
        method: 'POST',
        body: jsonRequest
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
        console.log(result);
        
    })
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Event for Submit Button
    const submitForm = document.querySelector('#compose-view > form');
    submitForm.addEventListener("submit", (event) => {
        event.preventDefault()
        const postContent = submitForm.querySelector('#compose-body').value;
        create_post(postContent);
    })
})