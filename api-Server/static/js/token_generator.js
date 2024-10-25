// token_generator.js (Simulación de token para frontend)
function generarTokenSimulado() {
    const header = {
        "alg": "HS256",
        "typ": "AWS"
    };
    const payload = {
        "userId": 123,
        "username": "usuario",
        "exp": Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
    };

    const base64UrlEncode = (obj) => {
        return btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    };

    const headerEncoded = base64UrlEncode(header);
    const payloadEncoded = base64UrlEncode(payload);
    const token = `${headerEncoded}.${payloadEncoded}.firmaSimulada`;

    console.log('Token simulado generado:', token);
    document.getElementById('token-placeholder').textContent = token; // Muestra el token en algún lugar
    return token;
}

// Llama esta función al cargar la página
document.addEventListener('DOMContentLoaded', generarTokenSimulado);
