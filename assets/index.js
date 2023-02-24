const chartCanvas = document.querySelector("#chart");
const btnSet = document.querySelector("#set-btn");
const btnOn = document.querySelector("#on-btn");
const btnOff = document.querySelector("#off-btn");
const tempRange = document.querySelector("#temp-range");

const btnConectar = document.querySelector("#mqtt-login");

tempRange.addEventListener("input", updateTempLabel);
btnSet.addEventListener("click", setTemperature);
btnOn.addEventListener("click", () => {
  setStatus(true);
});
btnOff.addEventListener("click", () => {
  setStatus(false);
});

btnConectar.addEventListener("click", connectMQTT);

const data = {
  datasets: [
    {
      label: "Grafico de temple",
      data: [
        // { x: 0, y: 20 },
        // { x: 10, y: 800 },
        // { x: 30, y: 900 },
        // { x: 60, y: 1000 },
        // { x: 180, y: 1100 },
        // { x: 300, y: 1200 },
        // { x: 420, y: 1300 },
        // { x: 540, y: 1400 },
        // { x: 660, y: 1500 },
        // { x: 780, y: 1600 },
        // { x: 900, y: 1600 },
        // { x: 960, y: 1500 },
        // { x: 1020, y: 1400 },
        // { x: 1080, y: 1300 },
        // { x: 1140, y: 1200 },
        // { x: 1200, y: 1100 },
        // { x: 1260, y: 1000 },
        // { x: 1320, y: 900 },
        // { x: 1380, y: 800 },
        // { x: 1440, y: 700 },
        // { x: 1500, y: 600 },
        // { x: 1560, y: 500 },
        // { x: 1620, y: 400 },
        // { x: 1680, y: 300 },
        // { x: 1740, y: 200 },
        // { x: 1800, y: 100 },
        // { x: 1860, y: 50 },
        // { x: 1920, y: 20 },
        // { x: 2000, y: 20 },
      ],
      backgroundColor: "rgb(255, 99, 132)",
      borderColor: "rgb(255, 99, 132)",
      pointRadius: 0,
    },
  ],
};

const config = {
  type: "scatter",
  data: data,
  options: {
    showLine: true,
    tension: 0.1,
    scales: {
      x: {
        type: "time",
        unit: "millisecond",
        time: {
          displayFormats: {
            second: "hh:mm:ss",
          },
        },
        min: Date.now(),
      },
      y: {
        min: 0,
        max: 1600,
        // Configuración del eje Y
      },
    },
  },
};

const myChart = new Chart(chartCanvas, config);

const options = {
  connectTimeout: 4000,
  clientId:
    "oven-webapp-" +
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .toUpperCase(),
  keepalive: 60,
  clean: true,
};

let client;
// Connection
const WebSocket_URL = "wss://sochoag.com:8084/mqtt";

function connectMQTT() {
  if (client?.connected) {
    disconnectMQTT();
    btnConectar.innerHTML = "Iniciar sesión";
    return;
  }
  let username = document.getElementById("username");
  let password = document.getElementById("password");
  options.username = username.value;
  options.password = password.value;
  client = mqtt.connect(WebSocket_URL, options);
  client.on("connect", () => {
    client.subscribe("oven/temp/sens", function (err) {
      if (!err) {
        // alert("Conexión MQTT exitosa 😎");
        username.disabled = true;
        password.disabled = true;
        tempRange.disabled = false;
        btnOff.disabled = false;
        btnOn.disabled = false;
        btnSet.disabled = false;
        btnConectar.innerHTML = "Desconectar";
        updateChartConfig(myChart, Date.now());
      }
    });
  });

  client.on("error", () => {
    // alert("Error al conectar MQTT 😥");
    password.value = "";
    client.end();
    return;
  });

  client.on("reconnect", (error) => {
    console.log("reconnecting:", error);
  });

  client.on("message", function (topic, message) {
    if (topic == "oven/temp/sens") {
      const received = JSON.parse(message.toString());
      // console.log(received.temp);
      const toUpdate = {
        x: Date.now(),
        y: received.temp,
      };
      // console.log(toUpdate);
      scrollData(myChart, "Grafico de temple");
      addData(myChart, "Grafico de temple", toUpdate);
    } else {
      console.log("No se reconoce acciones para el topico:" + topic);
    }
  });
}

function disconnectMQTT() {
  client.end();
  username.disabled = false;
  password.disabled = false;
  tempRange.disabled = true;
  btnOff.disabled = true;
  btnOn.disabled = true;
  btnSet.disabled = true;
  // alert("Desconectado de MQTT 😥");
}

function setTemperature() {
  const tempVal = tempRange.value;
  const toSend = {
    temp: parseInt(tempVal),
  };
  console.log(toSend);
  client.publish("oven/control/actdata", JSON.stringify(toSend));
  // alert("Temperatura cambiada correctamente ✔");
}

function setStatus(value) {
  const toSend = {
    status: value,
  };
  console.log(toSend);
  client.publish("oven/control/actdata", JSON.stringify(toSend));
  // alert("Estado cambiada correctamente ✔");
}

function updateTempLabel() {
  // console.log(tempRange.value);
  document.querySelector("#temp-range-value").innerText = tempRange.value;
}

function addData(chart, label, data) {
  chart.data.labels.push(label);
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(data);
  });
  chart.update();
}

function scrollData(chart, label) {
  chart.data.labels.push(label);
  chart.data.datasets.forEach((dataset) => {
    if (dataset.data.length > 15) {
      dataset.data.splice(0, 1);
      updateChartConfig(chart, dataset.data[1].x);
    }
  });
}

function updateChartConfig(chart, val) {
  chart.options.scales.x.min = val;
  chart.update();
}
