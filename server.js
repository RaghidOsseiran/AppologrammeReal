const { Client } = require('pg');
const fs = require('fs');
const http = require('http');
const port = 8080;
const host = 'localhost';


const server = http.createServer();

const client = new Client({
  user: 'postgres',
  password: 'Hunterxhunter04', 
  database: 'appologram',
  port: 5432
});



client.connect()
.then(() => {
    console.log('Connected to database');
})
.catch((erreur) => {
    console.log('Erorr connecting to database');
});



server.on ("request", async (req,res) => {
  if (req.url.startsWith('/public/')){
    try{
      const fichier = fs.readFileSync("."+req.url);
      res.end(fichier);
    } catch(err){
      console.log("Error, we couldnt find the ressource in public");
      res.end(err);
    }

  } else if (req.url === ("/") || req.url.startsWith("/index") || req.url === ("/images")){
    res.end(fs.readFileSync("./public/index.html"));

  } else if (req.method === "POST" && req.url === '/register-successful' ){
    let pageRes = `<!DOCTYPE HTML><html><body><a href="/public/index.html"><button>Back to page</button></a><p>You have registered successfully!</p></body></html>`;
    let data;
    req.on('data', (dataChunk) => {
      data += dataChunk.toString();
    })
    req.on('end', async ()=>{
      const dataSplit = data.split('&');
      const userReg = dataSplit[0].split('=')[1];
      const passReg = dataSplit[1].split('=')[1];
      const queryVal = await client.query("Select count(*) from utilisateurs where username = '"+userReg+"'");
      const queryValidation = parseInt(queryVal.rows.map(row => row.count));
      console.log(queryValidation);
      if (queryValidation >= 1){
        let pageRes2 = `<!DOCTYPE HTML><html><body><a href="/public/index.html"><button>Back to page</button></a><p>There is already a user with the same name, register failed.</p></body></html>`;
        res.end(pageRes2);
      } else {
        const queryValid = "Insert into utilisateurs (username, pass) Values ('"+userReg+"','"+passReg+"')";
        client.query(queryValid);
        res.end(pageRes);
      }
    })

  } else if (req.method === 'POST' && req.url === '/login-successful'){
    let pageLog = `<!DOCTYPE HTML>
    <html>
      <body>
        <a href="/public/index.html"><button>Back to page</button></a>`;
    let data2;
    req.on('data', (dataChunk) => {
      data2 += dataChunk.toString();
    })
    req.on('end', async ()=>{
      const dataSplit = data2.split('&');
      const userLog = dataSplit[0].split('=')[1];
      const passLog = dataSplit[1].split('=')[1];

      const queryVal = await client.query("Select Exists(Select * from utilisateurs where username= '"+userLog+"' and pass = '"+passLog+"' )");
      const queryValidation = queryVal.rows.map(row => row.exists);
      console.log(queryValidation.toString());

      if (queryValidation.toString() === ('false')){
        let pageLog2 = `<!DOCTYPE HTML><html><body><a href="/public/index.html"><button>Back to page</button></a><p>Account does not exist, please register before logging in.</p><a href='/public/register.html'><button>Click here to register!</button></a></body></html>`;
        res.end(pageLog2);
      } else {
        pageLog += `<a href="/user/`+userLog/*.replace("user","")*/+`"><p>Logged in as user: ${userLog}</p></a></body></html>`;
        res.end(pageLog);
      }
  })

  } else if (req.url.startsWith('/user/') && req.method === 'GET'){
    const userName = (req.url.split('/')[2]);
    const userID = (userName.replace("user",""));
    console.log(userID);

    const queryPath = await client.query("select file_path from images as i cross join utilisateurs as u where u.username = i.username_fk and u.username = 'user"+userID+"'");
    const queryPathRes = queryPath.rows.map(row => row.file_path);
    console.log(queryPathRes);

    let pageUser = `<!DOCTYPE HTML><html><head><link rel="stylesheet" href="/public/images.css"></head>`;
    pageUser += `<body>`;
    pageUser += `<a href="/public/index.html"><button>Logout</button></a>`
    pageUser += `<span><button>Add an image</button></span>`;

    const pp = await client.query("Select pp from utilisateurs where username = '"+userName+"'");
    const ppRes = pp.rows.map(row => row.pp);

    pageUser += '<img style="display:block; text-align:center;margin:auto; width: 100px; height:100px;border: solid black; border-radius: 40px; margin-bottom: 20px;" src="'+ppRes+'">';
    pageUser += '<div class="container">';
        
    for(let i = 0; i < queryPathRes.length; i++){
      pageUser += '<div class="item"><img class="omak" src='+queryPathRes[i]+'><div class="like"><a href="/liked/'+userName+'"><button id="like-button"><img class="image-inlike" src="/public/Joah.jpg"></button></a></div></div>';
    }
    pageUser += '</div><p style="font-size: 0px;" id="user-id">'+userName+'</p>'
    pageUser += `<script src="/public/test.js"></script>`;
    pageUser += '</body></html>';
    res.end(pageUser);


  } else if (req.method === 'POST' && req.url.startsWith('/user/')){
    const userID = (req.url.split('/')[2]);
    console.log(userID);
    let data3;
    req.on('data', (dataChunk) =>{
      data3 += dataChunk.toString();
    });
    req.on("end", async () =>{
      let pageUser = `<!DOCTYPE HTML><html><head><link rel="stylesheet" href="/public/images.css"></head>`;
      pageUser += `<body>`;
      pageUser += `<a href="/public/index.html"><button>Logout</button></a>`
      pageUser += `<span><button>Add an image</button></span>`;

      const pp = await client.query("Select pp from utilisateurs where username = '"+userID+"'");
      const ppRes = pp.rows.map(row => row.pp);

      pageUser += '<img style="display:block; text-align:center;margin:auto; width: 100px; height:100px;border: solid black; border-radius: 40px; margin-bottom: 20px;" src="'+ppRes+'">';
      pageUser += '<div class="container">';
      const imageNb = data3.split('=')[1];
      console.log(imageNb);
      const verifyEx = await client.query("Select count(*) from images as i cross join utilisateurs as u where file_path = '/public/image"+imageNb+".jpg' and i.username_fk = u.username and u.username = '"+userID+"'")
      const verifyExRes = parseInt(verifyEx.rows.map(row => row.count));
      if (verifyExRes < 1){
        const queryImgVal = client.query("Insert into images (file_path,username_fk) Values('/public/image"+imageNb+".jpg','"+userID+"')");
        console.log("info sent");
        const queryPath = await client.query("select file_path from images as i cross join utilisateurs as u where u.username = i.username_fk and u.username = '"+userID+"'");
        const queryPathRes = queryPath.rows.map(row => row.file_path);
        console.log(queryPathRes);
        for(let i = 0; i < queryPathRes.length; i++){
          pageUser += '<div class="item"><img class="omak" src='+queryPathRes[i]+'><div class="like"><a href="/liked/'+userID+'"><button id="like-button"><img class="image-inlike" src="/public/Joah.jpg"></button></a></div></div>';
        }
        pageUser += '</div><p style="font-size: 0px;" id="user-id">'+userID+'</p>'
        pageUser += `<script src="/public/test.js"></script>`;
        pageUser += '</body></html>';
        res.end(pageUser);
      } else {
        const queryPath = await client.query("select file_path from images as i cross join utilisateurs as u where u.username = i.username_fk and u.username = '"+userID+"'");
        const queryPathRes = queryPath.rows.map(row => row.file_path);
        for(let i = 0; i < queryPathRes.length; i++){
          pageUser += '<div class="item"><img class="omak" src='+queryPathRes[i]+'><div class="like"><a href="/liked/'+userID+'"><button id="like-button"><img class="image-inlike" src="/public/Joah.jpg"></button></a></div></div>';
        }
        pageUser += '</div><p style="color:red;">Image already posted</p>';
        pageUser += '<p style="font-size: 0px;" id="user-id">'+userID+'</p>'
        pageUser += `<script src="/public/test.js"></script>`;
        pageUser += '</body></html>';
        res.end(pageUser);
      }
     
    })
   
  } else if (req.url.startsWith('/liked')){
    const userName = req.url.split('/')[2];
    const userID = userName.replace("user","");
    console.log(userName);
    console.log(userID);

    const sqlQuery = "SELECT id FROM images where id"
  }
});


/*Select count(*) from likes as l cross join utilisateurs as u cross join images as i where l.username_fk = u.username and l.image_fk = i.id and username= 'user2' and file_path = '/public/image1.jpg';*/

server.listen(port, host, () => {
  console.log("Server is running");
});
