#!/usr/bin/env python3
"""
Preview do que scripts/embed-docs.ts vai gerar — sem npm install.

Lê docs/sources/**/*.md, simula o chunking (~800 tokens, overlap ~100,
quebra em H2/H3 e linhas em branco) e imprime um resumo.

Uso: python scripts/preview-chunks.py
"""
import os
import re
import sys
from pathlib import Path

CHARS_PER_TOKEN = 4
CHUNK_TARGET_CHARS = 800 * CHARS_PER_TOKEN
SOURCES = Path("docs/sources")

def parse_frontmatter(text):
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}, text
    fm_raw = text[4:end]
    body = text[end + 5:]
    # parse super-leve só pra extrair campos-chave (não-genérico)
    meta = {}
    for line in fm_raw.splitlines():
        m = re.match(r'^([a-z_]+):\s*"?([^"]*?)"?\s*$', line)
        if m:
            meta[m.group(1)] = m.group(2)
    return meta, body

def split_blocks(markdown, start_page):
    blocks = []
    buf = []
    page = start_page
    def flush():
        text = "\n".join(buf).strip()
        if text:
            is_heading = bool(re.match(r"^#{2,3}\s", text))
            blocks.append({"text": text, "page": page, "heading": is_heading})
    for line in markdown.split("\n"):
        m = re.match(r"<!--\s*page:\s*(\d+)\s*-->", line)
        if m:
            flush(); buf.clear(); page = int(m.group(1)); continue
        if re.match(r"^#{2,3}\s", line):
            flush(); buf.clear(); buf.append(line); continue
        if line.strip() == "":
            flush(); buf.clear(); continue
        buf.append(line)
    flush()
    return blocks

def aggregate(blocks, header):
    chunks = []
    cur = ""
    cur_page = None
    last_heading = ""
    for b in blocks:
        if b["heading"]:
            last_heading = b["text"]
            if cur and len(cur) >= CHUNK_TARGET_CHARS * 0.5:
                chunks.append({"text": cur.strip(), "page": cur_page})
                cur = ""; cur_page = None
            continue
        prefix = "\n\n" if cur else f"{header}{last_heading + '\\n\\n' if last_heading else ''}"
        cand = cur + prefix + b["text"]
        if len(cand) <= CHUNK_TARGET_CHARS:
            if not cur:
                cur_page = b["page"]
            cur = cand
        else:
            if cur:
                chunks.append({"text": cur.strip(), "page": cur_page})
            cur = f"{header}{last_heading + chr(10) + chr(10) if last_heading else ''}{b['text']}"
            cur_page = b["page"]
    if cur:
        chunks.append({"text": cur.strip(), "page": cur_page})
    return chunks

total_chunks = 0
total_chars = 0
rows = []

for md in sorted(SOURCES.rglob("*.md")):
    raw = md.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(raw)
    start_page = int(meta.get("page_start", 1))
    title = meta.get("title", md.name)
    section = meta.get("section_slug", md.stem)
    blocks = split_blocks(body, start_page)
    chunks = aggregate(blocks, f"# {title}\n\n")
    chars = sum(len(c["text"]) for c in chunks)
    pages = sorted({c["page"] for c in chunks})
    rows.append({
        "file": str(md).replace("\\", "/"),
        "section": section,
        "blocks": len(blocks),
        "chunks": len(chunks),
        "tokens_est": round(chars / CHARS_PER_TOKEN),
        "pages": f"{min(pages)}-{max(pages)}" if pages else "—",
    })
    total_chunks += len(chunks)
    total_chars += chars

# Imprime tabela
col_widths = {k: max(len(k), max(len(str(r[k])) for r in rows)) for k in rows[0].keys()}
header = " | ".join(k.ljust(col_widths[k]) for k in rows[0].keys())
print(header)
print("-" * len(header))
for r in rows:
    print(" | ".join(str(r[k]).ljust(col_widths[k]) for k in r.keys()))
print()
print(f"Total: {total_chunks} chunks · ~{round(total_chars / CHARS_PER_TOKEN):,} tokens · {total_chars / 1024:.1f} KiB".replace(",", "."))
