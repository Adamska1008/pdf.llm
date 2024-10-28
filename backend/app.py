from flask import Flask
from flask_cors import CORS
from .config import Config
from .routes import api_blueprint


app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
app.register_blueprint(api_blueprint, url_prefix="/api")
