console.log("me.js has connected");
const serverAddress = "https://sleepy-citadel-66405.herokuapp.com";
document.querySelector("#nav-logo").addEventListener("click", function(e) {
  location.assign(`${serverAddress}/login`);
});
