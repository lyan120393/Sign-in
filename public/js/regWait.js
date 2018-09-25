console.log("me.js has connected");
document.querySelector("#nav-logo").addEventListener("click", function(e) {
  location.assign(`${serverAddress}/login`);
});
