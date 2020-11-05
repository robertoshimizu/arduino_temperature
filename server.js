const http = require("http")
const express = require("express")

// Constants
const PORT = 3010
const HOST = "0.0.0.0"

// App
const app = express()
const server = http.createServer(app)

// SerialPort
const SerialPort = require("serialport")
const Readline = require("@serialport/parser-readline")

const port = new SerialPort("/dev/ttyACM0", {
  autoOpen: false,
})

const parser = new Readline()

port.open(function (err) {
  if (err) {
    return console.log("Error opening port: ", err.message)
  }
  // Feche o console do Arduino IDE para liberar o SerialPort

  // Because there's no callback to write, write errors will be emitted on the port:
  port.write("main screen turn on")
})

port.on("open", function () {
  console.log("serial port opened")
})

// Read data that is available but keep the stream in "paused mode"
// port.on("readable", function () {
//   console.log("Data:", port.read())
// })


app.engine("ejs", require("ejs").__express)
app.set("view engine", "ejs")
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

// Socket
// The data is passed to the front end using the socket.io function emit;
// The data from the Arduino is going to be used to update a web page.

const io = require("socket.io")(server)




io.on("connection", (socket) => {
  console.log("socket.io connection")
  // Switches the port into "flowing mode"
  port.pipe(parser)
    parser.on("data", function (data) {
        arraia = data.split(';')
        var temperatura = arraia[1]
        
    socket.emit("arduino", temperatura)
    console.log(temperatura)
    
  })
  
  // socket.on("data", (data) => {
  //   data = data.trim()
    
  //   console.log('To no socket' + data)
  // })
  // socket.on('Arduino Data', (data) => {
  //   console.log(data)
  // })
  
  
  // socket.on("disconnect", () => {
  //   console.log("disconnected")
  // })
})
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
