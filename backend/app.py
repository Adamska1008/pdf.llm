import os
import uuid
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from pypdf import PdfReader
from werkzeug.utils import secure_filename
from pypinyin import lazy_pinyin
from .kvstore import GlobalKVStore
from .agent import get_agent

app = Flask(__name__)
CORS(app)
kvstore = GlobalKVStore()


@app.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"ping": "pong"})


@app.route("/api/upload/pdf", methods=["PUT"])
def upload_pdf():
    """
    Upload a pdf file

    Response:
        - fuid (str): uid of the file
        - error: error msg when error occurs
    """
    if "file" not in request.files:
        return jsonify({"error": "no file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "no selected file"}), 400
    print("The original file name is " + file.filename)
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "only pdf files are allowed"}), 400

    uid = uuid.uuid1()
    safe_filename = secure_filename(''.join(lazy_pinyin(file.filename)))
    if not os.path.exists("./uploads"):
        os.makedirs("./uploads")
    file_path = os.path.join("./uploads", safe_filename)
    try:
        file.save(file_path)
        kvstore.put_file_path(str(uid), file_path)
        app.logger.info(f"file {file.filename} has been saved to {file_path}")
        return jsonify({"fuid": str(uid)}), 201
    except Exception as e:
        app.logger.error(str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/ask", methods=["POST"])
def ask_question():
    # TODO: use stream api
    """
    Ask question based on the pdf or not.

    Json Body should contains:
     - required:
        - question (str): a question that user provide

     - optional:
        - fuid (str): the uid of file to be retrieved. If not given, will not use rag.
        - sid (str): the session id. If not given, will create a new one and respond with it.

    Response:
        - ai_message (str): ai message
        - sid (str) : session id given or generated
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "no dataprovided"}), 400

    question: str | None = data.get("question")
    if not question:
        return jsonify({"error": "question is required"}), 400

    session_id: str | None = data.get("sid")
    agent, session_id = get_agent(session_id)
    fuid: str | None = data.get("fuid")
    if fuid is not None:
        file_path = kvstore.get_file_path(fuid)
        reader = PdfReader(file_path)
        docs = [page.extract_text() for page in reader.pages]
        agent.augmented_with(docs, file_path)

    response = agent.ask(question)
    return jsonify({"ai_message": response, "sid": session_id}), 200
