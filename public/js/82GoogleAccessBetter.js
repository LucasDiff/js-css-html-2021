let auth2 = {};

function renderUserInfo(googleUser, htmlElmId) {
    const profile = googleUser.getBasicProfile();
    const htmlStringSk=
        `
            <p>Používateľ prihlásený</p>
            <ul>
                <li> ID: ${profile.getId()}
                <li>  Plné meno: ${profile.getName()}
                <li>  Krstné meno: ${profile.getGivenName()}
                <li>  Priezvisko: ${profile.getFamilyName()}
                <li>  URL obrázka: ${profile.getImageUrl()}
                <li>  Email: ${profile.getEmail()}
            </ul>
        `;
    const htmlStringEn=
        `
            <p>User logged in.</p>
            <ul>
                <li> ID: ${profile.getId()}
                <li>  Full name: ${profile.getName()}
                <li>  Given name: ${profile.getGivenName()}
                <li>  Family name: ${profile.getFamilyName()}
                <li>  Image URL: ${profile.getImageUrl()}
                <li>  Email: ${profile.getEmail()}
            </ul>
        `;
    //Id z profile.getId() sa nema pouzivat na komunikaciu s vlastnym serverom (you should not use the id from profile.getId() for communication with your server)
    document.getElementById(htmlElmId).innerHTML=htmlStringSk+htmlStringEn;
}

function renderLogOutInfo(htmlElmId) {
    const htmlString=
        `
                <p>Používateľ nie je prihlásený</p>
                <p>User not signed in</p>
                `;
    document.getElementById(htmlElmId).innerHTML=htmlString;
}

function signOut() {
    if(auth2.signOut){
        auth2.signOut();
    }
    if(auth2.disconnect){
        auth2.disconnect();
    }
}

function userChanged(user){
    console.log("userChanged " + user.getBasicProfile().getName());
    console.log("Sign In: " + user.isSignedIn());
    document.getElementById("userName").innerHTML=user.getBasicProfile().getName();

    const nameElm = document.getElementById("nameElm");
    const userNameInputElm = document.getElementById("author");

    if(nameElm ){// pre/for 82GoogleAccessBetter.html
        renderUserInfo(user,"userStatus");
    }else if (userNameInputElm){// pre 82GoogleAccessBetterAddArt.html
        userNameInputElm.value=user.getBasicProfile().getName();
    }
}


function updateSignIn() {
    console.log("updateSignIn " + auth2.isSignedIn.get());
    const sgnd = auth2.isSignedIn.get();
    if (sgnd) {
        document.getElementById("SignInButton").classList.add("hiddenElm");
        document.getElementById("SignedIn").classList.remove("hiddenElm");
        document.getElementById("userName").innerHTML=auth2.currentUser.get().getBasicProfile().getName();
    }else{
        document.getElementById("SignInButton").classList.remove("hiddenElm");
        document.getElementById("SignedIn").classList.add("hiddenElm");
        document.getElementById("userName").innerHTML="";
    }

    const userInfoElm = document.getElementById("userStatus");
    const authorElm = document.getElementById("author");
    const nameElm = document.getElementById("nameElm");
    const authorCommentElm = document.getElementById("comment-author");

    if(userInfoElm){// pre/for 82GoogleAccessBetter.html
        if (sgnd) {
            renderUserInfo(auth2.currentUser.get(),"userStatus");
        }else{
            renderLogOutInfo("userStatus");
        }
    }else if (authorElm){// pre/for 82GoogleAccessBetterAddArt.html
        if (sgnd) {
            authorElm.value=auth2.currentUser.get().getBasicProfile().getName();
        }else{
            authorElm.value="";
        }
    } else if (nameElm) {
        if (sgnd) {
            nameElm.value=auth2.currentUser.get().getBasicProfile().getName();
        }else{
            nameElm.value="";
        }
    } else if (authorCommentElm) {
        if (sgnd) {
            authorCommentElm.value=auth2.currentUser.get().getBasicProfile().getName();
        }else{
            authorCommentElm.value="";
        }
    }
}

function startGSingIn() {
    gapi.load('auth2', function() {
        gapi.signin2.render('SignInButton', {
            'width': 240,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });
        gapi.auth2.init().then( //zavolat po inicializácii OAuth 2.0  (called after OAuth 2.0 initialisation)
            function (){
                console.log('init');
                auth2 = gapi.auth2.getAuthInstance();
                auth2.currentUser.listen(userChanged);
                auth2.isSignedIn.listen(updateSignIn);
                auth2.then(updateSignIn); //tiez po inicializacii (later after initialisation)
            });
    });

}

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}
function onFailure(error) {
    console.log(error);
}