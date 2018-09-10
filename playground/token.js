token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjjYjVmZTE4NjI0MzUzMDZhY2I0OGIiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTMyODAyNTU4fQ.45Te1omezgxpJu9Vo_WM370VHLQEH-cToh0OipK82aA';

let people = {
  tokens : [
    {
      "access" : "auth",
      "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjVjYjVmZTE4NjI0MzUzMDZhY2I0OGIiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTMyODAyNTU4fQ.45Te1omezgxpJu9Vo_WM370VHLQEH-cToh0OipK82aA"
  },
  {
    "access" : "auth",
    "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjVjYjVmZTE4NjI0MzUzMDZhY2I0OGIiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTMyODAyNTczfQ.__aczAyKizZkP-d91DLkrMZeFEDOdEEyZjohhGI7_mE"
},
  ]
}

let result = people.tokens.filter((elements) => elements.token === token);
if(people.tokens.filter((elements) => elements.token === token).length > 0){
  console.log(`token is valid`)
}else{
  console.log(`Invalid Token`)
}