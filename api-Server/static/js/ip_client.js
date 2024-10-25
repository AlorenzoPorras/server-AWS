export function getClientIP() {
    return fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            console.log('La dirección IP pública del usuario es:', data.ip);
            return data.ip;
        })
        .catch(error => {
            console.error('Error al obtener la dirección IP:', error);
            return null;
        });
}
