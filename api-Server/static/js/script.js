// Diccionario para almacenar tokens asociados a cada IP
const ipTokens = {};

// Función para generar un token aleatorio
function generateRandomToken() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 16; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
}

// Función para obtener la IP del cliente o usar una predeterminada en caso de error
function obtenerIPCliente() {
    return new Promise(function (resolve, reject) {
        fetch('https://ipinfo.io/json?token=<YOUR_TOKEN>')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta de IPinfo');
                }
                return response.json();
            })
            .then(data => {
                console.log('IP obtenida desde la API IPinfo:', data.ip);
                resolve(data.ip);
            })
            .catch(error => {
                console.error('Error obteniendo la IP (IPinfo):', error);
                fetch('https://api64.ipify.org?format=json')
                    .then(response => response.json())
                    .then(data => {
                        console.log('IP obtenida desde la API alternativa:', data.ip);
                        resolve(data.ip);
                    })
                    .catch(error => {
                        console.error('Error obteniendo la IP (alternativa):', error);
                        resolve('0.0.0.0');
                    });
            });
    });
}

// Función para obtener el token de un IP o crear uno nuevo si no existe
function obtenerTokenPorIP(ip) {
    if (!ipTokens[ip]) {
        ipTokens[ip] = generateRandomToken(); // Asigna un nuevo token si no existe uno para esta IP
    }
    return ipTokens[ip];
}

// Función para enviar los datos a la API
function sendData(status, actionName) {
    obtenerIPCliente().then(function (ip_client) {
        const id_device = obtenerTokenPorIP(ip_client); // Obtener el token asociado a la IP
        const currentDate = new Date().toISOString();

        const data = {
            id: '',
            name: actionName,
            ip_cliente: ip_client,
            status: status,
            date: currentDate,
            id_device: id_device
        };

        console.log('Enviando datos:', JSON.stringify(data));

        const request = new XMLHttpRequest();
        request.open('POST', 'http://54.210.130.245:5000/iot', true);
        request.setRequestHeader('Content-Type', 'application/json');

        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                console.log('Datos enviados exitosamente');
                obtenerHistorial(true); // Refrescar el historial automáticamente al enviar datos
            } else {
                console.error('Error en la respuesta del servidor');
            }
        };

        request.onerror = function () {
            console.error('Error al enviar los datos');
        };

        request.send(JSON.stringify(data));
    });
}

// Función para obtener el historial de acciones (para index.html y monitor.html)
function obtenerHistorial(esMonitor) {
    const request = new XMLHttpRequest();
    request.open('GET', 'http://54.210.130.245:5000/iot', true);

    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            const data = JSON.parse(this.responseText);

            if (esMonitor) {
                const tablaMonitor = document.getElementById('tabla-monitor');
                tablaMonitor.innerHTML = ''; // Limpiar tabla

                const ultimosDiez = data.slice(-10).reverse();  // Los últimos 10 registros, invertidos

                ultimosDiez.forEach((registro, index) => {
                    const fila = `
                        <tr ${index === 0 ? 'style="background-color: lightgreen;"' : ''}>
                            <td>${registro.id}</td>
                            <td>${registro.name}</td>
                            <td>${registro.status}</td>
                            <td>${registro.ip_cliente || 'N/A'}</td>
                            <td>${registro.id_device || 'N/A'}</td>
                            <td>${new Date(registro.create_time).toUTCString() || 'N/A'}</td>
                        </tr>
                    `;
                    tablaMonitor.insertAdjacentHTML('beforeend', fila);
                });

            } else {
                const tablaHistorial = document.getElementById('tabla-historial');
                tablaHistorial.innerHTML = `
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Acción</th>
                            <th>Status</th>
                            <th>IP Cliente</th>
                            <th>Dispositivo</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `; // Definir encabezados

                const ultimoRegistro = data[data.length - 1];  // Solo el último registro

                if (ultimoRegistro) {
                    const fila = `
                        <tr style="background-color: yellow;">
                            <td>${ultimoRegistro.id}</td>
                            <td>${ultimoRegistro.name}</td>
                            <td>${ultimoRegistro.status}</td>
                            <td>${ultimoRegistro.ip_cliente || 'N/A'}</td>
                            <td>${ultimoRegistro.id_device || 'N/A'}</td>
                            <td>${new Date(ultimoRegistro.create_time).toUTCString() || 'N/A'}</td>
                        </tr>
                    `;
                    tablaHistorial.querySelector('tbody').insertAdjacentHTML('beforeend', fila);
                }
            }
        } else {
            console.error('Error al obtener el historial');
        }
    };

    request.onerror = function () {
        console.error('Error en la conexión');
    };

    request.send();
}

// Función para refrescar automáticamente la tabla de monitoreo cada segundo
function iniciarMonitoreoAutomatico() {
    setInterval(() => {
        obtenerHistorial(true); // Actualizar el historial en la sección de monitoreo
    }, 1000); // Intervalo de 1 segundo
}

// Manejadores de eventos para los botones de control
document.addEventListener('DOMContentLoaded', () => {
    const buttons = [
        { id: 'up', action: () => sendData(1, 'Arriba') },
        { id: 'down', action: () => sendData(2, 'Abajo') },
        { id: 'left', action: () => sendData(3, 'Izquierda') },
        { id: 'right', action: () => sendData(4, 'Derecha') },
        { id: 'rotate-90-left', action: () => sendData(5, 'Girar 90° Izquierda') },
        { id: 'rotate-90-right', action: () => sendData(6, 'Girar 90° Derecha') },
        { id: 'rotate-180', action: () => sendData(7, 'Girar 180°') },
        { id: 'rotate-360', action: () => sendData(8, 'Girar 360°') },
        { id: 'stop', action: () => sendData(0, 'STOP') },
        { id: 'refresh', action: () => obtenerHistorial(false) }
    ];

    buttons.forEach(({ id, action }) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', action);
        }
    });

    if (document.getElementById('tabla-historial')) {
        obtenerHistorial(false);
    } else if (document.getElementById('tabla-monitor')) {
        iniciarMonitoreoAutomatico(); // Iniciar monitoreo automático si es la tabla de monitoreo
    }
});
