"""
App config
"""

import os


class Config:
    UPLOAD_FOLDER = "uploads/"
    ALLOWED_EXTENSIONS = {"pdf"}
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
