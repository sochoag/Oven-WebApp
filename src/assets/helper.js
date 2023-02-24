const btnFake = document.querySelector("#fake-btn");

let flag = false;

btnFake.addEventListener("click", () => {
  if (!flag) {
    flag = true;
    helper();
    btnFake.innerHTML = "Detener";
    return;
  }
  clearInterval(intervalo);
  btnFake.innerHTML = "Fake";
  flag = false;
});

const optionsHelper = {
  connectTimeout: 4000,
  clientId:
    "oven-esp32-" +
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .toUpperCase(),
  keepalive: 60,
  clean: true,
};

let clientHelper;
let freq = 3000;
// Connection
// const WebSocket_URL = "wss://sochoag.com:8084/mqtt";

function connectMQTT() {
  return new Promise((resolve, reject) => {
    optionsHelper.username = "oven-esp32";
    optionsHelper.password = "10101011";
    clientHelper = mqtt.connect(WebSocket_URL, optionsHelper);
    // console.log("Connecting!");
    clientHelper.on("connect", () => {
      clientHelper.subscribe("oven/temp/sens", function (err) {
        if (!err) {
          console.log("Connected!");
          resolve("Connected");
        } else {
          reject("Error");
        }
      });
    });
  });
}

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function publishData() {
  const toSend = {
    temp: randomIntFromInterval(20, 1500),
  };
  clientHelper.publish("oven/temp/sens", JSON.stringify(toSend));
  // console.log(toSend);
}

let intervalo;

async function helper() {
  console.log("Inicio");
  if (!clientHelper?.connected) {
    await connectMQTT();
  }
  if (clientHelper.connected) {
    intervalo = setInterval(publishData, freq);
  }
}

function cambiarIntervalo(nuevoIntervalo) {
  clearInterval(intervalo); // Detenemos el intervalo actual
  intervalo = setInterval(publishData, nuevoIntervalo); // Creamos un nuevo intervalo con el nuevo tiempo
}
