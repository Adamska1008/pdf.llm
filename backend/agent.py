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


class RagChatBot:
    """
    The AI model which make full use of rag
    """

    def __init__(self) -> None:
        self._augmented_with: str | None = None
        self._msgs: list[BaseMessage] = []
        self._rag_usermsg_prompt = PromptTemplate.from_template(
            "Solve the following question based on the retrievaled context"
            "Question: {question}"
            "Context: {context}"
        )
        self._prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessage(""),
                MessagesPlaceholder(variable_name="chat_history"),
                ("user", "{input}"),
            ]
        )
        self._llm = ChatOpenAI()
        self._str_parser = StrOutputParser()
        self._retriever = None
        self._vectorstore = None

    @property
    def _chain(self):
        return self._prompt | self._llm | self._str_parser

    def augmented_with(self, file_path: str) -> None:
        """ """
        if self._augmented_with == file_path:  # only initialized once
            return
        loader = PyPDFLoader(file_path)
        pages = [page for page in loader.load()]

        self._vectorstore = InMemoryVectorStore.from_documents(
            pages, OpenAIEmbeddings()
        )

    def ask(self, question: str) -> str:
        if self._augmented_with is None:
            resp = self._chain.invoke({"chat_history": self._msgs, "input": question})
        else:
            docs = self._vectorstore.similarity_search(question, k=5)
            rag_input = self._rag_usermsg_prompt.format(question=question, context=docs)
            resp = self._chain.invoke({"chat_history": self._msgs, "input": rag_input})
        self._msgs.extend([HumanMessage(question), AIMessage(resp)])
        return resp


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
    print(agent.ask("Hello, my name is Adam"))
    print(agent.ask("What is my name?"))
    print(agent.ask("what is 2 + 2 = ?"))
