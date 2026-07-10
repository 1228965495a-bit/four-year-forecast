from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import docx


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = ROOT / "src" / "data" / "script"
BY_MAJOR = SCRIPT_DIR / "byMajor"

MAJOR_ID = "clinical_medicine"
DOCX_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/Users/zhenzhen/Downloads/S04-临床医学-完整四年脚本补强包.docx")

SEMESTER_MAP = {
    "大一上": "y1s1",
    "大一下": "y1s2",
    "大二上": "y2s1",
    "大二下": "y2s2",
    "大三上": "y3s1",
    "大三下": "y3s2",
    "大四上": "y4s1",
    "大四下": "y4s2",
    "随机": None,
}

TYPE_MAP = {
    "主线事件": "main",
    "随机事件": "major_random",
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
    "发际线余额": "hairline",
}

MAJOR_STAT_MAP = {
    "背诵负荷": "medicalLoad",
    "临床敬畏值": "clinicalRespect",
    "规培阴影": "examPressure",
}

HIDDEN_STAT_MAP = {
    "摸鱼值": "slacking",
    "社交能量": "socialEnergy",
}

ROUTE_MARKER_MAP = {
    "postgraduate_track": "clinical_medicine_route_postgrad",
    "ending_bias:clinical_long_runner": "clinical_medicine_route_clinical",
    "ending_bias:research_or_postgrad": "clinical_medicine_route_research",
    "ending_bias:clear_exit": "clinical_medicine_route_public_health",
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
            major_stats[key] = major_stats.get(key, 0) + delta
        elif name in HIDDEN_STAT_MAP:
            key = HIDDEN_STAT_MAP[name]
            hidden_stats[key] = hidden_stats.get(key, 0) + delta
    return stats, major_stats, hidden_stats


def make_achievement_ids(paragraphs: list[str]) -> dict[str, str]:
    names: list[str] = []
    for idx, line in enumerate(paragraphs):
        if line == "9. 成就" and idx + 1 < len(paragraphs):
            names = split_slash(paragraphs[idx + 1])
            break
    return {name: f"ach_{MAJOR_ID}_doc_{i:03d}" for i, name in enumerate(names, 1)}


def option_to_choice(option: dict, event_id: str, idx: int, achievement_ids: dict[str, str]) -> dict:
    choice_id = ["a", "b", "c"][idx]
    tags = split_slash(option.get("选项标签", ""))
    markers = split_slash(option.get("路线/成就标记", ""))
    stats, major_stats, hidden_stats = parse_delta(option.get("数值变化", ""))
    route_add = [ROUTE_MARKER_MAP[m] for m in markers if m in ROUTE_MARKER_MAP]

    flags = [f"{MAJOR_ID}_tag_{tag}" for tag in tags]
    for marker in markers:
        flags.append(f"{MAJOR_ID}_route_marker_{marker}")

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
    options = [option_to_choice(option, event_id, idx, achievement_ids) for idx, option in enumerate(raw.get("options", []))]
    event_type = TYPE_MAP.get(raw.get("事件类型", ""), raw.get("事件类型", "main"))
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
        if line.startswith("5. 中途 GG"):
            break
        if re.match(r"^clinical_medicine_(?:y\d+s\d+_main|random)_\d+", line):
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


def parse_initials(line: str) -> tuple[dict[str, int], dict[str, int]]:
    stats: dict[str, int] = {}
    major_stats: dict[str, int] = {}
    for name, raw in re.findall(r"([\u4e00-\u9fff]+)\s*(\d+)", line):
        if name in GLOBAL_STAT_MAP:
            stats[GLOBAL_STAT_MAP[name]] = int(raw)
        elif name in MAJOR_STAT_MAP:
            major_stats[MAJOR_STAT_MAP[name]] = int(raw)
    return stats, major_stats


def read_settings(paragraphs: list[str]) -> dict:
    intro = {}
    initial_stats = {}
    initial_major_stats = {}
    share_texts: list[str] = []
    for line in paragraphs:
        if line.startswith("开场标题："):
            intro["title"] = field_value(line)
        elif line.startswith("开场描述："):
            intro["body"] = field_value(line)
        elif line.startswith("系统提醒："):
            intro["body"] = f"{intro.get('body', '')}\n\n{field_value(line)}".strip()
        elif line.startswith("系统吐槽："):
            intro["body"] = f"{intro.get('body', '')}\n\n{field_value(line)}".strip()
        elif line.startswith("进入按钮："):
            intro["startButton"] = field_value(line)
        elif line.startswith("初始数值："):
            initial_stats, initial_major_stats = parse_initials(field_value(line))
        elif line.startswith("分享文案"):
            share_texts.append(field_value(line))
    return {
        "intro": intro,
        "initialStats": initial_stats,
        "initialMajorStats": initial_major_stats,
        "shareTexts": share_texts,
    }


def condition_from_text(text: str) -> dict:
    conditions = []
    for name, op, raw in re.findall(r"([\u4e00-\u9fff]+)\s*(>=|<=|>|<|=)\s*(\d+)", text):
        if name in GLOBAL_STAT_MAP:
            conditions.append({"type": "stat", "key": GLOBAL_STAT_MAP[name], "op": "==" if op == "=" else op, "value": int(raw)})
        elif name in MAJOR_STAT_MAP:
            conditions.append({"type": "majorStat", "key": MAJOR_STAT_MAP[name], "op": "==" if op == "=" else op, "value": int(raw)})
    return conditions[0] if len(conditions) == 1 else {"all": conditions}


def read_endings(paragraphs: list[str]) -> list[dict]:
    endings = []
    current: dict | None = None
    priority = 80
    for line in paragraphs:
        if re.match(r"^clinical_medicine_ending_\d+", line):
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
            current["title"] = f"临床医学·{field_value(line)}"
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
        ending.setdefault("title", ending.get("id", "临床医学结局"))
        ending.setdefault("description", "")
        ending.setdefault("condition", {})
        ending.setdefault("shareText", f"我在临床医学副本里活成了：{ending['title']}。")
        ending.setdefault("advice", ending["description"])
    return endings


def update_major_config(new_events: list[dict], new_endings: list[dict], settings: dict, achievement_ids: dict[str, str]) -> None:
    path = SCRIPT_DIR / "majors.json"
    majors = json.loads(path.read_text())
    for major in majors:
        if major["id"] != MAJOR_ID:
            continue
        major["intro"] = settings["intro"] or major.get("intro", {})
        major["initialStats"].update(settings["initialStats"])
        for stat in major["majorStats"]:
            if stat["key"] in settings["initialMajorStats"]:
                stat["initialValue"] = settings["initialMajorStats"][stat["key"]]
            if stat["key"] == "medicalLoad":
                stat["name"] = "背诵负荷"
                stat["description"] = "基础医学、病理药理和长期背诵带来的负荷。"
            elif stat["key"] == "clinicalRespect":
                stat["name"] = "临床敬畏值"
                stat["description"] = "面对人体、病房和真实责任时形成的敬畏。"
            elif stat["key"] == "examPressure":
                stat["name"] = "规培阴影"
                stat["description"] = "考研、科室选择、长线培养和规培传说带来的阴影。"
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

    existing_events = json.loads((BY_MAJOR / "clinical_medicine.events.json").read_text())
    keep = [event for event in existing_events if event.get("type") not in {"main", "major_random"}]
    clinical_events = new_events + keep

    achievements = [
        {
            "id": achievement_id,
            "achievementId": achievement_id,
            "majorId": MAJOR_ID,
            "title": title,
            "description": f"在临床医学副本中解锁「{title}」。",
            "condition": {"type": "flag", "key": achievement_id},
            "shareText": f"我在临床医学副本里解锁了：{title}。",
        }
        for title, achievement_id in achievement_ids.items()
    ]

    (BY_MAJOR / "clinical_medicine.events.json").write_text(json.dumps(clinical_events, ensure_ascii=False) + "\n")
    (BY_MAJOR / "clinical_medicine.endings.json").write_text(json.dumps(new_endings, ensure_ascii=False) + "\n")
    (BY_MAJOR / "clinical_medicine.achievements.json").write_text(json.dumps(achievements, ensure_ascii=False) + "\n")
    update_major_config(new_events, new_endings, settings, achievement_ids)
    update_aggregate("events.json", clinical_events)
    update_aggregate("endings.json", new_endings)
    update_aggregate("achievements.json", achievements)

    print(f"imported {len(new_events)} clinical events, {len(new_endings)} endings, {len(achievements)} achievements")


if __name__ == "__main__":
    main()
