// CSRF Token Helper
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Like functionality
function toggleLike(postId) {
    fetch(`/interactions/like/${postId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': typeof csrfToken !== 'undefined' ? csrfToken : getCookie('csrftoken'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.error) return;
        const countSpan = document.getElementById(`like-count-${postId}`);
        countSpan.textContent = data.like_count;
        
        const btn = countSpan.closest('.like-btn');
        const icon = btn.querySelector('svg');
        
        if (data.liked) {
            btn.classList.add('liked', 'text-danger');
            icon.style.fill = 'currentColor';
        } else {
            btn.classList.remove('liked', 'text-danger');
            icon.style.fill = 'none';
        }
    });
}

function doubleClickLike(postId) {
    const overlay = document.getElementById(`heart-overlay-${postId}`);
    overlay.classList.remove('hidden');
    
    // Trigger animation
    const icon = overlay.querySelector('svg');
    icon.classList.remove('heart-explosion');
    void icon.offsetWidth; // trigger reflow
    icon.classList.add('heart-explosion');
    
    // Send like request if not liked yet
    const btn = document.querySelector(`.post-card[data-post-id="${postId}"] .like-btn`);
    if (!btn.classList.contains('liked')) {
        toggleLike(postId);
    }
    
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 1000);
}

// Follow
function toggleFollow(username) {
    fetch(`/interactions/follow/${username}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': typeof csrfToken !== 'undefined' ? csrfToken : getCookie('csrftoken'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.error) return;
        
        const followBtn = document.getElementById('follow-btn');
        const countSpan = document.getElementById('followers-count');
        
        if (countSpan) countSpan.textContent = data.followers_count;
        
        if (followBtn) {
            if (data.following) {
                followBtn.textContent = 'Unfollow';
                followBtn.classList.remove('btn-primary');
                followBtn.classList.add('btn-outline');
            } else {
                followBtn.textContent = 'Follow';
                followBtn.classList.remove('btn-outline');
                followBtn.classList.add('btn-primary');
            }
        }
    });
}

// Bookmark
function toggleBookmark(postId) {
    fetch(`/interactions/bookmark/${postId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': typeof csrfToken !== 'undefined' ? csrfToken : getCookie('csrftoken'),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.error) return;
        const btn = document.querySelector(`.post-card[data-post-id="${postId}"] .bookmark-btn svg`);
        if (data.bookmarked) {
            btn.style.fill = 'currentColor';
            btn.classList.add('text-primary');
        } else {
            btn.style.fill = 'none';
            btn.classList.remove('text-primary');
        }
    });
}

// Create Post Modal
function openCreatePostModal() {
    document.getElementById('createPostModal').classList.remove('hidden');
}

function closeCreatePostModal() {
    document.getElementById('createPostModal').classList.add('hidden');
}

// Comment Sheet
function openCommentSheet(postId) {
    document.getElementById('comment-post-id').value = postId;
    document.getElementById('commentsSheet').classList.remove('hidden');
    loadComments(postId);
}

function closeCommentSheet() {
    document.getElementById('commentsSheet').classList.add('hidden');
}

function loadComments(postId) {
    const list = document.getElementById('comments-list');
    list.innerHTML = '<div class="skeleton" style="height: 50px; border-radius: var(--radius-md); margin-bottom: 10px;"></div><div class="skeleton" style="height: 50px; border-radius: var(--radius-md); margin-bottom: 10px;"></div>';
    
    fetch(`/post/${postId}/comments/`, {
        headers: {'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => response.json())
    .then(data => {
        list.innerHTML = '';
        if (data.comments.length === 0) {
            list.innerHTML = '<p class="text-secondary text-center">No comments yet.</p>';
            return;
        }
        data.comments.forEach(comment => {
            list.innerHTML += `
                <div class="card mb-2" style="padding: 1rem;">
                    <strong>${comment.author}</strong> <span class="text-secondary" style="font-size: 0.8rem;">${comment.created_at}</span>
                    <p class="mt-1">${comment.content}</p>
                </div>
            `;
        });
    });
}

document.getElementById('addCommentForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const postId = document.getElementById('comment-post-id').value;
    const content = document.getElementById('comment-input').value;
    
    fetch(`/post/${postId}/comment/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': typeof csrfToken !== 'undefined' ? csrfToken : getCookie('csrftoken'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: content })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            document.getElementById('comment-input').value = '';
            loadComments(postId);
            
            // update count in feed
            const countSpan = document.getElementById(`comment-count-${postId}`);
            if (countSpan) {
                countSpan.textContent = parseInt(countSpan.textContent) + 1;
            }
        }
    });
});

// Post Options Dropdown
function togglePostOptions(postId) {
    const menu = document.getElementById(`options-${postId}`);
    menu.classList.toggle('hidden');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.post-options')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.add('hidden');
        });
    }
});

function copyLink(slug) {
    const url = `${window.location.origin}/post/${slug}/`;
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
    });
}

function deletePost(postId) {
    if(confirm('Are you sure you want to delete this post?')) {
        fetch(`/post/${postId}/delete/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': typeof csrfToken !== 'undefined' ? csrfToken : getCookie('csrftoken'),
            }
        }).then(() => {
            document.querySelector(`.post-card[data-post-id="${postId}"]`).remove();
        });
    }
}

// Live Search
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

if(searchInput) {
    searchInput.addEventListener('input', debounce(function(e) {
        const query = e.target.value;
        if(query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }
        
        fetch('/search/?q=' + query)
        .then(res => res.json())
        .then(data => {
            searchResults.innerHTML = '';
            searchResults.classList.remove('hidden');
            
            if(data.users.length > 0) {
                searchResults.innerHTML += '<h5 class="p-2 text-secondary">Users</h5>';
                data.users.forEach(u => {
                    searchResults.innerHTML += '<a href="/accounts/profile/' + u.username + '/" class="dropdown-item d-flex align-center gap-2">' + u.username + '</a>';
                });
            }
            if(data.posts.length > 0) {
                searchResults.innerHTML += '<h5 class="p-2 text-secondary">Posts</h5>';
                data.posts.forEach(p => {
                    searchResults.innerHTML += '<a href="/post/' + p.id + '/" class="dropdown-item d-flex align-center gap-2">' + p.content + '</a>';
                });
            }
            if(data.users.length === 0 && data.posts.length === 0) {
                searchResults.innerHTML = '<p class="p-2 text-secondary">No results found.</p>';
            }
        });
    }, 300));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mouse Glow Tracking
document.addEventListener('mousemove', (e) => {
    const glow = document.getElementById('mouse-glow');
    if (glow) {
        requestAnimationFrame(() => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    }
});