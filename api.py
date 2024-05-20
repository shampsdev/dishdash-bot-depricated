import json

import requests


def get_lobby_url(latitude, longitude):
    """
    Отправляет POST-запрос к API dishdash.ru/api/v1/lobby с заданными координатами.
    Возвращает URL для перехода на страницу swipe или сообщение об ошибке.

    Параметры:
    latitude (float): Широта для запроса.
    longitude (float): Долгота для запроса.

    Возвращает:
    str: URL или сообщение об ошибке.
    """
    url = "https://dishdash.ru/api/v1/lobby"
    location_data = json.dumps({"lat": latitude, "lng": longitude})

    data = {"location": location_data}

    response = requests.post(url, json=data)

    if response.status_code == 201:
        response_data = response.json()
        lobby_id = response_data.get("id")
        if lobby_id is not None:
            return f"https://dishdash.ru/swipe/{lobby_id}"
        else:
            return "ID не найден в ответе API."
    else:
        return f"Ошибка запроса: {response.status_code}"
