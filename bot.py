import asyncio
import logging
import os
import random
import string
import sys
import threading

from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    InlineQuery,
    InlineQueryResultCachedPhoto,
    InlineQueryResultPhoto,
    InputTextMessageContent,
    LinkPreviewOptions,
    Message,
)
from dotenv import load_dotenv

from api import get_lobby_url

load_dotenv()

bot = Bot(os.getenv("API_TOKEN"))
dp = Dispatcher()
wb_app_url = "t.me/dishdash_bot/main_site"


@dp.inline_query(F.query == "start")
async def show_inline_menu(inline_query: InlineQuery):
    url = get_lobby_url(59.957441, 30.308091)
    await inline_query.answer(
        [
            InlineQueryResultCachedPhoto(
                type="photo",
                photo_file_id="AgACAgIAAxkBAAM2ZkvEXswqVpcUzF1xU-gPypbTCU8AAs3ZMRu0wmFKp-1fNEa-3gIBAAMCAANzAAM1BA",
                id="".join(random.choices(string.ascii_letters + string.digits, k=10)),
                input_message_content=InputTextMessageContent(
                    link_preview_options=LinkPreviewOptions(url="https://dishdash.ru"),
                    message_text="Подключайтесь с друзьями в лобби и выбирайте места!",
                ),
                reply_markup=InlineKeyboardMarkup(
                    inline_keyboard=[
                        [
                            InlineKeyboardButton(
                                text="Лобби",
                                url=url,
                            ),
                            InlineKeyboardButton(
                                text="Приложение",
                                url=wb_app_url,
                            ),
                        ]
                    ]
                ),
            )
        ],
        cache_time=1,
    )


@dp.message()
async def all(message: Message):
    # print(message)
    await message.answer("Не знаю что ответить")


async def polling_main() -> None:
    await dp.start_polling(bot)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)

    try:
        asyncio.run(polling_main())
    except (KeyboardInterrupt, SystemExit):
        logging.info("Bot stopped!")
