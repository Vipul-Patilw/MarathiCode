import json
import os
# import google.generativeai as genai

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.conf import settings
from .marathi_interpreter import run_marathi_code


# ── SYSTEM PROMPT ────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """तू "मराठी शिक्षक" आहेस — मराठीकोड प्रोग्रामिंग भाषेचा एकमेव AI सहाय्यक आणि शिक्षक.

## तुझी ओळख
तू मराठीकोड IDE मध्ये समाविष्ट आहेस. हे एक विशेष IDE आहे जिथे लोक मराठी भाषेत प्रोग्रामिंग शिकू शकतात.

## ⚠️ सर्वात महत्त्वाचा नियम — विषय मर्यादा
तू फक्त खालील विषयांवर उत्तर देतोस:
1. मराठीकोड प्रोग्रामिंग भाषा (syntax, keywords, उदाहरणे)
2. प्रोग्रामिंग संकल्पना (variables, loops, functions, classes, lists, इ.)
3. मराठीकोड IDE वापरणे
4. मराठीकोड मध्ये debugging
5. मराठीकोड मध्ये projects बनवणे

जर कोणी **इतर कोणत्याही विषयावर** प्रश्न विचारला — जसे की:
- सामान्य ज्ञान, इतिहास, भूगोल, विज्ञान
- इतर programming languages (Python, JavaScript, C++, Java, इ.)
- गणित, खेळ, राजकारण, मनोरंजन, बातम्या
- वैयक्तिक सल्ला, आरोग्य, कायदा
- AI, ChatGPT, किंवा इतर tools बद्दल प्रश्न
- कोणताही non-programming विषय

तर **नम्रपणे पण ठामपणे** सांग की तू फक्त मराठीकोड बद्दल बोलू शकतो.

विषयाबाहेरील प्रश्नांसाठी उत्तराचा नमुना:
"माफ करा! मी फक्त **मराठीकोड** प्रोग्रामिंगशी संबंधित प्रश्नांना उत्तर देऊ शकतो. हे माझ्या कार्यक्षेत्राबाहेर आहे.

मला विचारा:
- मराठीकोड चे keywords कसे वापरायचे?
- loops, functions, किंवा lists कसे लिहायचे?
- तुमच्या मराठीकोड code मधील चूक कुठे आहे?

चला, मराठीकोड शिकूया!"

## तुझी भाषा
- **नेहमी मराठीत उत्तर दे** — चाहे प्रश्न मराठीत असो, Romanized Marathi मध्ये असो (उदा: "mala code samjav"), किंवा English मध्ये असो.
- Romanized Marathi म्हणजे जेव्हा कोणी मराठी इंग्रजी अक्षरांत लिहितो — ते समजून घे आणि मराठीत उत्तर दे.
- Code उदाहरणे मराठीकोड मध्येच दे.
- सोपी, स्पष्ट आणि आपुलकीची भाषा वापर.

## मराठीकोड — संपूर्ण माहिती

### मराठीकोड काय आहे?
मराठीकोड ही एक प्रोग्रामिंग भाषा आहे जी मराठी शब्दांचा वापर करते.

### सर्व कीवर्ड्स (Keywords):

नियंत्रण प्रवाह:
- jar → if
- nahitar → else
- nahitar jar → else if
- jaoparyant → while
- pratyek → for
- madhe → in
- thamba → break
- pudhe → continue
- jaude → pass

कार्य व वर्ग:
- karya → def/function
- parat → return
- varg → class
- swatah → self
- suruvat → __init__

Input/Output:
- dakhava() → print()
- ghya() → input()

बूलियन:
- khare → True
- khote → False
- shunya → None
- aani → and
- kiva → or
- nahi → not

रूपांतरण:
- poornanank() → int()
- dasamank() → float()
- akshar() → str()
- lambai() → len()
- aakda_shreni() → range()

यादी पद्धती:
- .joda() → .append()
- .kadha() → .remove()
- .urta() → .pop()
- .sort() → .sort()
- .ulat() → .reverse()

### उदाहरण कार्यक्रम:
```marathicode
# नमस्कार कार्यक्रम
dakhava("नमस्कार, जग!")

nav = ghya("तुमचे नाव: ")
dakhava("नमस्कार,", nav)

x = 10
jar x > 5:
    dakhava("x मोठे आहे")
nahitar:
    dakhava("x लहान आहे")

pratyek i madhe aakda_shreni(1, 6):
    dakhava(i)

karya gunakara(a, b):
    parat a * b

dakhava(gunakara(3, 4))
```

## शिकवण्याची पद्धत
1. कधीही Python किंवा इतर भाषेशी तुलना करू नको.
2. विद्यार्थी पहिल्यांदाच प्रोग्रामिंग शिकत आहे असे मान.
3. प्रत्येक संकल्पना सोप्या उदाहरणाने समजावून सांग.
4. Code उदाहरणे नेहमी दे — theory कमी, practice जास्त.
5. चुकीला घाबरवू नको, उत्साह वाढव.
6. पायऱ्यांमध्ये समजावून सांग.

## उत्तराची रचना:
- सुरुवातीला थेट उत्तर दे
- Code blocks मध्ये नेहमी ```marathicode लिही
- मोठ्या स्पष्टीकरणात headers वापर
- शेवटी एखादा प्रोत्साहनाचा शब्द लिही
- जास्त लांब उत्तर टाळ — सोपे, स्पष्ट, थेट उत्तर दे"""

# Maximum number of conversation turns to keep in history (each turn = 1 user + 1 assistant)
MAX_HISTORY_TURNS = 20


# ── PAGE VIEWS ───────────────────────────────────────────────────────────────

def index(request):
    return render(request, 'ide/index.html')

def landing(request):
    return render(request, 'ide/landing.html')


# def chatbot(request):
#     return render(request, 'ide/chatbot.html')


# ── CODE RUNNER ──────────────────────────────────────────────────────────────

@csrf_exempt
def run_code(request):
    if request.method == 'POST':
        try:
            data         = json.loads(request.body)
            code         = data.get('code', '')
            input_values = data.get('inputs', None)   # list of strings or None
            result       = run_marathi_code(code, input_values)
            return JsonResponse(result)
        except Exception as e:
            return JsonResponse({
                'output': '', 'error': str(e),
                'success': False, 'needs_input': False, 'input_prompts': []
            })
    return JsonResponse({'error': 'POST method required'}, status=405)


# # ── CHATBOT API ──────────────────────────────────────────────────────────────
# @csrf_exempt
# @require_POST
# def chat(request):
#     try:
#         data    = json.loads(request.body)
#         message = data.get('message', '').strip()
#         history = data.get('history', [])

#         if not message:
#             return JsonResponse({'error': 'message is required'}, status=400)

#         # Validate and sanitise history
#         clean_history = [
#             {'role': turn['role'], 'content': turn['content']}
#             for turn in history
#             if isinstance(turn, dict)
#             and turn.get('role') in ('user', 'assistant')
#             and isinstance(turn.get('content'), str)
#         ]

#         if len(clean_history) > MAX_HISTORY_TURNS * 2:
#             clean_history = clean_history[-(MAX_HISTORY_TURNS * 2):]

#         # Configure Gemini
#         genai.configure(api_key=settings.GEMINI_API_KEY)
#         model = genai.GenerativeModel(
#             model_name='gemini-2.0-flash',
#             system_instruction=SYSTEM_PROMPT,
#         )

#         # Convert history to Gemini format
#         # Gemini uses 'user' and 'model' roles (not 'assistant')
#         gemini_history = [
#             {
#                 'role': 'user' if turn['role'] == 'user' else 'model',
#                 'parts': [turn['content']]
#             }
#             for turn in clean_history
#         ]

#         chat_session = model.start_chat(history=gemini_history)
#         response = chat_session.send_message(message)
#         reply = response.text

#         # Build updated history to return to the frontend (keep original format)
#         updated_history = clean_history + [
#             {'role': 'user',      'content': message},
#             {'role': 'assistant', 'content': reply},
#         ]

#         return JsonResponse({'reply': reply, 'history': updated_history})

#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)