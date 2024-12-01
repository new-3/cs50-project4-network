// React (text/babel)
console.log('script loaded')
    function Like() {
        const [like, setLike] = React.useState(false);
        function toggleLike() {
            setLike(!like);
        }
        return (
            <div>
                <button onClick={toggleLike}>{like?'Cancel':'Like'}</button>
            </div>
        );
    }
        const posts_div = Array.from(document.querySelectorAll('.post-container'))
        posts_div.forEach(postContainer => {
            postContainer.querySelector(".like-container").append("hi")
            ReactDOM.render(<Like />, postContainer.querySelector(".like-container"))
        })