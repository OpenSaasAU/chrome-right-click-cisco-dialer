/*
 *   Cisco Dialer - Chrome Extension
 *   Copyright (C) 2013 Christian Volmering <christian@volmering.name>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
function ciscoShowMessage(message, placeholders) {
	chrome.notifications.create('', {
		type: 'basic',
		title: chrome.i18n.getMessage('extension_name'),
		message: chrome.i18n.getMessage(message, placeholders),
		iconUrl: 'chrome-extension://' 
			+ chrome.i18n.getMessage('@@extension_id')
			+ '/images/error_icon.png'
	}, function (notificationId) {});
}

function ciscoSendXmlRequest(uri, request, user, secret) {
	var postParameters = 'XML=' + encodeURIComponent(request).replace(/%20/g, '+');
	var xmlHttp = new XMLHttpRequest();

	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4) {
			if (!xmlHttp.status) {
				ciscoShowMessage('error_connection_failed');
			}
			else if (xmlHttp.status != 200) {
				ciscoShowMessage('error_dial_failed', [xmlHttp.status, xmlHttp.statusText]);
			}
		}
	};

	xmlHttp.open('POST', uri, true, user, secret);
	xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xmlHttp.send(postParameters);
} 

function callCiscoPhone(info,tab) {

    console.log("Word " + info.selectionText + " was clicked.");
    var request = '<CiscoIPPhoneExecute><ExecuteItem Priority="0" URL="Dial:' + info.selectionText.replace(/\s/g, '') + '"/></CiscoIPPhoneExecute>';
    console.log (request);
    var user = 'undefined';
    var secret = '';
    var postParameters = 'XML=' + encodeURIComponent(request).replace(/%20/g, '+');
     var xmlHttp = new XMLHttpRequest();
     xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4) {
			if (!xmlHttp.status) {
				console.loge('error_connection_failed');
			}
			else if (xmlHttp.status != 200) {
				console.log ('error_dial_failed', [xmlHttp.status, xmlHttp.statusText]);
			}
		}
	};
	xmlHttp.open('POST', 'http://10.245.173.10/CGI/Execute', true, user, secret);
	xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xmlHttp.send(postParameters);
	console.log (postParameters);


}



chrome.contextMenus.create({

    title: "Call: %s", 
    contexts:["selection"], 
    onclick: callCiscoPhone,

});
