import os
from flask import Flask, jsonify

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///:memory:')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify({'users': []})

if __name__ == '__main__':
    app.run(debug=True)
