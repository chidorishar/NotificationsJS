// ==UserScript==
// @name         Megapolis tests for registrar working space
// @namespace    SED_Megapolis
// @homepage     https://github.com/chidorishar
// @version      1.5
// @description  Corpo shit
// @author       Aga
// @include      https://sed.ugv.corp/
// @exclude      https://sed.ugv.corp/models/*
// @icon         https://sed.ugv.corp/models/DOC/images/m-docnet.png
// @updateURL    https://github.com/chidorishar/NotificationsJS/raw/Megapolis/Megapolis_test_registrarWS.js
// @downloadURL  https://github.com/chidorishar/NotificationsJS/raw/Megapolis/Megapolis_test_registrarWS.js
//@grant none
// ==/UserScript==

var bttnNames = ['+ message ', '- message ']
var bttns = [];
var msgsNumber = 0;
const Nodes = new Map([
    ['sigh', 'ubtableview-1658'], ['info', 'ubtableview-1588'],
    ['signing', 'ubtableview-1515'], ['exec', 'ubtableview-1445'],
    ['regist', 'ubtableview-1373'], ['review', 'ubtableview-1195']
]);

var logging = false;

(function() {
    'use strict';
    let targetNode = null;
    let timerId = setTimeout(function tick() {
        logging ? console.log('tick') : null;
        targetNode = document.getElementById(Nodes.get('sigh'));
        logging ? console.log(Nodes.get('sigh')) : null;
        if(!targetNode)
        {
            timerId = setTimeout(tick, 2000);
        }
        else
        {
            CreateButtons();
        }
    }, 2000);
})();

function CreateButtons(){
    var windoww = window.open("", "ControlPanel", "popup");
    let bodyElem = windoww.document.body;
    //clear previously created buttons
    while(bodyElem.hasChildNodes())
    {
       bodyElem.removeChild(bodyElem.lastChild);
    }
    windoww.resizeTo(320,400);
    var div, cntr = 0;
    Nodes.forEach((val, key) => {
        bttnNames.forEach((name) => {
            if (!(cntr % 2))
            {
                div = windoww.document.createElement("div");
                bodyElem.appendChild(div);
            }
            let tmpBtn = windoww.document.createElement("button");
            tmpBtn.name = key;
            tmpBtn.innerHTML = name + key;
            tmpBtn.onclick = OnButtonClick;
            div.appendChild(tmpBtn);
            bttns.push(tmpBtn);
            cntr++;
        });
    });
}

function OnButtonClick ()
{
    let targetNode = document.getElementById(Nodes.get(this.name));
    switch(this.innerHTML.substring(0, 1))
    {
        case '+':
            logging ? console.log('Added el to ' + this.name) : null;
            targetNode.appendChild(document.createElement('tr'));
            break;
        case '-':
            logging ? console.log('Rem el from ' + this.name) : null;
            targetNode.removeChild(targetNode.lastElementChild);
            break;
    }
};