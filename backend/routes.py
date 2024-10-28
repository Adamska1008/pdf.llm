from flask import Blueprint, jsonify, request
from .services import handle_upload, handle_stream

api_blueprint = Blueprint("api", __name__)


@api_blueprint.route("/ping", methods=["GET"])
def ping():
    """
    ping service, used to check network connection
    """
    return jsonify({"ping": "pong"})


@api_blueprint.route("/upload/pdf", methods=["PUT"])
def upload_pdf():
    """
    forward to file upload handle
    """
    return handle_upload(request)


@api_blueprint.route("/stream", methods=["POST"])
def ask_question():
    """
    forward to ask handle
    """
    return handle_stream(request)
