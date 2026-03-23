# ============================================================
#  MarathiCode Language Interpreter
#  Language Name: "MarathiCode" (मराठीकोड)
#  Full Lexer + Parser + Interpreter
# ============================================================
#
#  KEYWORD REFERENCE TABLE:
#  -------------------------
#  English          | Marathi Keyword   | Pronunciation
#  -----------------|-------------------|-------------------
#  if               | jar               | जर
#  else             | nahitar           | नाहीतर
#  elif             | nahitar jar       | नाहीतर जर
#  while            | jaoparyant        | जोपर्यंत
#  for              | pratyek           | प्रत्येक
#  in               | madhe             | मध्ये
#  print            | dakhava           | दाखवा
#  input            | ghya              | घ्या
#  def (function)   | karya             | कार्य
#  return           | parat             | परत
#  class            | varg              | वर्ग
#  True             | khare             | खरे
#  False            | khote             | खोटे
#  None             | shunya            | शून्य
#  and              | aani              | आणि
#  or               | kiva              | किंवा
#  not              | nahi              | नाही
#  break            | thamba            | थांब
#  continue         | pudhe             | पुढे
#  pass             | jaude             | जाऊदे
#  len              | lambai            | लांबई
#  range            | aakda_shreni      | आकडा_श्रेणी
#  int              | poornanank        | पूर्णांक
#  float            | dasamank          | दशमांक
#  str              | akshar            | अक्षर
#  list             | yadi              | यादी
#  append           | joda              | जोडा
#  remove           | kadha             | काढा
#  import           | aana              | आणा
# ============================================================

import re
import math
import time

# ─────────────────────────────────────────────
#  TOKEN TYPES
# ─────────────────────────────────────────────
TT_INT        = 'INT'
TT_FLOAT      = 'FLOAT'
TT_STRING     = 'STRING'
TT_IDENTIFIER = 'IDENTIFIER'
TT_KEYWORD    = 'KEYWORD'
TT_PLUS       = 'PLUS'
TT_MINUS      = 'MINUS'
TT_MUL        = 'MUL'
TT_DIV        = 'DIV'
TT_MOD        = 'MOD'
TT_POW        = 'POW'
TT_EQ         = 'EQ'
TT_EQEQ       = 'EQEQ'
TT_NEQ        = 'NEQ'
TT_LT         = 'LT'
TT_GT         = 'GT'
TT_LTE        = 'LTE'
TT_GTE        = 'GTE'
TT_LPAREN     = 'LPAREN'
TT_RPAREN     = 'RPAREN'
TT_LBRACKET   = 'LBRACKET'
TT_RBRACKET   = 'RBRACKET'
TT_LBRACE     = 'LBRACE'
TT_RBRACE     = 'RBRACE'
TT_COLON      = 'COLON'
TT_COMMA      = 'COMMA'
TT_DOT        = 'DOT'
TT_NEWLINE    = 'NEWLINE'
TT_INDENT     = 'INDENT'
TT_DEDENT     = 'DEDENT'
TT_EOF        = 'EOF'

KEYWORDS = {
    'jar', 'nahitar', 'jaoparyant', 'pratyek', 'madhe',
    'dakhava', 'ghya', 'karya', 'parat', 'varg',
    'khare', 'khote', 'shunya',
    'aani', 'kiva', 'nahi',
    'thamba', 'pudhe', 'jaude',
    'lambai', 'aakda_shreni',
    'poornanank', 'dasamank', 'akshar',
}

# ─────────────────────────────────────────────
#  TOKEN
# ─────────────────────────────────────────────
class Token:
    def __init__(self, type_, value=None, line=0):
        self.type  = type_
        self.value = value
        self.line  = line

    def __repr__(self):
        return f'Token({self.type}, {self.value!r})'


# ─────────────────────────────────────────────
#  LEXER
# ─────────────────────────────────────────────
class Lexer:
    def __init__(self, code):
        self.code   = code
        self.pos    = 0
        self.line   = 1
        self.tokens = []
        self.indent_stack = [0]

    def error(self, msg):
        raise MarathiError(f"ओळ {self.line}: लेखन चूक - {msg}")

    def peek(self, offset=0):
        i = self.pos + offset
        return self.code[i] if i < len(self.code) else ''

    def advance(self):
        ch = self.code[self.pos]
        self.pos += 1
        if ch == '\n':
            self.line += 1
        return ch

    def tokenize(self):
        while self.pos < len(self.code):
            self._scan_token()
        # close remaining indents
        while len(self.indent_stack) > 1:
            self.indent_stack.pop()
            self.tokens.append(Token(TT_DEDENT, None, self.line))
        self.tokens.append(Token(TT_EOF, None, self.line))
        return self.tokens

    def _scan_token(self):
        ch = self.peek()

        # Comment
        if ch == '#':
            while self.pos < len(self.code) and self.peek() != '\n':
                self.advance()
            return

        # Newline + indentation
        if ch == '\n':
            self.advance()
            self.tokens.append(Token(TT_NEWLINE, None, self.line))
            self._handle_indent()
            return

        # Whitespace
        if ch in ' \t\r':
            self.advance()
            return

        # String
        if ch in ('"', "'"):
            self._read_string(ch)
            return

        # Number
        if ch.isdigit():
            self._read_number()
            return

        # Identifier / keyword (supports Devanagari Unicode)
        if ch.isalpha() or ch == '_' or ord(ch) > 127:
            self._read_identifier()
            return

        # Operators
        self._read_operator()

    def _handle_indent(self):
        indent = 0
        while self.pos < len(self.code) and self.peek() in (' ', '\t'):
            if self.peek() == '\t':
                indent += 4
            else:
                indent += 1
            self.advance()
        # Skip blank lines
        if self.pos < len(self.code) and self.peek() == '\n':
            return
        if self.pos < len(self.code) and self.peek() == '#':
            return
        current = self.indent_stack[-1]
        if indent > current:
            self.indent_stack.append(indent)
            self.tokens.append(Token(TT_INDENT, None, self.line))
        elif indent < current:
            while self.indent_stack and self.indent_stack[-1] > indent:
                self.indent_stack.pop()
                self.tokens.append(Token(TT_DEDENT, None, self.line))

    def _read_string(self, quote):
        self.advance()  # skip opening quote
        s = ''
        while self.pos < len(self.code) and self.peek() != quote:
            if self.peek() == '\\':
                self.advance()
                esc = self.advance()
                s += {'n': '\n', 't': '\t', '\\': '\\', '"': '"', "'": "'"}.get(esc, esc)
            else:
                s += self.advance()
        if self.pos >= len(self.code):
            self.error("String बंद केला नाही")
        self.advance()  # skip closing quote
        self.tokens.append(Token(TT_STRING, s, self.line))

    def _read_number(self):
        num = ''
        is_float = False
        while self.pos < len(self.code) and (self.peek().isdigit() or self.peek() == '.'):
            if self.peek() == '.':
                if is_float:
                    break
                is_float = True
            num += self.advance()
        if is_float:
            self.tokens.append(Token(TT_FLOAT, float(num), self.line))
        else:
            self.tokens.append(Token(TT_INT, int(num), self.line))

    def _read_identifier(self):
        word = ''
        while self.pos < len(self.code) and (self.peek().isalnum() or self.peek() == '_' or ord(self.peek()) > 127):
            word += self.advance()
        tt = TT_KEYWORD if word in KEYWORDS else TT_IDENTIFIER
        self.tokens.append(Token(tt, word, self.line))

    def _read_operator(self):
        ch = self.advance()
        line = self.line
        nxt = self.peek()
        ops = {
            '+': TT_PLUS, '-': TT_MINUS, '*': TT_MUL,
            '/': TT_DIV,  '%': TT_MOD,   '^': TT_POW,
            '(': TT_LPAREN, ')': TT_RPAREN,
            '[': TT_LBRACKET, ']': TT_RBRACKET,
            '{': TT_LBRACE,   '}': TT_RBRACE,
            ':': TT_COLON, ',': TT_COMMA, '.': TT_DOT,
        }
        if ch == '=' and nxt == '=':
            self.advance(); self.tokens.append(Token(TT_EQEQ, '==', line)); return
        if ch == '!' and nxt == '=':
            self.advance(); self.tokens.append(Token(TT_NEQ,  '!=', line)); return
        if ch == '<' and nxt == '=':
            self.advance(); self.tokens.append(Token(TT_LTE,  '<=', line)); return
        if ch == '>' and nxt == '=':
            self.advance(); self.tokens.append(Token(TT_GTE,  '>=', line)); return
        if ch == '<':  self.tokens.append(Token(TT_LT, '<', line)); return
        if ch == '>':  self.tokens.append(Token(TT_GT, '>', line)); return
        if ch == '=':  self.tokens.append(Token(TT_EQ, '=', line)); return
        if ch == '*' and nxt == '*':
            self.advance(); self.tokens.append(Token(TT_POW, '**', line)); return
        if ch in ops:
            self.tokens.append(Token(ops[ch], ch, line)); return
        self.error(f"अज्ञात चिन्ह: '{ch}'")


# ─────────────────────────────────────────────
#  AST NODES
# ─────────────────────────────────────────────
class NumberNode:
    def __init__(self, value): self.value = value

class StringNode:
    def __init__(self, value): self.value = value

class ListNode:
    def __init__(self, elements): self.elements = elements

class VarAccessNode:
    def __init__(self, name, line): self.name = name; self.line = line

class VarAssignNode:
    def __init__(self, name, value, line): self.name = name; self.value = value; self.line = line

class IndexAccessNode:
    def __init__(self, obj, index): self.obj = obj; self.index = index

class IndexAssignNode:
    def __init__(self, obj, index, value): self.obj = obj; self.index = index; self.value = value

class AttributeAccessNode:
    def __init__(self, obj, attr): self.obj = obj; self.attr = attr

class AttributeAssignNode:
    def __init__(self, obj, attr, value): self.obj = obj; self.attr = attr; self.value = value

class BinOpNode:
    def __init__(self, left, op, right): self.left = left; self.op = op; self.right = right

class UnaryOpNode:
    def __init__(self, op, node): self.op = op; self.node = node

class IfNode:
    def __init__(self, cases, else_case): self.cases = cases; self.else_case = else_case

class WhileNode:
    def __init__(self, condition, body): self.condition = condition; self.body = body

class ForNode:
    def __init__(self, var, iterable, body): self.var = var; self.iterable = iterable; self.body = body

class FuncDefNode:
    def __init__(self, name, params, body): self.name = name; self.params = params; self.body = body

class CallNode:
    def __init__(self, func, args): self.func = func; self.args = args

class ReturnNode:
    def __init__(self, value): self.value = value

class BreakNode:  pass
class ContinueNode: pass
class PassNode:   pass

class ClassDefNode:
    def __init__(self, name, body): self.name = name; self.body = body

class BlockNode:
    def __init__(self, stmts): self.stmts = stmts

class PrintNode:
    def __init__(self, args): self.args = args

class InputNode:
    def __init__(self, prompt): self.prompt = prompt


# ─────────────────────────────────────────────
#  PARSER
# ─────────────────────────────────────────────
class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos    = 0

    def current(self):
        return self.tokens[self.pos]

    def peek(self, offset=1):
        i = self.pos + offset
        return self.tokens[i] if i < len(self.tokens) else self.tokens[-1]

    def advance(self):
        tok = self.tokens[self.pos]
        if self.pos < len(self.tokens) - 1:
            self.pos += 1
        return tok

    def expect(self, type_, value=None):
        tok = self.current()
        if tok.type != type_:
            raise MarathiError(f"ओळ {tok.line}: '{value or type_}' अपेक्षित होते, पण '{tok.value}' मिळाले")
        if value and tok.value != value:
            raise MarathiError(f"ओळ {tok.line}: '{value}' अपेक्षित होते, पण '{tok.value}' मिळाले")
        return self.advance()

    def skip_newlines(self):
        while self.current().type == TT_NEWLINE:
            self.advance()

    def parse(self):
        stmts = []
        self.skip_newlines()
        while self.current().type != TT_EOF:
            stmt = self.parse_statement()
            if stmt: stmts.append(stmt)
            self.skip_newlines()
        return BlockNode(stmts)

    def parse_block(self):
        self.expect(TT_COLON)
        self.skip_newlines()
        self.expect(TT_INDENT)
        stmts = []
        self.skip_newlines()
        while self.current().type not in (TT_DEDENT, TT_EOF):
            stmt = self.parse_statement()
            if stmt: stmts.append(stmt)
            self.skip_newlines()
        if self.current().type == TT_DEDENT:
            self.advance()
        return BlockNode(stmts)

    def parse_statement(self):
        tok = self.current()

        # skip stray newlines
        if tok.type == TT_NEWLINE:
            self.advance(); return None

        # if / jar
        if tok.type == TT_KEYWORD and tok.value == 'jar':
            return self.parse_if()

        # while / jaoparyant
        if tok.type == TT_KEYWORD and tok.value == 'jaoparyant':
            return self.parse_while()

        # for / pratyek
        if tok.type == TT_KEYWORD and tok.value == 'pratyek':
            return self.parse_for()

        # function / karya
        if tok.type == TT_KEYWORD and tok.value == 'karya':
            return self.parse_func_def()

        # class / varg
        if tok.type == TT_KEYWORD and tok.value == 'varg':
            return self.parse_class_def()

        # return / parat
        if tok.type == TT_KEYWORD and tok.value == 'parat':
            self.advance()
            val = None
            if self.current().type not in (TT_NEWLINE, TT_EOF):
                val = self.parse_expr()
            self._eat_newline()
            return ReturnNode(val)

        # break / thamba
        if tok.type == TT_KEYWORD and tok.value == 'thamba':
            self.advance(); self._eat_newline(); return BreakNode()

        # continue / pudhe
        if tok.type == TT_KEYWORD and tok.value == 'pudhe':
            self.advance(); self._eat_newline(); return ContinueNode()

        # pass / jaude
        if tok.type == TT_KEYWORD and tok.value == 'jaude':
            self.advance(); self._eat_newline(); return PassNode()

        # print / dakhava
        if tok.type == TT_KEYWORD and tok.value == 'dakhava':
            return self.parse_print()

        # input / ghya  (as a statement — assignment happens via expression)
        # assignment or expression
        return self.parse_assign_or_expr()

    def _eat_newline(self):
        if self.current().type == TT_NEWLINE:
            self.advance()

    def parse_if(self):
        self.advance()  # eat 'jar'
        cond = self.parse_expr()
        body = self.parse_block()
        cases = [(cond, body)]
        else_case = None

        while True:
            self.skip_newlines()
            if self.current().type == TT_KEYWORD and self.current().value == 'nahitar':
                self.advance()
                if self.current().type == TT_KEYWORD and self.current().value == 'jar':
                    # elif
                    self.advance()
                    elif_cond = self.parse_expr()
                    elif_body = self.parse_block()
                    cases.append((elif_cond, elif_body))
                else:
                    else_case = self.parse_block()
                    break
            else:
                break
        return IfNode(cases, else_case)

    def parse_while(self):
        self.advance()
        cond = self.parse_expr()
        body = self.parse_block()
        return WhileNode(cond, body)

    def parse_for(self):
        self.advance()  # eat 'pratyek'
        var = self.expect(TT_IDENTIFIER).value
        self.expect(TT_KEYWORD, 'madhe')
        iterable = self.parse_expr()
        body = self.parse_block()
        return ForNode(var, iterable, body)

    def parse_func_def(self):
        self.advance()
        name = self.expect(TT_IDENTIFIER).value
        self.expect(TT_LPAREN)
        params = []
        while self.current().type != TT_RPAREN:
            params.append(self.expect(TT_IDENTIFIER).value)
            if self.current().type == TT_COMMA:
                self.advance()
        self.expect(TT_RPAREN)
        body = self.parse_block()
        return FuncDefNode(name, params, body)

    def parse_class_def(self):
        self.advance()
        name = self.expect(TT_IDENTIFIER).value
        body = self.parse_block()
        return ClassDefNode(name, body)

    def parse_print(self):
        line = self.current().line
        self.advance()  # eat 'dakhava'
        self.expect(TT_LPAREN)
        args = []
        if self.current().type != TT_RPAREN:
            args.append(self.parse_expr())
            while self.current().type == TT_COMMA:
                self.advance()
                args.append(self.parse_expr())
        self.expect(TT_RPAREN)
        self._eat_newline()
        return PrintNode(args)

    def parse_assign_or_expr(self):
        tok = self.current()
        expr = self.parse_expr()

        if self.current().type == TT_EQ:
            line = self.current().line
            self.advance()
            val = self.parse_expr()
            self._eat_newline()
            if isinstance(expr, VarAccessNode):
                return VarAssignNode(expr.name, val, line)
            if isinstance(expr, IndexAccessNode):
                return IndexAssignNode(expr.obj, expr.index, val)
            if isinstance(expr, AttributeAccessNode):
                return AttributeAssignNode(expr.obj, expr.attr, val)
            raise MarathiError(f"ओळ {tok.line}: चुकीचा assignment")
        self._eat_newline()
        return expr

    # ─── Expression hierarchy ────────────────
    def parse_expr(self):       return self.parse_or()
    def parse_or(self):
        left = self.parse_and()
        while self.current().type == TT_KEYWORD and self.current().value == 'kiva':
            op = self.advance().value
            left = BinOpNode(left, op, self.parse_and())
        return left

    def parse_and(self):
        left = self.parse_not()
        while self.current().type == TT_KEYWORD and self.current().value == 'aani':
            op = self.advance().value
            left = BinOpNode(left, op, self.parse_not())
        return left

    def parse_not(self):
        if self.current().type == TT_KEYWORD and self.current().value == 'nahi':
            op = self.advance().value
            return UnaryOpNode(op, self.parse_not())
        return self.parse_compare()

    def parse_compare(self):
        left = self.parse_add()
        cmp_ops = {TT_EQEQ, TT_NEQ, TT_LT, TT_GT, TT_LTE, TT_GTE}
        while self.current().type in cmp_ops:
            op = self.advance().value
            left = BinOpNode(left, op, self.parse_add())
        return left

    def parse_add(self):
        left = self.parse_mul()
        while self.current().type in (TT_PLUS, TT_MINUS):
            op = self.advance().value
            left = BinOpNode(left, op, self.parse_mul())
        return left

    def parse_mul(self):
        left = self.parse_pow()
        while self.current().type in (TT_MUL, TT_DIV, TT_MOD):
            op = self.advance().value
            left = BinOpNode(left, op, self.parse_pow())
        return left

    def parse_pow(self):
        left = self.parse_unary()
        if self.current().type == TT_POW:
            op = self.advance().value
            right = self.parse_pow()
            return BinOpNode(left, op, right)
        return left

    def parse_unary(self):
        if self.current().type == TT_MINUS:
            op = self.advance().value
            return UnaryOpNode(op, self.parse_unary())
        return self.parse_postfix()

    def parse_postfix(self):
        node = self.parse_primary()
        while True:
            if self.current().type == TT_LBRACKET:
                self.advance()
                idx = self.parse_expr()
                self.expect(TT_RBRACKET)
                node = IndexAccessNode(node, idx)
            elif self.current().type == TT_DOT:
                self.advance()
                attr = self.expect(TT_IDENTIFIER).value
                if self.current().type == TT_LPAREN:
                    self.advance()
                    args = []
                    if self.current().type != TT_RPAREN:
                        args.append(self.parse_expr())
                        while self.current().type == TT_COMMA:
                            self.advance()
                            args.append(self.parse_expr())
                    self.expect(TT_RPAREN)
                    node = CallNode(AttributeAccessNode(node, attr), args)
                else:
                    node = AttributeAccessNode(node, attr)
            elif self.current().type == TT_LPAREN:
                self.advance()
                args = []
                if self.current().type != TT_RPAREN:
                    args.append(self.parse_expr())
                    while self.current().type == TT_COMMA:
                        self.advance()
                        args.append(self.parse_expr())
                self.expect(TT_RPAREN)
                node = CallNode(node, args)
            else:
                break
        return node

    def parse_primary(self):
        tok = self.current()

        if tok.type == TT_INT:
            self.advance(); return NumberNode(tok.value)
        if tok.type == TT_FLOAT:
            self.advance(); return NumberNode(tok.value)
        if tok.type == TT_STRING:
            self.advance(); return StringNode(tok.value)

        if tok.type == TT_KEYWORD and tok.value == 'khare':
            self.advance(); return NumberNode(True)
        if tok.type == TT_KEYWORD and tok.value == 'khote':
            self.advance(); return NumberNode(False)
        if tok.type == TT_KEYWORD and tok.value == 'shunya':
            self.advance(); return NumberNode(None)

        # Built-in functions used as expressions
        if tok.type == TT_KEYWORD and tok.value == 'lambai':
            self.advance()
            self.expect(TT_LPAREN)
            arg = self.parse_expr()
            self.expect(TT_RPAREN)
            return CallNode(VarAccessNode('__lambai__', tok.line), [arg])

        if tok.type == TT_KEYWORD and tok.value == 'aakda_shreni':
            self.advance()
            self.expect(TT_LPAREN)
            args = [self.parse_expr()]
            while self.current().type == TT_COMMA:
                self.advance(); args.append(self.parse_expr())
            self.expect(TT_RPAREN)
            return CallNode(VarAccessNode('__aakda_shreni__', tok.line), args)

        if tok.type == TT_KEYWORD and tok.value == 'poornanank':
            self.advance()
            self.expect(TT_LPAREN)
            arg = self.parse_expr()
            self.expect(TT_RPAREN)
            return CallNode(VarAccessNode('__poornanank__', tok.line), [arg])

        if tok.type == TT_KEYWORD and tok.value == 'dasamank':
            self.advance()
            self.expect(TT_LPAREN)
            arg = self.parse_expr()
            self.expect(TT_RPAREN)
            return CallNode(VarAccessNode('__dasamank__', tok.line), [arg])

        if tok.type == TT_KEYWORD and tok.value == 'akshar':
            self.advance()
            self.expect(TT_LPAREN)
            arg = self.parse_expr()
            self.expect(TT_RPAREN)
            return CallNode(VarAccessNode('__akshar__', tok.line), [arg])

        if tok.type == TT_KEYWORD and tok.value == 'ghya':
            self.advance()
            self.expect(TT_LPAREN)
            prompt = None
            if self.current().type != TT_RPAREN:
                prompt = self.parse_expr()
            self.expect(TT_RPAREN)
            return InputNode(prompt)

        if tok.type == TT_LBRACKET:
            self.advance()
            elements = []
            if self.current().type != TT_RBRACKET:
                elements.append(self.parse_expr())
                while self.current().type == TT_COMMA:
                    self.advance()
                    elements.append(self.parse_expr())
            self.expect(TT_RBRACKET)
            return ListNode(elements)

        if tok.type == TT_LPAREN:
            self.advance()
            expr = self.parse_expr()
            self.expect(TT_RPAREN)
            return expr

        if tok.type == TT_IDENTIFIER:
            self.advance()
            return VarAccessNode(tok.value, tok.line)

        raise MarathiError(f"ओळ {tok.line}: अनपेक्षित token: '{tok.value}'")


# ─────────────────────────────────────────────
#  RUNTIME VALUES & ENVIRONMENT
# ─────────────────────────────────────────────
class ReturnSignal(Exception):
    def __init__(self, value): self.value = value

class BreakSignal(Exception):   pass
class ContinueSignal(Exception): pass

class MarathiError(Exception):  pass

class MarathiFunction:
    def __init__(self, name, params, body, env):
        self.name = name; self.params = params
        self.body = body; self.env   = env
    def __repr__(self): return f"<कार्य {self.name}>"

class MarathiClass:
    def __init__(self, name, methods):
        self.name = name; self.methods = methods
    def __repr__(self): return f"<वर्ग {self.name}>"

class MarathiInstance:
    def __init__(self, klass):
        self.klass  = klass
        self.fields = {}
    def __repr__(self): return f"<{self.klass.name} वस्तू>"

class Environment:
    def __init__(self, parent=None):
        self.vars   = {}
        self.parent = parent

    def get(self, name, line=0):
        if name in self.vars:
            return self.vars[name]
        if self.parent:
            return self.parent.get(name, line)
        raise MarathiError(f"ओळ {line}: '{name}' हे चल सापडले नाही")

    def set(self, name, val):
        self.vars[name] = val

    def assign(self, name, val, line=0):
        if name in self.vars:
            self.vars[name] = val; return
        if self.parent:
            self.parent.assign(name, val, line); return
        raise MarathiError(f"ओळ {line}: '{name}' हे चल सापडले नाही")


# ─────────────────────────────────────────────
#  INTERPRETER
# ─────────────────────────────────────────────
class Interpreter:
    def __init__(self, output_callback=None, input_values=None):
        self.output      = output_callback or (lambda s: None)
        self.env         = Environment()
        self._setup_builtins()
        self._step_count = 0
        self.MAX_STEPS   = 100_000
        self.input_queue = list(input_values or [])
        self.input_prompts = []   # collects prompts if no input supplied

    def _step(self):
        self._step_count += 1
        if self._step_count > self.MAX_STEPS:
            raise MarathiError("अनंत लूप आढळला — कार्यक्रम थांबवला!")

    def _setup_builtins(self):
        self.env.set('__lambai__',       lambda args: len(args[0]))
        self.env.set('__aakda_shreni__', lambda args: list(range(*args)))
        self.env.set('__poornanank__',   lambda args: int(args[0]))
        self.env.set('__dasamank__',     lambda args: float(args[0]))
        self.env.set('__akshar__',       lambda args: str(args[0]))
        self.env.set('math_sqrt',        lambda args: math.sqrt(args[0]))
        self.env.set('math_pow',         lambda args: math.pow(args[0], args[1]))

    def run(self, node, env=None):
        env = env or self.env
        self._step()

        if isinstance(node, BlockNode):
            result = None
            for stmt in node.stmts:
                result = self.run(stmt, env)
            return result

        if isinstance(node, NumberNode):
            return node.value

        if isinstance(node, StringNode):
            return node.value

        if isinstance(node, ListNode):
            return [self.run(e, env) for e in node.elements]

        if isinstance(node, VarAccessNode):
            return env.get(node.name, node.line)

        if isinstance(node, VarAssignNode):
            val = self.run(node.value, env)
            # If variable already exists anywhere in scope chain, update it there
            # Otherwise create it in current scope
            try:
                env.assign(node.name, val, node.line)
            except MarathiError:
                env.set(node.name, val)
            return val

        if isinstance(node, AttributeAssignNode):
            obj = self.run(node.obj, env)
            val = self.run(node.value, env)
            if isinstance(obj, MarathiInstance):
                obj.fields[node.attr] = val
                return val
            raise MarathiError(f"'{node.attr}' attribute set करता येत नाही")

        if isinstance(node, IndexAccessNode):
            obj = self.run(node.obj, env)
            idx = self.run(node.index, env)
            try:
                return obj[idx]
            except (IndexError, KeyError, TypeError) as e:
                raise MarathiError(f"Index चूक: {e}")

        if isinstance(node, IndexAssignNode):
            obj = self.run(node.obj, env)
            idx = self.run(node.index, env)
            val = self.run(node.value, env)
            obj[idx] = val
            return val

        if isinstance(node, AttributeAccessNode):
            obj = self.run(node.obj, env)
            if isinstance(obj, MarathiInstance):
                if node.attr in obj.fields:
                    return obj.fields[node.attr]
                if node.attr in obj.klass.methods:
                    return obj.klass.methods[node.attr]
            raise MarathiError(f"'{node.attr}' हे attribute सापडले नाही")

        if isinstance(node, BinOpNode):
            return self._eval_binop(node, env)

        if isinstance(node, UnaryOpNode):
            val = self.run(node.node, env)
            if node.op == '-':    return -val
            if node.op == 'nahi': return not val
            return val

        if isinstance(node, PrintNode):
            parts = [self._to_str(self.run(a, env)) for a in node.args]
            self.output(' '.join(parts))
            return None

        if isinstance(node, InputNode):
            prompt = self._to_str(self.run(node.prompt, env)) if node.prompt else ''
            if self.input_queue:
                val = self.input_queue.pop(0)
                # echo the prompt + user value in output
                if prompt:
                    self.output(f"❓ {prompt}{val}")
                return val
            else:
                # No input supplied yet — record the prompt and return placeholder
                self.input_prompts.append(prompt or "मूल्य द्या: ")
                return ''   # fallback

        if isinstance(node, IfNode):
            for cond, body in node.cases:
                if self.run(cond, env):
                    local = Environment(env)
                    return self.run(body, local)
            if node.else_case:
                local = Environment(env)
                return self.run(node.else_case, local)
            return None

        if isinstance(node, WhileNode):
            while self.run(node.condition, env):
                self._step()
                local = Environment(env)
                try:
                    self.run(node.body, local)
                except BreakSignal:
                    break
                except ContinueSignal:
                    continue
            return None

        if isinstance(node, ForNode):
            iterable = self.run(node.iterable, env)
            for item in iterable:
                self._step()
                local = Environment(env)
                local.set(node.var, item)
                try:
                    self.run(node.body, local)
                except BreakSignal:
                    break
                except ContinueSignal:
                    continue
            return None

        if isinstance(node, FuncDefNode):
            fn = MarathiFunction(node.name, node.params, node.body, env)
            env.set(node.name, fn)
            return fn

        if isinstance(node, ClassDefNode):
            methods = {}
            local   = Environment(env)
            self.run(node.body, local)
            methods = local.vars.copy()
            klass   = MarathiClass(node.name, methods)
            env.set(node.name, klass)
            return klass

        if isinstance(node, CallNode):
            return self._eval_call(node, env)

        if isinstance(node, ReturnNode):
            val = self.run(node.value, env) if node.value else None
            raise ReturnSignal(val)

        if isinstance(node, BreakNode):    raise BreakSignal()
        if isinstance(node, ContinueNode): raise ContinueSignal()
        if isinstance(node, PassNode):     return None

        raise MarathiError(f"अज्ञात node प्रकार: {type(node).__name__}")

    def _to_str(self, val):
        if val is True:  return 'खरे'
        if val is False: return 'खोटे'
        if val is None:  return 'शून्य'
        if isinstance(val, list):
            return '[' + ', '.join(self._to_str(v) for v in val) + ']'
        return str(val)

    def _eval_binop(self, node, env):
        # Short-circuit
        if node.op == 'aani':
            l = self.run(node.left, env)
            return l and self.run(node.right, env)
        if node.op == 'kiva':
            l = self.run(node.left, env)
            return l or self.run(node.right, env)

        l = self.run(node.left, env)
        r = self.run(node.right, env)
        op = node.op
        try:
            if op == '+':  return l + r
            if op == '-':  return l - r
            if op == '*':  return l * r
            if op == '/':
                if r == 0: raise MarathiError("शून्याने भाग करता येत नाही!")
                return l / r
            if op == '%':  return l % r
            if op == '**': return l ** r
            if op == '==': return l == r
            if op == '!=': return l != r
            if op == '<':  return l <  r
            if op == '>':  return l >  r
            if op == '<=': return l <= r
            if op == '>=': return l >= r
        except MarathiError: raise
        except Exception as e:
            raise MarathiError(f"गणना चूक: {e}")

    def _eval_call(self, node, env):
        # Built-in lambda
        if isinstance(node.func, VarAccessNode):
            name = node.func.name
            try:
                fn = env.get(name, node.func.line)
            except MarathiError:
                raise MarathiError(f"ओळ {node.func.line}: '{name}' सापडले नाही")
            args = [self.run(a, env) for a in node.args]
            if callable(fn) and not isinstance(fn, (MarathiFunction, MarathiClass)):
                return fn(args)

        # Attribute call (list methods)
        if isinstance(node.func, AttributeAccessNode):
            obj  = self.run(node.func.obj, env)
            attr = node.func.attr
            args = [self.run(a, env) for a in node.args]
            if isinstance(obj, list):
                if attr == 'joda':   obj.append(args[0]); return None
                if attr == 'kadha':  obj.remove(args[0]); return None
                if attr == 'urta':   return obj.pop() if not args else obj.pop(args[0])
                if attr == 'sort':   obj.sort(); return None
                if attr == 'ulat':   obj.reverse(); return None
            if isinstance(obj, str):
                if attr == 'upper':  return obj.upper()
                if attr == 'lower':  return obj.lower()
                if attr == 'split':  return obj.split(args[0] if args else None)
                if attr == 'replace':return obj.replace(args[0], args[1])
                if attr == 'strip':  return obj.strip()
            if isinstance(obj, MarathiInstance):
                method = obj.klass.methods.get(attr)
                if method and isinstance(method, MarathiFunction):
                    local = Environment(method.env)
                    local.set('swatah', obj)   # 'self' equivalent
                    for p, a in zip(method.params[1:], args):
                        local.set(p, a)
                    try:
                        self.run(method.body, local)
                    except ReturnSignal as ret:
                        return ret.value
                    return None
            raise MarathiError(f"'{attr}' method सापडले नाही")

        # MarathiFunction
        fn   = self.run(node.func, env)
        args = [self.run(a, env) for a in node.args]

        if isinstance(fn, MarathiClass):
            inst = MarathiInstance(fn)
            init = fn.methods.get('__init__') or fn.methods.get('suruvat')
            if init and isinstance(init, MarathiFunction):
                local = Environment(init.env)
                local.set('swatah', inst)
                for p, a in zip(init.params[1:], args):
                    local.set(p, a)
                try:
                    self.run(init.body, local)
                except ReturnSignal:
                    pass
            return inst

        if isinstance(fn, MarathiFunction):
            local = Environment(fn.env)
            if len(args) != len(fn.params):
                raise MarathiError(
                    f"'{fn.name}': {len(fn.params)} arguments अपेक्षित, {len(args)} मिळाले")
            for p, a in zip(fn.params, args):
                local.set(p, a)
            try:
                self.run(fn.body, local)
            except ReturnSignal as ret:
                return ret.value
            return None

        if callable(fn):
            return fn(args)

        raise MarathiError(f"'{fn}' हे callable नाही")


# ─────────────────────────────────────────────
#  PUBLIC API
# ─────────────────────────────────────────────
def scan_input_prompts(code: str) -> list:
    """
    Dry-run to find how many ghya() calls exist and their prompts.
    Returns list of prompt strings (may be empty strings).
    """
    prompts = []
    try:
        lexer  = Lexer(code)
        tokens = lexer.tokenize()
        parser = Parser(tokens)
        ast    = parser.parse()
        # Walk AST and collect InputNodes
        def walk(node):
            if isinstance(node, InputNode):
                prompts.append(getattr(node, '_prompt_text', ''))
            for attr in vars(node).values():
                if isinstance(attr, list):
                    for item in attr:
                        if hasattr(item, '__dict__'):
                            walk(item)
                elif hasattr(attr, '__dict__'):
                    walk(attr)
        # simpler: just count ghya occurrences in tokens
        prompts.clear()
        for i, tok in enumerate(tokens):
            if tok.type == TT_KEYWORD and tok.value == 'ghya':
                prompts.append('')
    except Exception:
        pass
    return prompts


def run_marathi_code(code: str, input_values: list = None) -> dict:
    """
    Execute MarathiCode source and return:
      {
        'output':        str,
        'error':         str|None,
        'success':       bool,
        'needs_input':   bool,       # True if ghya() found but no inputs given
        'input_prompts': list[str],  # prompts for each ghya() call
      }

    Pass input_values=['val1','val2',...] to supply answers to ghya() calls.
    """
    output_lines = []

    def capture(line):
        output_lines.append(str(line))

    # --- first pass: detect if code has ghya() calls and we have no inputs ---
    if input_values is None:
        prompts = scan_input_prompts(code)
        if prompts:
            return {
                'output':        '',
                'error':         None,
                'success':       False,
                'needs_input':   True,
                'input_prompts': prompts,
            }

    try:
        lexer  = Lexer(code)
        tokens = lexer.tokenize()

        parser = Parser(tokens)
        ast    = parser.parse()

        interp = Interpreter(output_callback=capture, input_values=input_values or [])
        interp.run(ast)

        return {
            'output':        '\n'.join(output_lines) or '(कोणताही output नाही)',
            'error':         None,
            'success':       True,
            'needs_input':   False,
            'input_prompts': [],
        }
    except MarathiError as e:
        return {
            'output':        '\n'.join(output_lines),
            'error':         str(e),
            'success':       False,
            'needs_input':   False,
            'input_prompts': [],
        }
    except RecursionError:
        return {
            'output':        '\n'.join(output_lines),
            'error':         'खूप खोल recursion — stack overflow!',
            'success':       False,
            'needs_input':   False,
            'input_prompts': [],
        }
    except Exception as e:
        return {
            'output':        '\n'.join(output_lines),
            'error':         f'अंतर्गत चूक: {e}',
            'success':       False,
            'needs_input':   False,
            'input_prompts': [],
        }
