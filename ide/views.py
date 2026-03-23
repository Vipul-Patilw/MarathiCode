import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .marathi_interpreter import run_marathi_code

def index(request):
    return render(request, 'ide/index.html')

@csrf_exempt
def run_code(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            code         = data.get('code', '')
            input_values = data.get('inputs', None)   # list of strings or None
            result = run_marathi_code(code, input_values)
            return JsonResponse(result)
        except Exception as e:
            return JsonResponse({
                'output': '', 'error': str(e),
                'success': False, 'needs_input': False, 'input_prompts': []
            })
    return JsonResponse({'error': 'POST method required'}, status=405)
