/*
 * routes definition and handling for paramHashRouter
 */

import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";
import articleFormsHandler from "./articleFormsHandler.js";

export default[
    {
        hash:"welcome",
        ///id of the target html element:
        target:"router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate:(targetElm) =>
            document.getElementById(targetElm).innerHTML =
                document.getElementById("template-welcome").innerHTML
    },
    {
        hash: "articles",
        target: "router-view",
        getTemplate: fetchAndDisplayArticlesNew
    },
    {
        hash:"opinions",
        target:"router-view",
        getTemplate: createHtml4opinions
    },
    {
        hash:"addOpinion",
        target:"router-view",
        getTemplate: (targetElm) =>{
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addOpinion").innerHTML;
            document.getElementById("opnFrm").onsubmit=processOpnFrmData;
            if (auth2.isSignedIn.get()) {
                document.getElementById("nameElm").value = auth2.currentUser.get().getBasicProfile().getName();
            } else {
                document.getElementById("nameElm").value = "";
            }
        }
    },
    {
        hash:"article",
        target:"router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },
    {
        hash:"artEdit",
        target:"router-view",
        getTemplate: editArticle
    },
    {
        hash:"artDelete",
        target:"router-view",
        getTemplate: deleteArticle
    },
    {
        hash:"artInsert",
        target:"router-view",
        getTemplate: insertArticle
    },
    {
        hash:"artComments",
        target:"router-view",
        getTemplate: fetchArticleComments
    }
];

const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 20;
const commentsPerPage = 5;

function createHtml4opinions(targetElm){
    const opinionsFromStorage=localStorage.myChessComments;
    let opinions=[];

    if(opinionsFromStorage){
        opinions=JSON.parse(opinionsFromStorage);
        opinions.forEach(opinion => {
            opinion.created = (new Date(opinion.created)).toDateString();

        });
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-opinions").innerHTML,
        {opinions:opinions}
    );
}

function fetchAndDisplayArticlesNew(targetElm, currentPage, totalPages) {
    console.log("fetchArticlesNew: " + currentPage + " " + totalPages)

    if (currentPage === undefined) {
        currentPage = 1;
    }
    const offset = (Number(currentPage) - 1) * articlesPerPage;
    const url = `${urlBase}/article?offset=${offset}&max=${articlesPerPage}`;

    fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{
                return Promise.reject(
                    new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            const totalCount = responseJSON.meta.totalCount;
            totalPages = totalCount == 0? 1 : Math.ceil(totalCount / articlesPerPage);
            const  data4rendering = {
                currPage: currentPage,
                pageCount: totalPages
            };
            if (currentPage > 1){
                data4rendering.prevPage = Number(currentPage) - 1;
            }
            if(currentPage < totalPages){
                data4rendering.nextPage = Number(currentPage) + 1;
            }
            let targetHtml = Mustache.render(
                document.getElementById("template-articles-pages").innerHTML,
                data4rendering
            );
            addArtDetailLink2ResponseJson(responseJSON);
            targetHtml += Mustache.render(
                document.getElementById("template-articles").innerHTML,
                responseJSON
            );
            document.getElementById(targetElm).innerHTML = targetHtml;
        })
        .catch (error => {
            const errMsgObj = {errMessage:error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });
}

function addArtDetailLink2ResponseJson(responseJSON){
    responseJSON.articles = responseJSON.articles.map(
        article =>(
            {
                ...article,
                detailLink:`#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`,
            }
        )
    );
}

function fetchAndDisplayArticleDetail(targetElm,artIdFromHash,offsetFromHash,totalCountFromHash) {
    fetchAndProcessArticle(...arguments,false);
}

/**
 * Gets an article record from a server and processes it to html according to
 * the value of the forEdit parameter. Assumes existence of the urlBase global variable
 * with the base of the server url (e.g. "https://wt.kpi.fei.tuke.sk/api"),
 * availability of the Mustache.render() function and Mustache templates )
 * with id="template-article" (if forEdit=false) and id="template-article-form" (if forEdit=true).
 * @param targetElm - id of the element to which the acquired article record
 *                    will be rendered using the corresponding template
 * @param artIdFromHash - id of the article to be acquired
 * @param offsetFromHash - current offset of the article list display to which the user should return
 * @param totalCountFromHash - total number of articles on the server
 * @param forEdit - if false, the function renders the article to HTML using
 *                            the template-article for display.
 *                  If true, it renders using template-article-form for editing.
 */
function fetchAndProcessArticle(targetElm,artIdFromHash,offsetFromHash,totalCountFromHash,forEdit) {
    console.log("fetchArticle " + artIdFromHash + " " + offsetFromHash + " " + totalCountFromHash);
    if (artIdFromHash < 0) {
        const articleData = {
            formTitle: "Article Edit",
            submitBtTitle: "Save article",
            backLink: `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`
        };
        document.getElementById(targetElm).innerHTML =
            Mustache.render(
                document.getElementById("template-article-form").innerHTML,
                articleData
            );
        if (!window.artFrmHandler) {
            window.artFrmHandler = new articleFormsHandler("https://wt.kpi.fei.tuke.sk/api");
        }
        window.artFrmHandler.assignFormAndArticle("articleForm", "hiddenElm", artIdFromHash, offsetFromHash, totalCountFromHash);
    } else {
        const url = `${urlBase}/article/${artIdFromHash}`;

        fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else { //if we get server error
                    return Promise.reject(
                        new Error(`Server answered with ${response.status}: ${response.statusText}.`));
                }
            })
            .then(responseJSON => {
                if (forEdit) {
                    responseJSON.formTitle = "Article Edit";
                    responseJSON.submitBtTitle = "Save article";
                    responseJSON.backLink = `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;

                    document.getElementById(targetElm).innerHTML =
                        Mustache.render(
                            document.getElementById("template-article-form").innerHTML,
                            responseJSON
                        );
                    if (!window.artFrmHandler) {
                        window.artFrmHandler = new articleFormsHandler("https://wt.kpi.fei.tuke.sk/api");
                    }
                    window.artFrmHandler.assignFormAndArticle("articleForm", "hiddenElm", artIdFromHash, offsetFromHash, totalCountFromHash);
                } else {
                    responseJSON.backLink = `#articles/${Math.ceil(Number(offsetFromHash)/articlesPerPage) + 1}/${Math.ceil(totalCountFromHash/articlesPerPage)}`;
                    responseJSON.editLink =
                        `#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                    responseJSON.deleteLink =
                        `#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                    responseJSON.submitCommentLink = `saveComment(event, ${artIdFromHash},${offsetFromHash},${totalCountFromHash})`;

                    document.getElementById(targetElm).innerHTML =
                        Mustache.render(
                            document.getElementById("template-article").innerHTML,
                            responseJSON
                        );
                    window.location.hash = `#artComments/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;
                }
            })
            .catch(error => { ////here we process all the failed promises
                const errMsgObj = {errMessage: error};
                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-articles-error").innerHTML,
                        errMsgObj
                    );
            });
    }
}

function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments,true);
}

function insertArticle(targetElm) {
    fetchAndProcessArticle(targetElm,-1, 0, 0,true);
}

function deleteArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    const postReqSettings =
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            }
        };

    fetch(`${urlBase}/article/${artIdFromHash}`, postReqSettings)
        .then(response => {
            if (response.ok) {
                window.alert("Article deleted successfully");
            } else {
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .catch(error => {
            window.alert(`Failed to delete the article from the server. ${error}`);

        })
        .finally(() => window.location.hash = `#articles`);
}

function fetchArticleComments(targetElm, articleId, offset, totalCount, currentCommentPage, totalCommentPages) {
    console.log("fetchArticleComments " + articleId + " " + offset + " " + totalCount);
    let url = `${urlBase}/article/${articleId}/comment`;

    if (currentCommentPage === undefined) {
        currentCommentPage = 1;
    }
    const commentOffset = (Number(currentCommentPage) - 1) * commentsPerPage;
    url += `?offset=${commentOffset}&max=${commentsPerPage}`;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(
                    new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            const totalComments = responseJSON.meta.totalCount;
            totalCommentPages = totalComments == 0? 1 : Math.ceil(totalComments / commentsPerPage);
            const  data4rendering = {
                articleId: articleId,
                offset: offset,
                totalCount: totalCount,
                currPage: currentCommentPage,
                pageCount: totalCommentPages
            };
            if (currentCommentPage > 1){
                data4rendering.prevPage = Number(currentCommentPage) - 1;
            }
            if(currentCommentPage < totalCommentPages){
                data4rendering.nextPage = Number(currentCommentPage) + 1;
            }
            data4rendering.pageCount = totalCommentPages;
            let targetHtml = Mustache.render(
                document.getElementById("template-article-comments-pages").innerHTML,
                data4rendering
            );
            targetHtml += Mustache.render(
                document.getElementById("template-article-comments").innerHTML,
                responseJSON
            );
            document.getElementById("article-comments").innerHTML = targetHtml;
        })
        .catch(error => {
            const errMsgObj = {errMessage: error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });
}