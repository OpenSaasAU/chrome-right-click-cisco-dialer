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

function ciscoSendRuntimeMessage(parameters) {
	chrome.runtime.sendMessage(chrome.i18n.getMessage('@@extension_id'), parameters);
}

function ciscoShowMessage(message, placeholders) {
	ciscoSendRuntimeMessage({'notification': chrome.i18n.getMessage(message, placeholders)});
}

function ciscoSendXmlRequest(uri, request, user, secret) {
	ciscoSendRuntimeMessage({'sendxml': {
		'uri': uri,
		'request': request,
		'user': user,
		'secret': secret
	}});
}

function ciscoSetDestinationUri(phoneAdress) {
	document.ciscoConfig.destinationUri = 'http://' + phoneAdress + '/CGI/Execute';	
}

function ciscoSetDialCommand(telephonyUri) {
	document.ciscoConfig.dialCommandXml =
		'<CiscoIPPhoneExecute><ExecuteItem Priority="0" URL="' +
		telephonyUri.replace('"', '') + '"/></CiscoIPPhoneExecute>';
}

function ciscoSetInternationalExitCode(intExitCode) {
	if (intExitCode) {
		document.ciscoConfig.intExitCode = intExitCode;
		document.ciscoConfig.replacePlusPrefix = true;
	}
}

function ciscoSetAuthUser(user) {
	document.ciscoConfig.authUser = user ? user : '';
}

function ciscoSetAuthSecret(secret) {
	document.ciscoConfig.authSecret = secret ? sjcl.decrypt(
		sjcl.getSecret(document.ciscoConfig.phoneAdress), atob(secret)) : '';
}

function ciscoConfigChanged() {
	if (document.ciscoConfig.enabled) {
		return;
	}

	if (document.ciscoConfig.destinationUri && document.ciscoConfig.dialCommandXml) {
		document.addEventListener('DOMSubtreeModified', ciscoUpdatePage, false);
		document.ciscoConfig.enabled = true;
	}	
}

function ciscoConfigCallback(storage) {
	if (storage.phoneAdress) {
		document.ciscoConfig.phoneAdress = typeof storage.phoneAdress == 'object'
			? storage.phoneAdress.newValue : storage.phoneAdress;
		ciscoSetDestinationUri(document.ciscoConfig.phoneAdress);
	}

	if (storage.telephonyUri) {
		ciscoSetDialCommand(typeof storage.telephonyUri == 'object'
			? storage.telephonyUri.newValue : storage.telephonyUri);
	}
	
	if (storage.intExitCode) {
		ciscoSetInternationalExitCode(typeof storage.intExitCode == 'object'
			? storage.intExitCode.newValue : storage.intExitCode);
	}

	if (storage.authUser) {
		ciscoSetAuthUser(typeof storage.authUser == 'object'
			? storage.authUser.newValue : storage.authUser);
	}

	if (storage.authSecret) {
		ciscoSetAuthSecret(typeof storage.authSecret == 'object'
			? storage.authSecret.newValue : storage.authSecret);
	}

	ciscoConfigChanged();
}

function ciscoInitConfig() {
	document.ciscoConfig = {
		'enabled': false,
		'normalizeNumber': true,
		'replacePlusPrefix': false
	};

	chrome.storage.sync.get(
		['phoneAdress', 'telephonyUri', 'intExitCode', 'authUser', 'authSecret'],
		ciscoConfigCallback);
	chrome.storage.onChanged.addListener(ciscoConfigCallback);
}

ciscoInitConfig();
