# 🟠 मराठीकोड IDE (MarathiCode IDE)

एक संपूर्ण वेब-आधारित IDE जिथे तुम्ही **मराठी भाषेत** प्रोग्रामिंग करू शकता!

---

## 🚀 सुरुवात कशी करावी (Setup)

### पायरी 1: Django install करा
```bash
pip install django
```

### पायरी 2: MarathiCode फोल्डरमध्ये जा
```bash
cd MarathiCode
```

### पायरी 3: Server चालवा
```bash
python manage.py runserver
```

### पायरी 4: Browser उघडा
```
http://localhost:8000
```

---

## 📖 मराठीकोड भाषा संदर्भ (Language Reference)

### 🔑 सर्व Keywords

| इंग्रजी | मराठीकोड | उदाहरण |
|---------|-----------|--------|
| `if` | `jar` | `jar x > 10:` |
| `else` | `nahitar` | `nahitar:` |
| `elif` | `nahitar jar` | `nahitar jar x == 5:` |
| `while` | `jaoparyant` | `jaoparyant i < 10:` |
| `for` | `pratyek` | `pratyek i madhe yadi:` |
| `in` | `madhe` | `pratyek i madhe aakda_shreni(5):` |
| `def` | `karya` | `karya add(a, b):` |
| `return` | `parat` | `parat a + b` |
| `class` | `varg` | `varg Manoos:` |
| `self` | `swatah` | `swatah.nav = nav` |
| `print` | `dakhava` | `dakhava("नमस्कार!")` |
| `input` | `ghya` | `nav = ghya("नाव सांगा: ")` |
| `True` | `khare` | `flag = khare` |
| `False` | `khote` | `flag = khote` |
| `None` | `shunya` | `val = shunya` |
| `and` | `aani` | `jar a > 0 aani b > 0:` |
| `or` | `kiva` | `jar a > 0 kiva b > 0:` |
| `not` | `nahi` | `jar nahi khare:` |
| `break` | `thamba` | `thamba` |
| `continue` | `pudhe` | `pudhe` |
| `pass` | `jaude` | `jaude` |
| `len()` | `lambai()` | `lambai(yadi)` |
| `range()` | `aakda_shreni()` | `aakda_shreni(1, 10)` |
| `int()` | `poornanank()` | `poornanank("42")` |
| `float()` | `dasamank()` | `dasamank("3.14")` |
| `str()` | `akshar()` | `akshar(42)` |

### 📋 यादी (List) पद्धती

| इंग्रजी | मराठीकोड |
|---------|-----------|
| `.append()` | `.joda()` |
| `.remove()` | `.kadha()` |
| `.pop()` | `.urta()` |
| `.sort()` | `.sort()` |
| `.reverse()` | `.ulat()` |

### 📝 String पद्धती
```
akshar.upper()   → मोठी अक्षरे
akshar.lower()   → लहान अक्षरे
akshar.split()   → विभाजित करा
akshar.strip()   → जागा काढा
akshar.replace() → बदला
```

---

## 💻 उदाहरणे (Examples)

### 1. साधे Output
```marathi
dakhava("नमस्कार, जग!")
dakhava("मराठीकोड छान आहे!")
```

### 2. चल (Variables)
```marathi
nav = "राहुल"
vay = 20
dakhava("नाव:", nav, "वय:", vay)
```

### 3. if-else
```marathi
guni = 75

jar guni >= 90:
    dakhava("A श्रेणी - उत्कृष्ट!")
nahitar jar guni >= 75:
    dakhava("B श्रेणी - चांगले!")
nahitar jar guni >= 60:
    dakhava("C श्रेणी - ठीक")
nahitar:
    dakhava("अभ्यास कर!")
```

### 4. While Loop
```marathi
i = 1
jaoparyant i <= 10:
    dakhava(i, "* 2 =", i * 2)
    i = i + 1
```

### 5. For Loop
```marathi
phale = ["आंबा", "केळी", "द्राक्षे"]
pratyek phal madhe phale:
    dakhava("मला आवडते:", phal)
```

### 6. Function
```marathi
karya square(n):
    parat n * n

dakhava(square(5))   # 25
dakhava(square(12))  # 144
```

### 7. Class
```marathi
varg Gadhi:
    karya suruvat(swatah, brand, rangi):
        swatah.brand = brand
        swatah.rangi = rangi

    karya mahiti(swatah):
        dakhava("गाडी:", swatah.brand)
        dakhava("रंग:", swatah.rangi)

mazhi_gadhi = Gadhi("Toyota", "पांढरा")
mazhi_gadhi.mahiti()
```

### 8. Recursive Function (Factorial)
```marathi
karya factorial(n):
    jar n <= 1:
        parat 1
    parat n * factorial(n - 1)

dakhava("5! =", factorial(5))   # 120
dakhava("7! =", factorial(7))   # 5040
```

---

## 🗂️ Project Structure

```
MarathiCode/
├── manage.py
├── requirements.txt
├── README.md
├── marathi_lang/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── ide/
    ├── __init__.py
    ├── views.py
    ├── urls.py
    ├── marathi_interpreter.py    ← मराठीकोड भाषेचा मुख्य भाग
    ├── templates/
    │   └── ide/
    │       └── index.html        ← IDE interface
    └── static/
        └── ide/
            ├── css/style.css     ← संपूर्ण design
            └── js/editor.js      ← editor logic
```

---

## 🎨 Features

- ✅ **Syntax Highlighting** — Keywords, strings, numbers, comments रंगीत दिसतात
- ✅ **Line Numbers** — प्रत्येक ओळीचा नंबर
- ✅ **Multiple Themes** — गडद, उजळ, केशरी, समुद्र
- ✅ **Tab Support** — Tab key ने indent
- ✅ **Auto Brackets** — `(`, `[`, `{` आपोआप बंद होतात
- ✅ **Multiple Files** — अनेक फाईल्स उघडा
- ✅ **12 Examples** — शिकण्यासाठी तयार उदाहरणे
- ✅ **Keyword Reference** — सर्व keywords एका ठिकाणी
- ✅ **Ctrl+Enter** — Keyboard shortcut ने चालवा
- ✅ **Error Messages** — मराठीत चूक संदेश

---

## 🏗️ Language Features

- ✅ Variables आणि arithmetic
- ✅ Strings (मराठी text सहित)
- ✅ Lists आणि indexing
- ✅ if / elif / else
- ✅ while loop
- ✅ for-in loop
- ✅ Functions with return values
- ✅ Recursion
- ✅ Classes आणि Objects
- ✅ Boolean logic (aani, kiva, nahi)
- ✅ break, continue, pass
- ✅ Type conversion
- ✅ String methods
- ✅ List methods
- ✅ Comments (#)
- ✅ Nested functions
- ✅ Closures

---

**मराठीकोड — मराठीत प्रोग्रामिंग करा! 🟠**
