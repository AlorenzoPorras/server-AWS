import pymysql

def get_connection():
    return pymysql.connect(
        host='instancia-db-iot.cxc4sq0666t5.us-east-1.rds.amazonaws.com',  # Tu endpoint de RDS
        user='admin',  # Reemplazado con tu usuario de la base de datos
        password='Admin12345#!',  # Reemplazado con tu contraseña
        db='db_iot',  # Nombre de tu base de datos
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
