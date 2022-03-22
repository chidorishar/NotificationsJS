// ==UserScript==
// @name         Megapolis tests
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Corpo shit
// @author       Aga
// @include      https://sed.ugv.corp/
// @exclude      https://sed.ugv.corp/models/*
// @icon         https://sed.ugv.corp/models/DOC/images/m-docnet.png
// @updateURL    https://raw.githubusercontent.com/chidorishar/NotificationsJS/Megapolis/Megapolis_test_execOldWS.js
// @downloadURL  https://raw.githubusercontent.com/chidorishar/NotificationsJS/Megapolis/Megapolis_test_execOldWS.js
//@grant none
// ==/UserScript==

var bttnNames = ['+ message ', '- message ']
var bttns = [];
var msgsNumber = 0;
const Nodes = new Map([
    ['review', 'ubtableview-1091'], ['info', 'ubtableview-1379'],
    ['in', 'ubtableview-1451'], ['exec', 'ubtableview-1167'],
    ['cntrl', 'ubtableview-1308'], ['agree', 'ubtableview-1237']
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
    Nodes.forEach((val, key)=>{
        bttnNames.forEach((name)=>{
            let tmpBtn = windoww.document.createElement("button");
            tmpBtn.name = key;
            tmpBtn.innerHTML = name + key;
            tmpBtn.onclick = OnButtonClick;
            bodyElem.appendChild(tmpBtn);
            bttns.push(tmpBtn);
        });
    });
}

function OnButtonClick ()
{
    let targetNode = document.getElementById(Nodes.get(this.name));
    switch(this.innerHTML.substring(0, 3))
    {
        case 'Add':
            logging ? console.log('Added el to ' + this.name) : null;
            targetNode.appendChild(document.createElement('tr'));
            break;
        case 'Rem':
            logging ? console.log('Rem el from ' + this.name) : null;
            targetNode.removeChild(targetNode.lastElementChild);
            break;
    }
};