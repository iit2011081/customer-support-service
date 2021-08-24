$(document).ready(function () {
	var socket = io();
	var user, activeChatId = '';  // Using this when a active session is selected
	var showActiveChats = false;
	function setSessionStorage(key, value) {
		sessionStorage.setItem(key, value);
	}
	function getSessionStorage(key) {
		return sessionStorage.getItem(key);
	}
	const userSession = getSessionStorage("user");
	if(userSession) {
		user = JSON.parse(userSession);
		setUsername(user.fullName);
		showActiveChats = true;
		toggleActiveChats();
	} else {
		showActiveChats = false;
		toggleActiveChats();
	}
	function setUsername(name){
		socket.emit('signUp', {fullName : name, roleId : "1hj6fiv00000000"}); //@TODO Choose this roleId dynamically
	};
	socket.on('userSet', function(data){
		user = data;
		setSessionStorage("user", JSON.stringify(data));
		console.log("setting user storage");
		showActiveChats = true;
		toggleActiveChats();
		fetchActiveSessions(user ? user.id : '');
	});

	function toggleActiveChats() {
		if(!showActiveChats) {
			$('#activeChats').hide();
			$('#activeUser').show();
		} else {
			$('#activeChats').show();
			$('#activeUser').hide();
		}
	}

	$('#setUser').click(function() {
		setUsername($('#name').val())
	});
	$('#sendMessage').click(function(){ 
		var msg = $("textarea").val();
		if(msg){
			$("textarea").val("");
			socket.emit('sendMessage', {content: msg, user: user, sessionId : activeChatId});
			let chatObject = {
				content : msg,
				createdAt : moment().format(),
				sender : {
					fullName : user.fullName
				}
			};
			const chatFormat = populateChat(chatObject);
			$("#ui-chat-box").append(chatFormat);
			$("#ui-chat-box").animate({scrollTop : 5000}, 'fast')
		}
	});
	socket.on('receiveMessage', function(data){
		console.log("receiveMessage", data, activeChatId);
		if(activeChatId == data.sessionId) {
			let chatObject = {
				content : data.content,
				createdAt : data.createdAt,
				sender : {
					fullName : data.user
				}
			};
			const chatFormat = populateChat(chatObject);
			$("#ui-chat-box").append(chatFormat);
		}
		$(`#${data.sessionId} .last-msg`).html(data.content);
		$(`#${data.sessionId} .last-time`).html(moment(data.createdAt).format('h:mm:ss'));
	})

	async function fetchActiveSessions(userId) {
		const url = "/api/v1/web/sessions/active";
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				'x-user-id' : userId || '1hj6k4u00000000'
			},
		});
		var data = await response.json();
		if(data.data) {
			populateActiveSessions(data.data);
		}
	}
	var chatResponse = [];
	if(!activeChatId){
		$('#ui-chat-box').html("Click on any active session to view the messages");
	}
	var activeSessionDivs = "", activeSessionArr = [];
	function populateActiveSessions(activeSessions) {
		activeSessionArr = activeSessions;
		activeSessionArr.forEach((activeSession)=>{
			activeSessionDivs += '<div id="'+activeSession.id+'" data-name="'+activeSession.customer.fullName+'" class="p-3 d-flex align-items-center border-left border-primary  border-bottom ui-post-header ui-post-message overflow-hidden">';
			activeSessionDivs += '<div class="font-weight-bold mr-1 overflow-hidden"><div class="text-truncate">';
			activeSessionDivs += activeSession.customer.fullName;
			activeSessionDivs += '</div><div class="small text-truncate overflow-hidden text-black-50 last-msg">';
			activeSessionDivs += activeSession.message;
			activeSessionDivs += '</div></div><span class="ml-auto mb-auto"><div class="text-right text-muted pt-1 small last-time">';
			activeSessionDivs += moment(activeSession.createdAt).format('h:mm:ss');
			activeSessionDivs += '</div></span></div>';
		})
		$('#chat-list').html(activeSessionDivs);
		$('.ui-post-message').click(function(){
			$('#selectedName').html($(this).attr('data-name'));
			let sessionId = $(this).attr('id');
			$("#ui-chat-box").animate({scrollTop : 5000}, 'fast')
			if(sessionId != activeChatId) {
				if(activeChatId) {
					$(`#${activeChatId}`).css('background-color','');
				}
				activeChatId = sessionId;
				$(`#${sessionId}`).css('background-color','#f8f9fa');
				fetchSessionMessages(user ? user.id : '', sessionId)
			}
		});  
	}

	async function fetchSessionMessages(userId, sessionId) {
		const url = `/api/v1/web/session/${sessionId}/messages`;
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				'x-user-id' : userId || '1hj6k4u00000000'
			},
		});
		var data = await response.json();
		if(data.data) {
			populateSessionMessages(data.data);
		}
	}

	function populateChat(chat) {
		let chatFormat = "";
		chatFormat += '<div class="text-center my-3"><span class="px-3 py-2 small bg-white shadow-sm  rounded">';
		chatFormat += moment(chat.createdAt).format('ll');
		chatFormat += '</span></div><div class="d-flex align-items-center ui-post-header">';
		chatFormat += '<div class="mr-1"><div class="text-truncate h6 mb-3">';
		chatFormat += chat.sender.fullName;
		chatFormat += '</div><p>';
		chatFormat += chat.content;
		chatFormat += '</p></div><span class="ml-auto mb-auto"><div class="text-right text-muted pt-1 small">';
		chatFormat += moment(chat.createdAt).format('h:mm:ss');;
		chatFormat += '</div></span></div>';
		return chatFormat;
	} 

	function populateSessionMessages(sessionMessages) {
		chatResponse = sessionMessages;
		let chatFormat = "";
		chatResponse.forEach((chat)=>{
			chatFormat += populateChat(chat);
		});
		$('#ui-chat-box').html(chatFormat);
	}
});