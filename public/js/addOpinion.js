

export default function processOpnFrmData(event){

    this.opinionsFrmElm = document.getElementById("opnFrm");

    event.preventDefault();
    let pos = document.getElementsByName('gender');
    let poss = document.getElementsByName('chessPlayer');
    let nopGender;
    let nopChessPlayer;


    const nopName = this.opinionsFrmElm.elements["nameElm"].value.trim();
    const nopEmail = this.opinionsFrmElm.elements["emailElm"].value.trim();
    const nopUrl = this.opinionsFrmElm.elements["urlElm"].value.trim();
    const nopOpn = this.opinionsFrmElm.elements["opnElm"].value.trim();
    if (pos[0].checked) {
        nopGender = pos[0].value;
    } else {
        nopGender = pos[1].value;
    }
    if(poss[0].checked) {
        nopChessPlayer = poss[0].value;
    } else if(poss[1].checked){
        nopChessPlayer = poss[1].value;
    } else if(poss[2].checked){
        nopChessPlayer = poss[2].value;
    } else {
        nopChessPlayer = poss[3].value;
    }

    if (nopName === "") {
        window.alert("Please, enter your name");
        return;
    } else if (nopOpn === "") {
        window.alert("Please, enter your opinion");
        return;
    } else if (nopEmail === "") {
        window.alert("Please, enter your email");
        return;
    }

    //3. Add the data to the array opinions and local storage
    const newOpinion =
        {
            name: nopName,
            email: nopEmail,
            url: nopUrl,
            gender: nopGender,
            chessPlayer : nopChessPlayer,
            comment: nopOpn,
            created: new Date()
        };

    let opinions = [];

    if(localStorage.myChessComments){
        opinions=JSON.parse(localStorage.myChessComments);
    }

    opinions.push(newOpinion);
    localStorage.myChessComments = JSON.stringify(opinions);

    window.location.hash="#opinions";

}
