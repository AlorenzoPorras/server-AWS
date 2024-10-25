// Función para obtener la IP pública del cliente
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error al obtener la dirección IP:', error);
        return null;
    }
}

// Generar un token aleatorio para id_device
function generateRandomToken() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

// Función para enviar los datos a la API
async function sendData(status) {
    const ip_client = await getClientIP();
    const name = 'Control de Movimientos';
    const id_device = generateRandomToken();
    const currentDate = new Date().toISOString();

    if (!ip_client) {
        alert('No se pudo obtener la IP del cliente.');
        return;
    }

    const data = {
        id: '',
        name: name,
        ip_client: ip_client,
        status: status,
        date: currentDate,
        id_device: id_device
    };

    console.log('Enviando datos:', JSON.stringify(data));

    try {
        const response = await fetch('http://3.85.22.105:5000/iot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const result = await response.json();
        console.log('Respuesta del servidor:', result);
        obtenerHistorial();  // Actualizar el historial después de enviar los datos
    } catch (error) {
        console.error('Error al enviar los datos:', error);
    }
}

// Función para obtener el historial de acciones
async function obtenerHistorial() {
    try {
        const response = await fetch('http://3.85.22.105:5000/iot');
        console.log('Respuesta sin procesar:', response);
        
        if (!response.ok) {
            throw new Error('Error al obtener el historial');
        }

        // Obtener la respuesta como texto crudo
        const responseData = await response.text();
        console.log('Datos de la respuesta:', responseData);
        
        // Intentar convertir la respuesta a JSON
        let data;
        try {
            data = JSON.parse(responseData);
        } catch (error) {
            console.error('Error al parsear los datos como JSON:', error);
            return;
        }

        // Continuar con el procesamiento de la tabla si el JSON es válido
        const tablaHistorial = document.getElementById('tabla-historial');
        if (!tablaHistorial) {
            throw new Error('No se encontró el elemento de tabla para historial.');
        }

        const tbody = tablaHistorial;
        tbody.innerHTML = ''; // Limpiar la tabla antes de actualizarla

        if (!Array.isArray(data)) {
            console.error('Formato de datos no esperado:', data);
            alert('Error al obtener el historial de acciones.');
            return;
        }

        // Agregar los datos a la tabla
        data.forEach(registro => {
            const fila = `
                <tr>
                    <td>${registro.id}</td>
                    <td>${registro.name}</td>
                    <td>${registro.status}</td>
                    <td>${registro.ip_client || 'N/A'}</td>
                    <td>${registro.id_device || 'N/A'}</td>
                    <td>${new Date(registro.create_time).toUTCString() || 'N/A'}</td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', fila);
        });
    } catch (error) {
        console.error('Error al obtener el historial:', error);
    }
}

// Asegúrate de que el DOM esté cargado antes de ejecutar los scripts
document.addEventListener('DOMContentLoaded', () => {
    // Manejadores de eventos para los botones
    document.getElementById('up').addEventListener('click', () => sendData(1));
    document.getElementById('down').addEventListener('click', () => sendData(2));
    document.getElementById('left').addEventListener('click', () => sendData(3));
    document.getElementById('right').addEventListener('click', () => sendData(4));
    document.getElementById('up-left').addEventListener('click', () => sendData(5));
    document.getElementById('up-right').addEventListener('click', () => sendData(6));
    document.getElementById('stop').addEventListener('click', () => sendData(0));

    // Manejador para actualizar el historial
    document.getElementById('refresh').addEventListener('click', obtenerHistorial);

    // Cargar historial automáticamente al cargar la página
    obtenerHistorial();
});
