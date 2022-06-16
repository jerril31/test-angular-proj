window.addEventListener('load', (event) => {
    var checks = [
        /[\?|&|#]code=/,
        /[\?|&|#]error=/,
        /[\?|&|#]token=/,
        /[\?|&|#]id_token=/
      ];

      var message = isResponse(location.hash)
        ? location.hash
        : '#' + location.search;
    
      if (window.parent && window.parent !== window) {
          console.log("Silent Refresh 1a..");
          // if loaded as an iframe during silent refresh
          window.parent.postMessage(message, location.origin);
      } else if (window.opener && window.opener !== window) {
          console.log("Silent Refresh 2a..");
          // if loaded as a popup during initial login
          window.opener.postMessage(message, location.origin);
      } else {
          console.log("Silent Refresh 3a..");
          // last resort for a popup which has been through redirects and can't use window.opener
          localStorage.setItem('auth_hash', message);
          localStorage.removeItem('auth_hash');
      }
});

function isResponse(str) {
    if (!str) return false;
    for (var i = 0; i < checks.length; i++) {
      if (str.match(checks[i])) return true;
    }
    return false;
  }


