"""
Service Layer
"""

import os
import uuid
from flask import Request, jsonify, Response
from pypinyin import lazy_pinyin
from werkzeug.utils import secure_filename
from loguru import logger
from .lodis import LocalDist
from .models import AskQuestionRequest
from .agent import get_agent

kvstore = LocalDist()


def handle_upload(request: Request):
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
    file_path = os.path.join("uploads/", safe_filename)
    try:
        file.save(file_path)
        kvstore.put_file_path(str(uid), file_path)
        print(f"Put {file.filename} to ./uploads/{safe_filename}")
        return jsonify({"fid": str(uid)}), 201
    except (FileNotFoundError, IOError, OSError) as e:
        logger.error(f"File operation error: {e}")
        return jsonify({"error": "file operation error"}), 500


def handle_stream(request: Request):
    try:
        data = AskQuestionRequest(**request.get_json())
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    question = data.question
    session_id = data.sid
    logger.info(f"Ask with session id {session_id}")
    agent, session_id = get_agent(session_id)
    fid = data.fid
    if fid:
        # augmented with file
        logger.info(f"Ask with fid {fid}")
        file_path = kvstore.get_file_path(fid)
        agent.augmented_with(file_path)
    page_number = data.pageNumber
    if page_number:
        agent.focus_on_page(page_number)
    selected_snippets = data.selectedSnippets
    if selected_snippets:
        agent.selected_snippets(selected_snippets)
    logger.info("Selected snippets: ", selected_snippets)

    def generate_response():
        for word in agent.stream(question):
            yield word

    return Response(generate_response(), content_type="text/event-stream"), 200
