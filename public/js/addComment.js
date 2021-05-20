function addComment() {
    console.log("Add Comment");
    showCommentFields(true);
    if (auth2.isSignedIn.get()) {
        document.getElementById("comment-author").value = auth2.currentUser.get().getBasicProfile().getName();
    } else {
        document.getElementById("comment-author").value = "";
    }
}

function cancelComment() {
    console.log("Cancel Comment");
    showCommentFields(false);
}

function saveComment(event, articleId, offset, totalCount) {
    console.log("Save Comment - article" + articleId + " " + offset + "  " + totalCount);
    event.preventDefault();
    const serverUrl = "https://wt.kpi.fei.tuke.sk/api"

    const commentData = {
        author: event.target.elements.namedItem("comment-author").value.trim(),
        text: event.target.elements.namedItem("comment-text").value.trim()
    };

    const postReqSettings =
        {
            method: ('POST'),
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(commentData)
        };

    fetch(`${serverUrl}/article/${articleId}/comment`, postReqSettings)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            window.alert("New comment saved on server");
        })
        .catch(error => {
            window.alert(`Failed to save the new comment on server. ${error}`);

        })
        .finally(() => window.location.hash = `#article/${articleId}/${offset}/${totalCount}`);

    showCommentFields(false);
}

function showCommentFields(showFields) {
    const trueVal = showFields ? "visible" : "hidden";
    const falseVal = !showFields ? "visible" : "hidden";
    const commentFrm = document.getElementById("new-comment-frm");
    const addBtn = document.getElementById("add-comment");
    commentFrm.style.visibility = trueVal;
    addBtn.style.visibility = falseVal;
}

function saveArticleComment() {
    console.log("Save Comment");
}