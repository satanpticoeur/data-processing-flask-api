from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

from utils import clean_file, get_extension

app = Flask(__name__)
app.secret_key = '192b9bdd22ab9ed4d12e236c78afcb9a393ec15f71bbf5dc987d54727823bcbf'
app.config['ALLOWED_FILE_EXTENSIONS'] = ['.csv', '.json', '.xml']
app.config['ALLOWED_FILE_SIZE'] = 1024 * 1024 * 2  # 2 MB
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = app.config['ALLOWED_FILE_SIZE']

CORS(app)  # Autorise les requêtes depuis le frontend


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    if not file or file.filename == '':
        return jsonify({'success': False, 'message': 'Aucun fichier sélectionné'}), 400

    file_extension = get_extension(file.filename)
    if file_extension not in app.config['ALLOWED_FILE_EXTENSIONS']:
        return jsonify({'success': False, 'message': 'Format non supporté'}), 400

    if file.content_length and file.content_length > app.config['ALLOWED_FILE_SIZE']:
        return jsonify({'success': False, 'message': 'Le fichier dépasse la taille autorisée'}), 400

    cleaned_data = clean_file(file)
    if cleaned_data:
        return jsonify({'success': True, 'message': 'Fichier traité avec succès', 'file': cleaned_data}), 200

    else:
        return jsonify({'success': False, 'message': 'Erreur lors du traitement'}), 400


if __name__ == '__main__':
    app.run(debug=True)
