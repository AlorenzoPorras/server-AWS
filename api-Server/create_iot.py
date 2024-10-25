# create_iot.py
from flask import request, jsonify
from database import get_connection

def create_iot():
    data = request.json
    status = data.get('status')
    ip_cliente = data.get('ip_cliente')
    name = data.get('name')
    id_device = data.get('id_device')

    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "INSERT INTO IoTCarStatus (status, ip_cliente, name, id_device) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (status, ip_cliente, name, id_device))
        connection.commit()
        return jsonify({'message': 'Registro creado exitosamente'}), 201
    finally:
        connection.close()
