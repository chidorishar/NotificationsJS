// ==UserScript==
// @name         Megapolis notifications for executor working space (old)
// @namespace    SED_Megapolis
// @source       https://github.com/chidorishar
// @homepage     https://github.com/chidorishar/NotificationsJS/tree/Megapolis
// @version      2.0
// @description  corpo shit
// @author       Aga
// @include      https://sed.ugv.corp/
// @exclude      https://sed.ugv.corp/models/*
// @run-at       document-end
// @icon         https://sed.ugv.corp/models/DOC/images/m-docnet.png
// @updateURL    https://github.com/chidorishar/NotificationsJS/raw/Megapolis/Megapolis_notifications_execOldWS.js
// @downloadURL  https://github.com/chidorishar/NotificationsJS/raw/Megapolis/Megapolis_notifications_execOldWS.js
// ==/UserScript==

var logging = false;

class NodeRelData
{
    constructor() { this.totalNumber = 0; this.notification = null; }
};

var targetNodes = Array(6).fill(null);;
//key is element ID, value is class that store unread documents number for element
const ObservedNodesMap = new Map([
    ['ubtableview-1091', new NodeRelData()], ['ubtableview-1308', new NodeRelData()],
    ['ubtableview-1167', new NodeRelData()], ['ubtableview-1451', new NodeRelData()],
    ['ubtableview-1237', new NodeRelData()], ['ubtableview-1379', new NodeRelData()]
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
            let activeNotification;

            trgNodeChilds = mutation.target.querySelectorAll('tr:not(.ub-grid-row-end)');
            newNumber = trgNodeChilds.length;
            oldNumber = ObservedNodesMap.get(mutation.target.id).totalNumber;
            activeNotification = ObservedNodesMap.get(mutation.target.id).notification;

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
                    activeNotification ? activeNotification.close() : null;
                }
                else
                {
                    logging ? console.log('call for notification') : null;
                    delta > 0 ? ShowNotification(mutation.target.id) : null;
                }
            }
            else
            {
                activeNotification ? activeNotification.close() : null;
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
    let activeNotification;

    switch(senderElementID)
    {
        case 'ubtableview-1091':
            body = '\nВам надіслано новий документ на розгляд';
            tag = 'mgplsSightNotif_execOld';
            break;
        case 'ubtableview-1379':
            body = '\nВам надіслано новий інформаційний документ';
            tag = 'mgplsInfoNotif_execOld';
            break;
        case 'ubtableview-1451':
            body = '\nВам надіслано новий вхідний документ';
            tag = 'mgplsInNotif_execOld';
            break;
        case 'ubtableview-1167':
            body = '\nВам надіслано новий документ на виконання';
            tag = 'mgplsExecNotif_execOld';
            break;
        case 'ubtableview-1308':
            body = '\nВам надіслано новий документ для контролю виконання завдання';
            tag = 'mgplsCntrlNotif_execOld';
            break;
        case 'ubtableview-1237':
            body = '\nВам надіслано новий документ на узгодження';
            tag = 'mgplsAgreeNotif_execOld';
            break;
    }
    let configNotification = {body: body, icon: 'https://sed.ugv.corp/models/DOC/images/m-docnet.png',
                              tag: tag, renotify: true, requireInteraction: true};
    //var zz = new Notification("ZZZ" , {});
    activeNotification = new Notification("Megapolis -- new incoming document", configNotification);
    activeNotification.onclick = function () { window.focus(); activeNotification.close(); }
    ObservedNodesMap.get(senderElementID).notification = activeNotification;
}

function TryGetElementsAndBeginObserve()
{
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
