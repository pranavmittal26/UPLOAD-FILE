const fs = require('fs');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
var files = {},
    struct = {
        name: null,
        type: null,
        size: 0,
        data: [],
        slice: 0,
    };
io.on('connection', (socket)=>{
socket.on('upload', (data) => {
    if (!files[data.name]) {
        files[data.name] = Object.assign({}, struct, data);
        files[data.name].data = [];
    }
    data.data = new Buffer(new Uint8Array(data.data));
    files[data.name].data.push(data.data);
    files[data.name].slice++;

    if (files[data.name].slice * 100000 >= files[data.name].size) {
        socket.emit('end');
    } else {
        socket.emit('get_file', {
            currentSlice: files[data.name].slice
        });
    }
    if (files[data.name].slice * 100000 >= files[data.name].size) {
        var fileBuffer = Buffer.concat(files[data.name].data);
       
        fs.writeFile('./upload/' +data.name,fileBuffer,(err)=>{
          delete files[data.name]; 
        if (err) return socket.emit('upload error');
      socket.emit('upload_completed')
    });
    }
});
})
http.listen(4000, () => {
  console.log('listening on *:4000');
});
