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
            "根据提供的问题，解决用户提出的问题。"
            "问题: {question}"
            "用户正在看第{page_number}页，请从第{page_number}页上寻找相关信息。"
            "用户选中了文本，如下所示：\n{selected_text}\n请在解决问题时参考这一部分的内容。"
            "上下文：{context}"
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
        self._vectorstore = None
        self._page_number = None
        self._selected_snippets = None

    @property
    def _chain(self):
        return self._prompt | self._llm | self._str_parser

    def augmented_with(self, file_path: str) -> None:
        """ """
        if self._augmented_with == file_path:  # only initialized once
            return
        self._augmented_with = file_path
        loader = PyPDFLoader(file_path)
        pages = [page for page in loader.load()]

        self._vectorstore = InMemoryVectorStore.from_documents(
            pages, OpenAIEmbeddings()
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

    def ask(self, question: str) -> str:
        if self._augmented_with is None:
            resp = self._chain.invoke({"chat_history": self._msgs, "input": question})
            self._msgs.extend([HumanMessage(question), AIMessage(resp)])
        else:
            question = (
                question
                if self.selected_text is None
                else question + self.selected_text
            )
            docs = self._vectorstore.similarity_search(question, k=2)
            rag_input = self._rag_usermsg_prompt.format(
                question=question,
                context=docs,
                page_number=self._page_number,
                selected_text=self.selected_text,
            )
            resp = self._chain.invoke({"chat_history": self._msgs, "input": rag_input})
            self._msgs.extend([HumanMessage(rag_input), AIMessage(resp)])
        return resp

    def stream(self, question: str):
        msg = ""
        if self._augmented_with is None:
            resp = self._chain.stream({"chat_history": self._msgs, "input": question})
            for word in resp:
                msg += word
                yield word
            self._msgs.extend([HumanMessage(question), AIMessage(msg)])
        else:
            question = (
                question
                if self.selected_text is None
                else question + self.selected_text
            )
            docs = self._vectorstore.similarity_search(question, k=2)
            rag_input = self._rag_usermsg_prompt.format(
                question=question,
                context=docs,
                page_number=self._page_number,
                selected_text=self.selected_text,
            )
            resp = self._chain.stream({"chat_history": self._msgs, "input": rag_input})
            for word in resp:
                msg += word
                yield word
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
    # print(agent.ask("Hello, my name is Adam"))
    # print(agent.ask("What is my name?"))
    # print(agent.ask("what is 2 + 2 = ?"))
    for word in agent.stream("Create a poem about recursion in programming"):
        print(word, sep="" ,end="")
