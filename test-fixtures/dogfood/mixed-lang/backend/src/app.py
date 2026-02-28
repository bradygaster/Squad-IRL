from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/data')
def get_data():
    return jsonify({'data': []})

if __name__ == '__main__':
    app.run(debug=True)
