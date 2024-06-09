import json
from django.http import JsonResponse, StreamingHttpResponse, FileResponse
from django .views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import requests
from bs4 import BeautifulSoup
import tempfile
from urllib.error import HTTPError, URLError

def getData(url):
    try:
        response = requests.get(url)
        response.raise_for_status()

        return response
    except:
        return JsonResponse({
            'error': 'Указанные URL не валидный'
        },
        status=404)

def findContentByText(response, text):
    try:
        soup = BeautifulSoup(response.text, 'html.parser')
        text_blocks = soup.find_all(text=True)

        def check_text(current):
            return text in current.text
        
        filtered_blocks = filter(check_text, text_blocks)

        with open("result.txt", "w") as file:
            file.write("")

        with open("result.txt", "a") as file:
            for block in filtered_blocks:
                file.write(block.text + "\n")

        return FileResponse(open("result.txt", "rb"))
    except AttributeError as e:
        return JsonResponse({
            'error': 'Вы пытаетесь парсить XML-документ, содержащий ошибки синтаксиса'
        },
        status=404)
    
def findContentByClass(response, className, tag):
    try:
        soup = BeautifulSoup(response.text, 'html.parser')
        elements = soup.find_all(tag, className)

        print(elements)

        with open("result.txt", "w") as file:
            file.write("")

        with open("result.txt", "a") as file:
            for block in elements:
                file.write(block.text + "\n")

        return FileResponse(open("result.txt", "rb"))
    except AttributeError as e:
        return JsonResponse({
            'error': 'Вы пытаетесь парсить XML-документ, содержащий ошибки синтаксиса'
        },
        status=404)

def findAllContent(response):
    try:
        soup = BeautifulSoup(response.text, 'html.parser')

        with open("result.txt", "w") as file:
            file.write(str(soup))

        return FileResponse(open("result.txt", "rb"))
    except AttributeError as e:
        return JsonResponse({
            'error': 'Вы пытаетесь парсить XML-документ, содержащий ошибки синтаксиса'
        },
        status=404)

@csrf_exempt
@require_http_methods(["POST"])
def parse_data(request):
    try:
        received_data = json.loads(request.body)
        parseResponse = getData(received_data['url'])

        if (received_data['parseRule'] == 'text' and received_data['textRule']):
            return findContentByText(parseResponse, received_data['textRule'])
        
        if (received_data['parseRule'] == 'class' and received_data['classRule'] and received_data['tagRule']):
            return findContentByClass(parseResponse, received_data['classRule'], received_data['tagRule'])
        
        return findAllContent(parseResponse)
    except requests.exceptions.RequestException as e:
        return JsonResponse({
            'error': 'Указанные URL не валидный'
        },
        status=404)
    except HTTPError as hp:
        return JsonResponse({
            'error': 'Запрашиваемый ресурс не существует или недоступен'
        },
        status=404)
    except URLError as ue:
        return JsonResponse({
            'error': 'Указанный URL неверен или не существует'
        },
        status=404)