import sys
import logging
import re
from flask import Flask, request
from flask_cors import CORS
from loguru import logger
from .config import Config
from .routes import api_blueprint


logger.remove()
logger.add(sys.stdout)


class WerkzeugInterceptHandler(logging.Handler):
    def emit(self, record):
        message = record.getMessage()
        # 正则提取请求方法和路径信息
        match = re.search(
            r'"(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD) (.*?) (HTTP/\d.\d)" (\d{3})',
            message,
        )
        if match:
            method, path, http_version, status_code = match.groups()
            logger.info(f"{method} {path} {http_version} {status_code}")
        else:
            logger.info(record.getMessage())


app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
app.register_blueprint(api_blueprint, url_prefix="/api")
logging.getLogger("werkzeug").handlers = [WerkzeugInterceptHandler()]
