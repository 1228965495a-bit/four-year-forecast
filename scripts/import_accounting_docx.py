from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import docx


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = ROOT / "src" / "data" / "script"
BY_MAJOR = SCRIPT_DIR / "byMajor"

MAJOR_ID = "accounting"
DOCX_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/Users/zhenzhen/Downloads/S06-会计学-完整四年脚本补强包.docx")

SEMESTER_MAP = {
    "大一上": "y1s1",
    "大一下": "y1s2",
    "大二上": "y2s1",
    "大二下": "y2s2",
    "大三上": "y3s1",
    "大三下": "y3s2",
    "大四上": "y4s1",
    "大四下": "y4s2",
    "随机触发": None,
    "随机": None,
}

TYPE_MAP = {
    "主线事件": "main",
    "随机事件": "major_random",
    "random": "major_random",
}

GLOBAL_STAT_MAP = {
    "专业上头值": "obsession",
    "上头值": "obsession",
    "精神电量": "energy",
    "滤镜": "filter",
    "绩点意志": "gpaWill",
    "职业幻觉": "careerFantasy",
    "就业幻觉": "careerFantasy",
    "逃跑冲动": "escapeImpulse",
    "嘴硬浓度": "stubbornness",
    "发际线": "hairline",
}

MAJOR_STAT_MAP = {
    "借贷平衡感": "entryBalance",
    "准则敏感度": "entryBalance",
    "成本敏感度": "entryBalance",
    "CPA阴影": "cpaShadow",
    "审计嗅觉": "auditPressure",
    "审计压力": "auditPressure",
}

MAJOR_STAT_SCALE = {
    "entryBalance": 3,
    "cpaShadow": 4,
    "auditPressure": 3,
}

HIDDEN_STAT_MAP = {
    "税法敏感度": "taxSensitivity",
    "月末阴影": "monthEndShadow",
    "职场祛魅": "careerReality",
    "Excel依赖": "excelDependence",
    "风险意识": "riskAwareness",
    "稳定偏好": "stablePreference",
    "社交能量": "socialEnergy",
    "亲戚期待": "relativeExpectation",
    "领导力": "leadership",
    "转专业暗线": "transferThought",
    "临表恐惧": "statementFear",
}

HIDDEN_STAT_SCALE = 5

ROUTE_MARKER_MAP = {
    "transfer_major_hint": "accounting_transfer_window",
    "stable_career_track": "accounting_route_civil_service",
    "audit_track": "accounting_route_audit",
    "cpa_track": "accounting_route_cpa",
    "corporate_finance_track": "accounting_route_corporate_finance",
    "postgraduate_track": "accounting_route_postgrad",
}


def split_slash(value: str) -> list[str]:
    return [part.strip() for part in re.split(r"[/／]", value or "") if part.strip()]


def field_value(line: str) -> str:
    return line.split("：", 1)[1].strip()


def parse_delta(value: str) -> tuple[dict[str, int], dict[str, int], dict[str, int]]:
    stats: dict[str, int] = {}
    major_stats: dict[str, int] = {}
    hidden_stats: dict[str, int] = {}
    for piece in re.split(r"[，,、;；]", value or ""):
        piece = piece.strip()
        if not piece:
            continue
        match = re.match(r"(.+?)\s*([+-])\s*(\d+)", piece)
        if not match:
            continue
        name, sign, raw = match.groups()
        delta = int(raw) * (1 if sign == "+" else -1)
        name = name.strip()
        if name in GLOBAL_STAT_MAP:
            key = GLOBAL_STAT_MAP[name]
            stats[key] = stats.get(key, 0) + delta
        elif name in MAJOR_STAT_MAP:
            key = MAJOR_STAT_MAP[name]
            delta *= MAJOR_STAT_SCALE.get(key, 1)
            major_stats[key] = major_stats.get(key, 0) + delta
        elif name in HIDDEN_STAT_MAP:
            key = HIDDEN_STAT_MAP[name]
            delta *= HIDDEN_STAT_SCALE
            hidden_stats[key] = hidden_stats.get(key, 0) + delta
    return stats, major_stats, hidden_stats


def make_achievement_ids(paragraphs: list[str]) -> dict[str, str]:
    names: list[str] = []
    for idx, line in enumerate(paragraphs):
        if line == "十、成就":
            cursor = idx + 1
            while cursor < len(paragraphs) and paragraphs[cursor].startswith("- "):
                names.append(paragraphs[cursor][2:].strip())
                cursor += 1
            break
    return {name: f"ach_{MAJOR_ID}_doc_{i:03d}" for i, name in enumerate(names, 1)}


def option_to_choice(option: dict, idx: int, achievement_ids: dict[str, str]) -> dict:
    choice_id = ["a", "b", "c"][idx]
    tags = split_slash(option.get("选项标签", ""))
    markers = split_slash(option.get("路线/成就标记", ""))
    stats, major_stats, hidden_stats = parse_delta(option.get("数值变化", ""))
    route_add = [ROUTE_MARKER_MAP[m] for m in markers if m in ROUTE_MARKER_MAP and not m.endswith("_window")]

    flags = [f"{MAJOR_ID}_tag_{tag}" for tag in tags]
    for marker in markers:
        flags.append(f"{MAJOR_ID}_route_marker_{marker}")
        if marker == "transfer_major_hint":
            hidden_stats["transferThought"] = hidden_stats.get("transferThought", 0) + 1

    unlocked = []
    for tag in tags:
        achievement_id = achievement_ids.get(tag)
        if achievement_id:
            unlocked.append(achievement_id)
            flags.append(achievement_id)

    effects = {}
    if stats:
        effects["stats"] = stats
    if major_stats:
        effects["majorStats"] = major_stats
    if hidden_stats:
        effects["hiddenStats"] = hidden_stats
    if flags:
        effects["flagsAdd"] = sorted(set(flags), key=flags.index)
    if route_add:
        effects["routeAdd"] = sorted(set(route_add), key=route_add.index)
    if unlocked:
        effects["achievementIds"] = sorted(set(unlocked), key=unlocked.index)

    text = option.get("按钮文案", "").strip()
    feedback = option.get("反馈文案", "").strip()
    return {
        "id": choice_id,
        "choiceId": choice_id,
        "text": text,
        "feedback": feedback,
        "resultText": feedback,
        "effects": effects,
        "statChanges": stats,
        "routeChanges": route_add,
        "condition": None,
        "tagsUnlocked": tags,
        "achievementUnlocked": sorted(set(unlocked), key=unlocked.index),
        "nextEventId": None,
        "nextEvent": None,
    }


def finalize_event(raw: dict, achievement_ids: dict[str, str]) -> dict:
    event_id = raw["事件ID"]
    event_type = TYPE_MAP.get(raw.get("事件类型", ""), raw.get("事件类型", "main"))
    options = [option_to_choice(option, idx, achievement_ids) for idx, option in enumerate(raw.get("options", []))]
    return {
        "id": event_id,
        "eventId": event_id,
        "majorId": MAJOR_ID,
        "title": raw.get("事件标题", ""),
        "type": event_type,
        "semester": SEMESTER_MAP.get(raw.get("学年学期", ""), raw.get("学年学期")),
        "stage": "middle" if event_type == "main" else "random",
        "description": raw.get("事件描述", ""),
        "tags": split_slash(raw.get("标签", "")),
        "weight": 1,
        "conditions": {},
        "triggerCondition": {},
        "options": options,
        "choices": options,
        "fallbackEventId": None,
        "resultText": "",
        "statChanges": {},
        "routeChanges": [],
        "tagsUnlocked": [],
        "achievementUnlocked": [],
        "nextEvent": None,
        "body": raw.get("事件描述", ""),
    }


def read_events(paragraphs: list[str], achievement_ids: dict[str, str]) -> list[dict]:
    events: list[dict] = []
    current: dict | None = None
    current_option: dict | None = None

    def flush() -> None:
        nonlocal current, current_option
        if current and current.get("事件ID"):
            events.append(finalize_event(current, achievement_ids))
        current = None
        current_option = None

    for line in paragraphs:
        if line.startswith("六、中途 GG"):
            break
        if re.match(r"^accounting_(?:y\d+s\d+_main|random)_\d+", line):
            flush()
            current = {"options": []}
            current_option = None
            continue
        if current is None:
            continue
        if re.match(r"^选项[ABC]：$", line):
            current_option = {}
            current["options"].append(current_option)
            continue
        if current_option is not None:
            for key in ["按钮文案", "反馈文案", "数值变化", "选项标签", "路线/成就标记"]:
                if line.startswith(f"{key}："):
                    current_option[key] = field_value(line)
                    break
            continue
        for key in ["事件ID", "学年学期", "事件类型", "事件标题", "事件描述", "标签"]:
            if line.startswith(f"{key}："):
                current[key] = field_value(line)
                break
    flush()
    return events


def read_settings(paragraphs: list[str]) -> dict:
    intro = {}
    share_texts = []
    for line in paragraphs:
        if line.startswith("开场标题："):
            intro["title"] = field_value(line)
        elif line.startswith("开场文案："):
            intro["body"] = field_value(line)
        elif line.startswith("系统提醒："):
            intro["body"] = f"{intro.get('body', '')}\n\n{field_value(line)}".strip()
        elif line.startswith("系统吐槽："):
            intro["body"] = f"{intro.get('body', '')}\n\n{field_value(line)}".strip()
        elif line.startswith("进入按钮："):
            intro["startButton"] = field_value(line)
        elif line.startswith("分享文案"):
            share_texts.append(field_value(line))
    return {"intro": intro, "shareTexts": share_texts}


def condition_from_text(text: str) -> dict:
    conditions = []
    for name, op, raw in re.findall(r"([A-Za-z0-9_\u4e00-\u9fff]+)\s*(>=|<=|>|<|=)\s*(\d+)", text):
        if name in GLOBAL_STAT_MAP:
            conditions.append({"type": "stat", "key": GLOBAL_STAT_MAP[name], "op": "==" if op == "=" else op, "value": int(raw)})
        elif name in MAJOR_STAT_MAP:
            conditions.append({"type": "majorStat", "key": MAJOR_STAT_MAP[name], "op": "==" if op == "=" else op, "value": int(raw)})
        elif name in HIDDEN_STAT_MAP:
            conditions.append({"type": "hiddenStat", "key": HIDDEN_STAT_MAP[name], "op": "==" if op == "=" else op, "value": int(raw)})
    return conditions[0] if len(conditions) == 1 else {"all": conditions}


def read_endings(paragraphs: list[str]) -> list[dict]:
    endings = []
    current: dict | None = None
    priority = 80
    for line in paragraphs:
        if re.match(r"^accounting_ending_\d+", line):
            if current:
                endings.append(current)
            current = {"priority": priority}
            priority -= 5
            continue
        if current is None:
            continue
        if line.startswith("结局ID："):
            ending_id = field_value(line)
            current["id"] = ending_id
            current["endingId"] = ending_id
        elif line.startswith("结局名："):
            current["title"] = f"会计学·{field_value(line)}"
        elif line.startswith("触发条件："):
            current["condition"] = condition_from_text(field_value(line))
        elif line.startswith("一句话总结："):
            current["description"] = field_value(line)
        elif line.startswith("系统诊断："):
            current["advice"] = field_value(line)
        elif line.startswith("分享文案："):
            current["shareText"] = field_value(line)
    if current:
        endings.append(current)

    for ending in endings:
        ending["majorId"] = MAJOR_ID
        ending.setdefault("title", ending.get("id", "会计学结局"))
        ending.setdefault("description", "")
        ending.setdefault("condition", {})
        ending.setdefault("shareText", f"我在会计学副本里活成了：{ending['title']}。")
        ending.setdefault("advice", ending["description"])
    return endings


def update_major_config(new_events: list[dict], new_endings: list[dict], settings: dict, achievement_ids: dict[str, str]) -> None:
    path = SCRIPT_DIR / "majors.json"
    majors = json.loads(path.read_text())
    for major in majors:
        if major["id"] != MAJOR_ID:
            continue
        major["intro"] = settings["intro"] or major.get("intro", {})
        for stat in major["majorStats"]:
            if stat["key"] == "entryBalance":
                stat["name"] = "借贷平衡感"
                stat["description"] = "理解分录、报表、对账和会计等式的能力。"
                stat["initialValue"] = 18
            elif stat["key"] == "cpaShadow":
                stat["name"] = "CPA阴影"
                stat["description"] = "证书焦虑与长期备考压力。"
                stat["initialValue"] = 10
            elif stat["key"] == "auditPressure":
                stat["name"] = "审计压力"
                stat["description"] = "审计、税法、底稿、证据和风险意识带来的压力。"
                stat["initialValue"] = 8
        main_by_sem = {event["semester"]: event["id"] for event in new_events if event["type"] == "main"}
        for item in major["timeline"]:
            sem = item.get("key") or item.get("semester")
            if sem in main_by_sem:
                item["mainEventIds"] = [main_by_sem[sem]]
                item["theme"] = next(e["title"] for e in new_events if e["id"] == main_by_sem[sem])
        major["randomEvents"] = [event["id"] for event in new_events if event["type"] == "major_random"]
        major["achievements"] = list(achievement_ids.values())
        major["endings"] = [ending["id"] for ending in new_endings]
        if settings["shareTexts"]:
            major["shareTexts"] = settings["shareTexts"]
        break
    path.write_text(json.dumps(majors, ensure_ascii=False, indent=2) + "\n")


def update_aggregate(filename: str, major_items: list[dict]) -> None:
    path = SCRIPT_DIR / filename
    data = json.loads(path.read_text())
    data = [item for item in data if item.get("majorId") != MAJOR_ID] + major_items
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def main() -> None:
    paragraphs = [p.text.strip() for p in docx.Document(DOCX_PATH).paragraphs if p.text.strip()]
    achievement_ids = make_achievement_ids(paragraphs)
    new_events = read_events(paragraphs, achievement_ids)
    new_endings = read_endings(paragraphs)
    settings = read_settings(paragraphs)

    existing_events = json.loads((BY_MAJOR / "accounting.events.json").read_text())
    keep = [event for event in existing_events if event.get("type") not in {"main", "major_random"}]
    accounting_events = new_events + keep

    achievements = [
        {
            "id": achievement_id,
            "achievementId": achievement_id,
            "majorId": MAJOR_ID,
            "title": title,
            "description": f"在会计学副本中解锁「{title}」。",
            "condition": {"type": "flag", "key": achievement_id},
            "shareText": f"我在会计学副本里解锁了：{title}。",
        }
        for title, achievement_id in achievement_ids.items()
    ]

    (BY_MAJOR / "accounting.events.json").write_text(json.dumps(accounting_events, ensure_ascii=False) + "\n")
    (BY_MAJOR / "accounting.endings.json").write_text(json.dumps(new_endings, ensure_ascii=False) + "\n")
    (BY_MAJOR / "accounting.achievements.json").write_text(json.dumps(achievements, ensure_ascii=False) + "\n")
    update_major_config(new_events, new_endings, settings, achievement_ids)
    update_aggregate("events.json", accounting_events)
    update_aggregate("endings.json", new_endings)
    update_aggregate("achievements.json", achievements)

    print(f"imported {len(new_events)} accounting events, {len(new_endings)} endings, {len(achievements)} achievements")


if __name__ == "__main__":
    main()
