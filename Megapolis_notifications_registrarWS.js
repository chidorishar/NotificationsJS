// ==UserScript==
// @name         Megapolis notifications for registrar working space
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  corpo shit
// @author       Aga
// @include      https://sed.ugv.corp/
// @exclude      https://sed.ugv.corp/models/*
// @run-at       document-end
// @icon         https://sed.ugv.corp/models/DOC/images/m-docnet.png
// @updateURL    https://raw.githubusercontent.com/chidorishar/NotificationsJS/Megapolis/Megapolis_notifications_registrarWS.js
// @downloadURL  https://raw.githubusercontent.com/chidorishar/NotificationsJS/Megapolis/Megapolis_notifications_registrarWS.js
// ==/UserScript==

var logging = false;

class NodeInfo
{
    constructor() { this.totalNumber = 0; }
};

var sightingNumb = 0, infoNumb = 0, signingNumb = 0, execNumb = 0, registNumb = 0, reviewNumb = 0;
var notification;
var targetNodes = Array(6).fill(null);;
//key is element ID, value is class that store unread documents number for element
const ObservedNodesMap = new Map([
    ['ubtableview-1658', new NodeInfo()], ['ubtableview-1588', new NodeInfo()],
    ['ubtableview-1515', new NodeInfo()], ['ubtableview-1445', new NodeInfo()],
    ['ubtableview-1373', new NodeInfo()], ['ubtableview-1195', new NodeInfo()]
]);
var trgNodeChilds;
const configObserver = { attributes: true, childList: true, subtree: true };
var timerDelay = 2000; //ms
var timerCounter = 0;
var timerID;

//var targetNodesIDs = ['ubtableview-1658', 'ubtableview-1588', 'ubtableview-1515', 'ubtableview-1445', 'ubtableview-1373', 'ubtableview-1195' ]; // sighting | info | signing | exec. | regist. | review
/*const Nodes = new Map([
    ['sigh', 'ubtableview-1658'], ['info', 'ubtableview-1588'],
    ['signing', 'ubtableview-1515'], ['exec', 'ubtableview-1445'],
    ['regist', 'ubtableview-1373'], ['review', 'ubtableview-1195']
]);*/

const DOMMutationCallback = OnMutation;
const observers = Array(6).fill(new MutationObserver(DOMMutationCallback));

//main function
(function() {
    //try to get target node and setup observers
    timerID = setTimeout(TryGetElementsAndBeginObserve, timerDelay);
    //stop observing when leaving/reloading page
    window.onunload = function()
    {
        logging ? console.log('before page unload: disconnecting observer'): null;
        observers.forEach(function(obsrvr){ obsrvr.disconnect(); });
    };
    //check and setup notifications permissions
    if (!("Notification" in window))
    {
        alert("Notifications is not supporting!");
    }
    else
    {
        if(Notification.permission != 'granted')
        {
            Notification.requestPermission().then(function(result) {
                if (result === "denied") {
                    alert('Notifications permission not granted, Megapolis tampermonkey script will not work');
                }
            });;
        }
    }
})();

function GetCurrNodesState()
{
    ObservedNodesMap.forEach(function(value, key)
    {
        value.totalNumber = document.getElementById(key).querySelectorAll('tr:not(.ub-grid-row-end)').length;
    });
}

function OnMutation(mutationsList, observer)
{
    for(const mutation of mutationsList)
    {
        //add or remove node
        if (mutation.type == 'childList')
        {
            let newNumber, oldNumber;
            trgNodeChilds = mutation.target.querySelectorAll('tr:not(.ub-grid-row-end)');
            newNumber = trgNodeChilds.length;
            oldNumber = ObservedNodesMap.get(mutation.target.id).totalNumber;

            logging ? console.log('A child node has been added or removed in: ') : null;
            logging ? console.log(mutation.target) : null;
            logging ? console.log('new len: ' + trgNodeChilds.length) : null;
            logging ? console.log('old len: ' + oldNumber) : null;

            if (newNumber != oldNumber)
            {
                let delta = newNumber - oldNumber;
                ObservedNodesMap.get(mutation.target.id).totalNumber = newNumber;
                if(newNumber == 0)
                {
                    notification ? notification.close() : null;
                }
                else
                {
                    logging ? console.log('call for notification') : null;
                    delta > 0 ? ShowNotification(mutation.target.id) : null;
                }
            }
            else
            {
                notification ? notification.close() : null;
            }
            logging ? console.log('nodes after changing :') : null;
            logging ? console.log(ObservedNodesMap) : null;
        }
        /*//change node attribute
        else if (mutation.type === 'attributes')
        {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
        }*/
    }
};

function ShowNotification(senderElementID)
{
    logging ? console.log('hello from notification') : null;
    let body, tag;
    switch(senderElementID)
    {
        case 'ubtableview-1658':
            body = '\nВам надіслано новий документ для візування';
            tag = 'mgplsSightNotif_rgstr';
            break;
        case 'ubtableview-1588':
            body = '\nВам надіслано новий інформаційний документ';
            tag = 'mgplsInfoNotif_rgstr';
            break;
        case 'ubtableview-1515':
            body = '\nВам надіслано новий документ на підпис';
            tag = 'mgplsSignNotif_rgstr';
            break;
        case 'ubtableview-1445':
            body = '\nВам надіслано новий документ на виконання';
            tag = 'mgplsExecNotif_rgstr';
            break;
        case 'ubtableview-1373':
            body = '\nВам надіслано новий документ для реєстрації';
            tag = 'mgplsRegistNotif_rgstr';
            break;
        case 'ubtableview-1195':
            body = '\nВам надіслано новий документ на рецензування';
            tag = 'mgplsReviewNotif_rgstr';
            break;
    }
    let configNotification = {body: body, icon: 'https://sed.ugv.corp/models/DOC/images/m-docnet.png',
                              tag: tag, renotify: true, requireInteraction: true};
    //var zz = new Notification("ZZZ" , {});
    notification = new Notification("Megapolis -- new incoming document", configNotification);
    notification.onclick = function(){ window.focus(); notification.close(); }
}

function TryGetElementsAndBeginObserve() {
    logging ? console.log('tick: ' + timerCounter) : null;
    // Select the node that will be observed for mutations
    let counter = 0;
    ObservedNodesMap.forEach(function(value, key)
    {
        targetNodes[counter++] = document.getElementById(key);
    });
    if(targetNodes.every(elem => elem == null ))
    {
        if (timerCounter > 10)
        {
            timerCounter = 0;
            return;
        }
        timerID = setTimeout(TryGetElementsAndBeginObserve, timerDelay *= 1.2);
        timerCounter++;
    }
    else
    {
        // Start observing the target node for configured mutations
        logging ? console.log('begin observing') : null;
        GetCurrNodesState();
        observers.forEach((obsrvr, indx)=>{ obsrvr.observe(targetNodes[indx], configObserver); });
        timerCounter = 0;
        /*trgNodeChilds = targetNode.querySelectorAll('tr:not(.ub-grid-row-end)');
        console.log(trgNodeChilds.length);
        console.log(trgNodeChilds);*/
    }
}
