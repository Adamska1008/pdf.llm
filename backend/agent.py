"""
Codes related to agent.
Currently the module and only this module depends on langchain.
"""

import uuid
from typing import Tuple
from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import (
    ChatPromptTemplate,
    PromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, BaseMessage
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.callbacks import get_openai_callback
from loguru import logger
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


class RagChatBot:
    """
    The AI model which make full use of rag
    """

    class RagPromptBuilder:
        def __init__(
            self,
            question: str,
            page_number: str | None = None,
            selected_text: list[str] | None = None,
            context: str | None = None,
            pages: list[Document] | None = None,
        ):
            if not question:
                assert "prompt must require a question"
            self._question = question
            self._page_number = page_number
            self._selected_text = selected_text
            self._context = context
            self._pages = pages

        def build(self) -> str:
            res = self._question
            if self._page_number:
                if not self._pages:
                    assert "requires pages info, but not provided"
                page_number = self._page_number
                res += f"\n用户正在看{page_number}页，该页的内容为：\n{self._pages[page_number-1]}\n"
            if self._selected_text:
                res += f"用户引用了文本：{self._selected_text}\n"
            if self._context:
                res += f"相关上下文：{self._context}"
            return res

    def __init__(self) -> None:
        self._augmented_with: str | None = None
        self._msgs: list[BaseMessage] = []
        # self._rag_usermsg_prompt = PromptTemplate.from_template(
        #     "根据提供的问题，解决用户提出的问题。\n"
        #     "问题: {question}"
        #     "用户正在看第{page_number}页，请从第{page_number}页上寻找相关信息。"
        #     "用户选中了文本，如下所示：\n{selected_text}\n请在解决问题时参考这一部分的内容。"
        #     "上下文：{context}"
        # )
        self._prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessage(""),
                MessagesPlaceholder(variable_name="chat_history"),
                ("user", "{input}"),
            ]
        )
        self._llm = ChatOpenAI()
        self._str_parser = StrOutputParser()
        self._vectorstore = None
        self._page_number = None
        self._selected_snippets = None
        self._pages = None

    @property
    def _chain(self):
        return self._prompt | self._llm | self._str_parser

    def augmented_with(self, file_path: str) -> None:
        """ """
        if self._augmented_with == file_path:  # only initialized once
            return
        self._augmented_with = file_path
        loader = PyPDFLoader(file_path)
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        pages = [page for page in loader.load()]
        self._pages = pages
        blocks = text_splitter.split_documents(pages)
        self._vectorstore = InMemoryVectorStore.from_documents(
            blocks, OpenAIEmbeddings()
        )

    def focus_on_page(self, page_number: int):
        self._page_number = page_number

    def selected_snippets(self, _selected_snippets: str):
        self._selected_snippets = _selected_snippets

    @property
    def selected_text(self):
        """
        combine the selected snippets to a single text
        """
        if not self._selected_snippets:
            return None
        res = ""
        for index, snippet in enumerate(self._selected_snippets):
            res += f"第{index}段文本：\n{snippet}\n"
        return res

    def _generate_input(self, question: str) -> str:
        if self._augmented_with is None:
            return question
        else:
            # retrieve docs
            if self.selected_text:
                question_with_selected_text = question + self.selected_text
                docs = self._vectorstore.similarity_search(
                    question_with_selected_text, k=3
                )
            else:
                docs = self._vectorstore.similarity_search(question, k=3)
            # build `input`
            return self.RagPromptBuilder(
                question=question,
                page_number=self._page_number,
                selected_text=self.selected_text,
                context=docs,
                pages=self._pages,
            ).build()

    def ask(self, question: str) -> str:
        inp = self._generate_input(question)
        resp = self._chain.invoke({"chat_history": self._msgs, "input": inp})
        self._msgs.extend([HumanMessage(inp), AIMessage(resp)])
        return resp

    def stream(self, question: str):
        msg = ""
        inp = self._generate_input(question)
        logger.info(f"Input:\n{inp}")
        with get_openai_callback() as cb:
            resp = self._chain.stream({"chat_history": self._msgs, "input": inp})
            for word in resp:
                msg += word
                yield word
            logger.info(cb)
        self._msgs.extend([HumanMessage(question), AIMessage(msg)])


agents_pool: dict[str, RagChatBot] = {}


def get_agent(session_id: str | None = None) -> Tuple[RagChatBot, str]:
    if session_id is None:
        session_id = str(uuid.uuid1())
        agents_pool[session_id] = RagChatBot()
    elif session_id is not None and agents_pool.get(session_id) is None:
        raise RuntimeError("Invalid session_id")
    return agents_pool[session_id], session_id


# unit test
if __name__ == "__main__":
    agent, sid = get_agent()
    for word in agent.stream("Create a poem about recursion in programming"):
        print(word, sep="", end="")
