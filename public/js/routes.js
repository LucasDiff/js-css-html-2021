/*
 * routes definition and handling for paramHashRouter
 */

import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";

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
        getTemplate: createHtml4Main
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
        }
    }

];
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


function fetchAndDisplayArticles(targetElm,current,data4rendering) {


    const url = "https://wt.kpi.fei.tuke.sk/api/article";
    let changeableUrl;
    if(current==1){
        changeableUrl = "http://wt.kpi.fei.tuke.sk/api/article/?max=20&offset="+0;
    } else {
        changeableUrl = "http://wt.kpi.fei.tuke.sk/api/article/?max=20&offset="+(19+((current-2)*20));
    }

    console.log(changeableUrl)

    let article = [];
    let idcounter = [];

    initFetch(changeableUrl, idcounter)
        .then( ()=> {
            return loadMustache(url, article, idcounter, targetElm)
        })
        .then( ()=> {
            rndrMustache(article, targetElm,data4rendering)
        })
        .catch(error=>{
            console.log('Not working');
            console.log(error);
        })

}

function initFetch(changeableUrl,idcounter){

    return fetch(changeableUrl)
        .then(resp => {
            return resp.json();
        })
        .then(function (data) {
            console.log(data);
            //console.log(data.meta.max);
            for (let x = 0; x < data.articles.length/*data.meta.max*/; x++) {
                idcounter[x] = data.articles[x].id;
            }

            sessionStorage.setItem("totalarticles",data.meta.totalCount);
        })
    return Promise.resolve();
}

function rndrMustache(article,targetElm,data4rendering){
    console.log(data4rendering)
    data4rendering.articles =article;
    document.getElementById(targetElm).innerHTML =
        Mustache.render(
            document.getElementById("template-articles").innerHTML,
            data4rendering
        );
}

function loadMustache(url,article,idcounter,targetElm){
    let promise = [];
    for (let i = 0; i < idcounter.length; i++) {
        let url1 = url+'/'+idcounter[i];
        // console.log(url2);

        promise[i] = fetch(url1)
          
            .then(response => {
 
                if (response.ok) {
                    return response.json();
                   
                }
            })
            .then(responseJSON => {
                console.log(responseJSON);
                article[i] = responseJSON;
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
    return Promise.all(promise);
}


function createHtml4Main(targetElm, current, totalCount) {
// console.log(sessionStorage.getItem
    let totalArt = sessionStorage.getItem("totalarticles");
    if(totalArt == null) {
        totalCount = parseInt(totalCount);
    }else{
        totalCount=Math.ceil(totalArt/20);
    }
    current = parseInt(current);

    const  data4rendering = {
        currPage: current,
        pageCount: totalCount
    };

    console.log(sessionStorage.getItem("page"))
    console.log(current)
    console.log(sessionStorage.getItem("lastpage"))

    if(current===1 && 2 < sessionStorage.getItem("page")) {
        data4rendering.currPage = sessionStorage.getItem("page");
        current = parseInt(sessionStorage.getItem("page"));
    }else{
        sessionStorage.setItem("page",current)
    }
    if (current > 1){
        data4rendering.prevPage = current - 1;
    }
    if(current < totalCount){
        data4rendering.nextPage = current + 1;
    }
    sessionStorage.setItem("lastpage",current+1)
    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-articles").innerHTML,
        data4rendering,
    );
    fetchAndDisplayArticles(targetElm,current,data4rendering);
}

