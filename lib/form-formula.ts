/**
 * Safe formula evaluator for form CALCULATED fields.
 *
 * Supports: numeric literals, field refs ({{name}} or name), + - * / ( )
 * and the functions sum(), min(), max(), avg(), round(), floor(), ceil(), abs().
 * Everything else is rejected to prevent code injection — no eval, no Function.
 */

type Tok =
  | { t: 'num'; v: number }
  | { t: 'ref'; v: string }
  | { t: 'op'; v: '+' | '-' | '*' | '/' }
  | { t: 'lp' }
  | { t: 'rp' }
  | { t: 'comma' }
  | { t: 'fn'; v: string }

const FN_NAMES = new Set(['sum', 'min', 'max', 'avg', 'round', 'floor', 'ceil', 'abs'])

function tokenize(src: string): Tok[] {
  const out: Tok[] = []
  const s = src.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, ' @$1 ')
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === ' ' || c === '\t' || c === '\n') { i++; continue }
    if (c === '(') { out.push({ t: 'lp' }); i++; continue }
    if (c === ')') { out.push({ t: 'rp' }); i++; continue }
    if (c === ',') { out.push({ t: 'comma' }); i++; continue }
    if ('+-*/'.includes(c)) { out.push({ t: 'op', v: c as any }); i++; continue }
    if (c === '@') {
      let j = i + 1
      while (j < s.length && /[a-zA-Z0-9_.-]/.test(s[j])) j++
      out.push({ t: 'ref', v: s.slice(i + 1, j) })
      i = j
      continue
    }
    if (/[0-9.]/.test(c)) {
      let j = i
      while (j < s.length && /[0-9.]/.test(s[j])) j++
      out.push({ t: 'num', v: Number(s.slice(i, j)) })
      i = j
      continue
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i
      while (j < s.length && /[a-zA-Z0-9_]/.test(s[j])) j++
      const name = s.slice(i, j).toLowerCase()
      if (FN_NAMES.has(name)) { out.push({ t: 'fn', v: name }); i = j; continue }
      // bare identifier without @ — treat as field ref (friendly shorthand)
      out.push({ t: 'ref', v: s.slice(i, j) })
      i = j
      continue
    }
    throw new Error(`Unexpected character '${c}'`)
  }
  return out
}

// Pratt-style recursive descent
function parse(tokens: Tok[]) {
  let p = 0
  const peek = () => tokens[p]
  const next = () => tokens[p++]
  const expect = (t: Tok['t']) => { const x = next(); if (!x || x.t !== t) throw new Error(`Expected ${t}`); return x }

  function parseExpr(minPrec = 1): any {
    let left = parseUnary()
    while (true) {
      const tk = peek()
      if (!tk || tk.t !== 'op') break
      const prec = tk.v === '+' || tk.v === '-' ? 1 : 2
      if (prec < minPrec) break
      next()
      const right = parseExpr(prec + 1)
      left = { type: 'bin', op: tk.v, left, right }
    }
    return left
  }
  function parseUnary(): any {
    const tk = peek()
    if (tk?.t === 'op' && (tk.v === '-' || tk.v === '+')) {
      next()
      const arg = parseUnary()
      return { type: 'unary', op: tk.v, arg }
    }
    return parsePrimary()
  }
  function parsePrimary(): any {
    const tk = next()
    if (!tk) throw new Error('Unexpected end of expression')
    if (tk.t === 'num') return { type: 'num', value: tk.v }
    if (tk.t === 'ref') return { type: 'ref', name: tk.v }
    if (tk.t === 'lp') {
      const e = parseExpr()
      expect('rp')
      return e
    }
    if (tk.t === 'fn') {
      expect('lp')
      const args: any[] = []
      if (peek()?.t !== 'rp') {
        args.push(parseExpr())
        while (peek()?.t === 'comma') { next(); args.push(parseExpr()) }
      }
      expect('rp')
      return { type: 'call', fn: tk.v, args }
    }
    throw new Error(`Unexpected token ${tk.t}`)
  }

  const root = parseExpr()
  if (p < tokens.length) throw new Error('Trailing tokens')
  return root
}

function toNumber(x: any): number {
  if (typeof x === 'number') return x
  if (typeof x === 'string' && x.trim() !== '') return Number(x)
  if (Array.isArray(x)) return x.reduce((acc, v) => acc + toNumber(v), 0)
  return NaN
}

function evaluate(node: any, answers: Record<string, any>): number {
  switch (node.type) {
    case 'num': return node.value
    case 'ref': return toNumber(answers[node.name])
    case 'unary': {
      const v = evaluate(node.arg, answers)
      return node.op === '-' ? -v : v
    }
    case 'bin': {
      const a = evaluate(node.left, answers)
      const b = evaluate(node.right, answers)
      switch (node.op) {
        case '+': return a + b
        case '-': return a - b
        case '*': return a * b
        case '/': return b === 0 ? 0 : a / b
      }
      return NaN
    }
    case 'call': {
      const xs = node.args.map((a: any) => evaluate(a, answers))
      switch (node.fn) {
        case 'sum': return xs.reduce((a: number, b: number) => a + b, 0)
        case 'min': return Math.min(...xs)
        case 'max': return Math.max(...xs)
        case 'avg': return xs.length ? xs.reduce((a: number, b: number) => a + b, 0) / xs.length : 0
        case 'round': return Math.round(xs[0])
        case 'floor': return Math.floor(xs[0])
        case 'ceil': return Math.ceil(xs[0])
        case 'abs': return Math.abs(xs[0])
      }
      return NaN
    }
  }
  return NaN
}

export function evaluateFormula(expr: string, answers: Record<string, any>): number | null {
  try {
    const ast = parse(tokenize(expr))
    const result = evaluate(ast, answers)
    return Number.isFinite(result) ? result : null
  } catch {
    return null
  }
}
