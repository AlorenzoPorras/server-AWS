// ip_client.js
export function getClientIP() {
    return fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => data.ip)
        .catch(error => {
            console.error('Error obteniendo la IP:', error);
            return null;
        });
}
