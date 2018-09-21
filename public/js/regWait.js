console.log("me.js has connected");
const serverAddress = "http://localhost:3000";
document.querySelector("#nav-logo").addEventListener("click", function(e) {
  location.assign(`${serverAddress}/login`);
});
