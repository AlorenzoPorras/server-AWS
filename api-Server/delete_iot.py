# delete_iot.py
from flask import request, jsonify
from database import get_connection

def delete_iot():
    data = request.json
    record_id = data.get('id')

    if not record_id:
        return jsonify({'error': 'El campo "id" es requerido'}), 400

    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            sql = "DELETE FROM IoTCarStatus WHERE id = %s"
            cursor.execute(sql, (record_id,))
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Registro no encontrado'}), 404

        return jsonify({'message': 'Registro eliminado exitosamente'}), 200
    finally:
        connection.close()
