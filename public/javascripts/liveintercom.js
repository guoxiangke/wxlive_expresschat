$( document ).ready(function() {
  var pathArray = window.location.pathname.split( '/' );
  var socket = io('/liveintercom');
  // var socket = io('/'+pathArray[2]);//tell Socket.IO client to connect to that namespace:
  var roomID = pathArray[2];
  // socket.emit('subscribe');
  var $messageForm  = $('#messageForm');
  var $message  = $('#message');
  var $chat  = $('#chat');
  var $userForm = $('#userForm');
  // var $chatPage = $('#chatPage');
  // var $loginPage = $('#loginPage');
  var $username = $('#username');
  var $users = $('#users');
  var username;
  var $typingDiv = $('#typingDiv');
  var typing = false;
  var lastTypingTime;
  var TYPING_TIMER_LENGTH = 400; // ms
  var $window = $(window);
  var $inputMessage = $message;
  var $inputUsername = $username;

  var c_name = getCookie('username');

  socket.on('history',function(data){
    addChatHistory(data);//add remote message!
      if(c_name){
        $('#user_named_join_promo').hide();
        user_named_join_promo(c_name);
      }
  });

  if(c_name){
    $('#message').prop('disabled', false).attr('placeholder','键入文字');
    setUsername(c_name);
    if($('#user_named_join_promo').is(":visible")){
        $('#user_named_join_promo').hide();
        user_named_join_promo(c_name);
    }
  }else{
    // socket.emit('subscribe',{"room" : roomID});
  }





  //auto login with username
  // if(username){
  //     setUsername (username);
  // }

  $(window).on('beforeunload', function(){
    if(username){
      socket.emit('unsubscribe',{"room" : roomID, 'username':username});
    }else{
      socket.emit('unsubscribe',{"room" : roomID});
    }
    return '确定离开吗？';
  });
  //use login page input username
  $userForm.submit(function(e){
    e.preventDefault();
    setUsername ();
  });
  // Sets the client's username
  function setUsername (name=false) {
    username = name?name:cleanInput($inputUsername.val().trim());
    $('#message').prop('disabled', false).attr('placeholder','键入文字');
    setCookie('username',username,365);
    // Tell the server your username
    // var nav ={
    //   'appCodeName':navigator.appCodeName,
    //   'appName':navigator.appName,
    //   'appVersion':navigator.appVersion,
    //   'platform':navigator.platform,
    //   'product':navigator.product,
    //   'productSub':navigator.productSub,
    //   'vendor':navigator.vendor,
    //   'language':navigator.language,
    //   'userAgent':navigator.userAgent
    // }
    socket.emit('subscribe', {'username':username,'room': roomID});
    socket.emit('user join', {'username':username,'room': roomID}, function(data){//,'navigator':nav
      if(data){
        // $loginPage.hide();
        // $chatPage.show();//disabled input!!
        $inputMessage.focus();
      }
    });
    $inputUsername.val('');
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  $messageForm.submit(function(e){
    e.preventDefault();
    sendMessage();
  });

  //changed depend on UI
  $('.intercom-composer-send-button').click(function(){
    sendMessage();
  });

 function sendMessage(){
    var new_message = cleanInput($inputMessage.val().trim());
    if(new_message){//todo check!
      socket.emit('send message', new_message);
      $inputMessage.val('').focus();
      addLocalMessage(new_message);
      scrollBottom();
    }
 }
  function addLocalMessage(new_message){
    $chat.append('<div class="intercom-conversation-part intercom-conversation-part-user intercom-conversation-part-last"><div class="intercom-comment-container intercom-comment-container-user"><div class="intercom-comment"><div class="intercom-blocks"><div class="intercom-block intercom-block-paragraph"><p>'+new_message+'</p></div></div></div></div><span><div class="intercom-conversation-part-metadata">已发送</div></span></div>');
  }


  function addChatHistory(data){
    for (var i = data.length - 1; i >= 0; i--) {
      var val = data[i];
      $chat.append('<div class="intercom-conversation-part intercom-conversation-part-admin"><div class="intercom-comment-container intercom-comment-container-admin"><div class="intercom-comment-container-admin-avatar"><paper-avatar class="paper-avatar-mini paper-avatar-history" icon="social:person-outline"  label="'+val.NickName.charAt(0).toUpperCase()+'"></paper-avatar></div><div class="intercom-comment"><div class="intercom-blocks"><div class="intercom-block intercom-block-paragraph">'+val.message+'</div></div></div></div><span><div class="intercom-conversation-part-metadata">'+val.NickName+'</div></span></div>');
    }
  }


  // Whenever the server emits 'new message', update the chat body
  socket.on('new message',function(data){
    // console.log('new message',data);
    addChatMessage(data);//add remote message!
  });


  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // $chat.append('<div class="well"><strong>'+data.username+':</strong>'+data.message+'</div>');
    $chat.append('<div class="intercom-conversation-part intercom-conversation-part-admin"><div class="intercom-comment-container intercom-comment-container-admin"><div class="intercom-comment-container-admin-avatar"><paper-avatar class="paper-avatar-mini" icon="social:person-outline"  label="'+data.username.charAt(0).toUpperCase()+'"></paper-avatar></div><div class="intercom-comment"><div class="intercom-blocks"><div class="intercom-block intercom-block-paragraph">'+data.message+'</div></div></div></div><span><div class="intercom-conversation-part-metadata">'+data.username+'</div></span></div>');
    var height_of_mainwindow = $(window).height()- $('.intercom-conversation-body-profile').height() - 55;
    if($('.intercom-conversation-part:last').offset().top-height_of_mainwindow<600){//+N*50
      scrollBottom();
    }else{
      new_message_promotion();
    }
  }

  function new_message_promotion(){
    $('#player').append('<div id="new_promotion">您有新消息，点击查看</div>');
    $('#new_promotion').bind('click',function(){
      $(this).fadeOut('fast');
      scrollBottom();
    });
    setTimeout(function(){
      $('#new_promotion').fadeOut('slow',function(){$(this).remove()});
    }, 7000);
  }

  //get all users

  socket.on('users init', function(data){
    uses_update(data);
  });
  //TODO append!!!
  socket.on('users update', function(data){
    uses_update(data);
  });

  function uses_update(data){
    $('#users_count').text(data.length);
    var html = '';
    var avatar_html='';
    for (var i = data.length - 1; i >= 0; i--) {
      html += '<li class="list-group-item userli" data-username='+ data[i].username +'>'+ data[i].username +'</li>';
      avatar_html +='<div class="intercom-team-profile-full-avatar"><div class="intercom-avatar"><paper-avatar class="paper-avatar-mini" icon="social:person-outline"  label="'+ data[i].username.charAt(0).toUpperCase()+'"></paper-avatar></div></div>'
    }
    $users.html(html);
    $('#users-avatar').html(avatar_html);
  }


  // Keyboard events begin
  // Updates the typing event
  function updateTyping () {
    if (username) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }else{
        // console.log('stoptyping1');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  $inputMessage.on('input', function() {
    if(username)
      updateTyping();
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    // console.log('typing',data);
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    // console.log('stop typing',data);
    removeChatTyping(data);
  });

 // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = ' 正在输入...';
    $chat.append('<div class="intercom-typing-admin typing" data-username="'+data.username+'"><div class="intercom-typing-admin-avatar"><div class="intercom-avatar"><paper-avatar class="paper-avatar-mini" icon="social:person-outline"  label="'+data.username.charAt(0).toUpperCase()+'"></paper-avatar></div></div><div class="intercom-typing-admin-bubble"><div class="intercom-typing-admin-dot-1"></div><div class="intercom-typing-admin-dot-2"></div><div class="intercom-typing-admin-dot-3"></div></div></div>');

  }
  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing').filter(function () {
      return $(this).data('username').toString() === data.username.toString();
    });
  }

  // Initialize variables
  $window.keydown(function (event) {
    if (username) {
      // Auto-focus the current input when a key is typed
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $inputMessage.focus();
      }
      // When the client hits ENTER on their keyboard
      if (event.which === 13) {
          event.preventDefault();
          sendMessage();
          socket.emit('stop typing');
          typing = false;
      }
    }else{
      if (event.which === 13) {
          event.preventDefault();
          if($inputUsername.val().length !== 0){
            $('.intercom-notification-channels-input-submit-container').trigger('click');
          }
      }
    }
  });

  // Keyboard events end

  //TODO: reconnect with cookie name:
  //http://stackoverflow.com/questions/4432271/node-js-and-socket-io-how-to-reconnect-as-soon-as-disconnect-happens


});
