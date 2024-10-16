import os
import uuid
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pypinyin import lazy_pinyin
from .agent import get_agent
from .lodis import LocalDist

app = Flask(__name__)
CORS(app)
kvstore = LocalDist()

UPLOAD_FOLDER = "uploads/"
ALLOWED_EXTENSIONS = {"pdf"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename: str):
    return "." in filename and filename.split(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/api/ping", methods=["GET"])
def ping():
    """
    Just make sure the network works.
    """
    return jsonify({"ping": "pong"})


@app.route("/api/upload/pdf", methods=["PUT"])
def upload_pdf():
    """
    Upload a pdf file

    Response:
        - fid (str): uid of the file
        - error (str): error msg when error occurs
    """
    if "file" not in request.files:
        return jsonify({"error": "no file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "no selected file"}), 400
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "only pdf files are allowed"}), 400

    uid = uuid.uuid1()
    safe_filename = secure_filename("".join(lazy_pinyin(file.filename)))
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], safe_filename)
    try:
        file.save(file_path)
        kvstore.put_file_path(str(uid), file_path)
        print(f"Put {file.filename} to ./uploads/{safe_filename}")
        return jsonify({"fid": str(uid)}), 201
    except Exception as e:
        app.logger.error(str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/get_pdf/<fid>")
def uploaded_file(fid: str):
    filename = kvstore.get_file_path(fid)
    if not filename:
        return jsonify({"message": "file id not found"}), 404
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    if not os.path.exists(file_path):
        return jsonify({"message": "file not found"}), 404
    return send_file(file_path, mimetype="application/pdf")


@app.route("/api/ask", methods=["POST"])
def ask_question():
    # TODO: use stream api
    """
    Ask question based on the pdf or not.

    Json Body should contains:
     - required:
        - question (str): a question that user provide

     - optional:
        - fid (str): the uid of file to be retrieved. If not given, will not use rag.
        - sid (str): the session id. If not given, will create a new one and respond with it.
        - pageNumber (int)
        - selectedText (string)

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
    print(f"Ask with session id {session_id}")
    agent, session_id = get_agent(session_id)
    fid: str | None = data.get("fid")
    if fid is not None:
        print(f"Ask with fid {fid}")
        file_path = kvstore.get_file_path(fid)
        agent.augmented_with(file_path)
    page_number: int | None = data.get("pageNumber")
    if page_number:
        agent.focus_on_page(page_number)
    selected_snippets = data.get("selectedText")
    if selected_snippets:
        agent.selected_snippets(selected_snippets)
    response = agent.ask(question)
    return jsonify({"ai_message": response, "sid": session_id}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
