# detect.py: which skills did each trigger-test subagent load?
# Usage: python -I detect.py <subagents-transcript-dir>   (reads runs.json: {"<query id>": "<agentId>", ...})
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SUB = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/.claude/projects")  # folder holding agent-<id>.jsonl transcripts
queries = {str(q["id"]): q for q in json.load(open(os.path.join(HERE, "queries.json"), encoding="utf-8"))}
runs = json.load(open(os.path.join(HERE, "runs.json"), encoding="utf-8"))

rows, results = [], {}
for qid, agent in sorted(runs.items(), key=lambda kv: int(kv[0])):
    path = os.path.join(SUB, f"agent-{agent}.jsonl")
    skills, reads, models, tools = [], [], set(), 0
    if os.path.exists(path):
        for line in open(path, encoding="utf-8"):
            d = json.loads(line)
            if d.get("type") != "assistant":
                continue
            msg = d.get("message", {})
            models.add(msg.get("model"))
            for b in msg.get("content", []) if isinstance(msg.get("content"), list) else []:
                if b.get("type") != "tool_use":
                    continue
                tools += 1
                inp = b.get("input", {})
                if b["name"] == "Skill":
                    skills.append(inp.get("skill"))
                text = json.dumps(inp)
                if "SKILL.md" in text:
                    reads.append(text[text.find("skills"):][:80])
    q = queries[qid]
    fired = any(s and "material-design-web" in s for s in skills) or any("material-design-web" in r for r in reads)
    ok = fired == q["expect"]
    results[qid] = {"expect": q["expect"], "fired": fired, "skills": skills, "skill_md_reads": reads, "tool_calls": tools, "models": sorted(m for m in models if m), "ok": ok}
    rows.append(f'{qid:>2} {"PASS" if ok else "FAIL"} expect={"Y" if q["expect"] else "N"} fired={"Y" if fired else "N"} skills={skills} tools={tools} {q["query"][:60]}')

print("\n".join(rows))
done = [r for r in results.values()]
tp = sum(r["fired"] and r["expect"] for r in done); fn = sum((not r["fired"]) and r["expect"] for r in done)
fp = sum(r["fired"] and not r["expect"] for r in done); tn = sum((not r["fired"]) and not r["expect"] for r in done)
print(f"\nshould-trigger: {tp}/{tp+fn} fired | should-not: {tn}/{tn+fp} stayed quiet | accuracy {(tp+tn)}/{len(done)}")
json.dump(results, open(os.path.join(HERE, "results.json"), "w", encoding="utf-8"), indent=1)
