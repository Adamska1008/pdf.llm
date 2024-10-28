from pydantic import BaseModel, Field
from typing import Optional


class AskQuestionRequest(BaseModel):
    """
    arguments of /api/ask
    """

    question: str = Field(..., description="The question to be asked")
    fid: Optional[str] = Field(None, description="The file ID to be retrieved")
    sid: Optional[str] = Field(None, description="The session ID")
    pageNumber: Optional[int] = Field(None, description="Page number of focusing")
    selectedSnippets: Optional[list[str]] = Field(
        None, description="Selected Snippets from the document"
    )
