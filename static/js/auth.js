function handleResponse (response) {
  let contentType = response.headers.get('content-type')
  if (contentType.includes('application/json')) {
    return handleJSONResponse(response)
  } else if (contentType.includes('text/html')) {
    return handleTextResponse(response)
  } else {
    // Other response types as necessary. I haven't found a need for them yet though.
    throw new Error(`Sorry, content-type ${contentType} not supported`)
  }
}

function handleJSONResponse (response) {
  return response.json()
    .then(json => {
      if (response.ok) {
        console.log("response was ok");
        return json
      } 
      else {
        console.log("response was bad");
        return Promise.reject(
            Object.assign(
                {}, 
                { "responseBody": json }, 
                {
                  "status": response.status,
                  "statusText": response.statusText
                }
            )
        )
      }
    })
}

var authenticationHandler = function(options){
 
    /*
     * Variables accessible
     * in the class
     */
    var vars = {
        baseAuthUrl  : ""
    };
 
    /*
     * Can access this.method
     * inside other methods using
     * root.method()
     */
    var root = this;
 
    /*
     * Constructor
     */
    this.construct = function(options){
        $.extend(vars , options);
    };
 

    this.login = function(){
        url = buildAuthEndpoint("/auth/login");
        payload = {
            "email": $('#email').val(),
            "password": $('#password').val()
        }

        // call out to the endpoint to log in
        fetch(
            url, 
            {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                method: 'post', 
                body: JSON.stringify(payload)
            })
        .then(handleResponse)
        .then(data => logUserIn(data))
        .catch(error => displayLoginErrors(error.responseBody))
    }

    this.logout = function(){
        // delete the session
        localStorage.removeItem('token');

        // refresh the page
        location.reload(true);
    }

    var buildAuthEndpoint = function(path) {
      return vars.baseAuthUrl + path;
    }

    var logUserIn = function(data){
        console.log("log user in");
        storeSession(data);
    }

    var displayLoginErrors = function(messages){
        console.log("login error", messages);
        console.log("display errors");

        if (messages){

            // clear the validation states
            $('#password').removeClass("is-invalid");
            $('#email').removeClass("is-invalid");
            $('.invalid-feedback').remove();

            $('#loginForm').addClass("was-validated");


            $.each(messages, function (i, msg)
            {
                error_message = $('<div>');
                error_message.addClass("invalid-feedback");
                error_message.text(msg['message']);

                field = msg['field'];

                if (field == "password"){
                    $('#password').after(error_message);
                    $('#password').addClass("is-invalid");
                }
                else if (field == "email"){
                    $('#email').after(error_message);
                    $('#email').addClass("is-invalid");
                }
            });
        }
    }

    var storeSession = function(session){
        console.log("store login session token");

        // store in the session with the token and expiration
        localStorage.setItem('token', JSON.stringify(session));


        // redirect the page to the admin portal (user is now logged in)
        var url = "/admin/";    
        $(location).attr('href',url);
    }

    var getSession = function(){
        token = JSON.parse(localStorage.getItem("token"));

        return token;
    }


    /*
     * Pass options when class instantiated
     */
    this.construct(options);
 
};

