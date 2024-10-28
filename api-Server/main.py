from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from create_iot import create_iot
from read_iot import read_iot
from update_iot import update_iot
from delete_iot import delete_iot

app = Flask(__name__)
CORS(app)

# Ruta para servir el archivo HTML (la página principal)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/monitor')
def monitor():
    return render_template('monitor.html')

@app.route('/iot', methods=['POST'])
def create():
    # Esta es la función para la creación de la acción en la base de datos
    data = request.get_json()
    print('Datos recibidos:', data)  # Verificar los datos recibidos en la consola del servidor
    return create_iot()

@app.route('/iot', methods=['GET'])
def read():
    return read_iot()

@app.route('/iot', methods=['PUT'])
def update():
    return update_iot()

@app.route('/iot', methods=['DELETE'])
def delete():
    return delete_iot()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
