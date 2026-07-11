from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import docx


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = ROOT / "src" / "data" / "script"
BY_MAJOR = SCRIPT_DIR / "byMajor"

MAJOR_ID = "chinese_language_literature"
DOCX_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/Users/zhenzhen/Downloads/A01-汉语言文学-完整四年脚本补强包.docx")

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
    "随机事件": None,
}

GLOBAL_STAT_MAP = {
    "上头值": "obsession",
    "精神电量": "energy",
    "滤镜": "filter",
    "绩点意志": "gpaWill",
    "就业幻觉": "careerFantasy",
    "逃跑冲动": "escapeImpulse",
    "stubbornness": "stubbornness",
    "嘴硬浓度": "stubbornness",
}

MAJOR_STAT_MAP = {
    "文学滤镜": "literaryFilter",
    "literatureFilter": "literaryFilter",
    "背诵负荷": "memorizationLoad",
    "memorizationLoad": "memorizationLoad",
    "文论眩晕": "theoryDizziness",
    "theoryDizziness": "theoryDizziness",
    "表达冲动": "writingImpulse",
    "writingImpulse": "writingImpulse",
    "考公召唤": "civilServiceCall",
    "civilServiceCall": "civilServiceCall",
}

ROUTE_MARKER_MAP = {
    "postgraduate_track": "chinese_language_literature_route_postgrad",
    "teacher_track": "chinese_language_literature_route_teaching",
    "content_career_track": "chinese_language_literature_route_content",
    "clear_expression_ending": "chinese_language_literature_route_clear_expression",
    "verbal_survivor": "chinese_language_literature_route_verbal_survivor",
    "humanities_clear_ending": "chinese_language_literature_route_humanities_clear",
}

MAJOR_STAT_SCALE = {
    "literaryFilter": 1,
    "memorizationLoad": 3,
    "theoryDizziness": 3,
    "writingImpulse": 3,
    "civilServiceCall": 3,
}

MAJOR_STAT_META = {
    "literaryFilter": ("文学滤镜", "对“我将拥有一个很文学的人生”的幻想浓度。"),
    "memorizationLoad": ("背诵负荷", "古代文学、文学史、作品选、作家作品、名词解释共同制造的记忆压力。"),
    "theoryDizziness": ("文论眩晕", "能指、所指、主体、他者、现代性、文本间性等概念造成的精神雾霾。"),
    "writingImpulse": ("表达冲动", "想写点什么、讲点什么、做内容、写论文、发朋友圈小作文的冲动。"),
    "civilServiceCall": ("考公召唤", "宇宙尽头向中文系发来的低频但持续的召唤。"),
}


def field_value(line: str) -> str:
    return line.split("：", 1)[1].strip()


def split_slash(value: str) -> list[str]:
    return [part.strip() for part in re.split(r"[/／]", value or "") if part.strip()]


def parse_delta(value: str) -> tuple[dict[str, int], dict[str, int]]:
    stats: dict[str, int] = {}
    major_stats: dict[str, int] = {}
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
    return stats, major_stats


def make_achievement_ids(paragraphs: list[str]) -> dict[str, str]:
    for line in paragraphs:
        if line.startswith("十、成就"):
            continue
        if line.startswith("古代文学年表幸存者"):
            names = split_slash(line)
            return {name: f"ach_{MAJOR_ID}_doc_{i:03d}" for i, name in enumerate(names, 1)}
    for line in paragraphs:
        if "古代文学年表幸存者" in line:
            names = split_slash(line.split("：", 1)[-1])
            return {name: f"ach_{MAJOR_ID}_doc_{i:03d}" for i, name in enumerate(names, 1)}
    return {}


def option_to_choice(option: dict, idx: int, achievement_ids: dict[str, str]) -> dict:
    choice_id = ["a", "b", "c"][idx]
    tags = split_slash(option.get("选项标签", ""))
    marker = option.get("路线标记", "").strip()
    stats, major_stats = parse_delta(option.get("数值变化", ""))

    route_add = []
    if marker:
        tags.append(marker)
        route = ROUTE_MARKER_MAP.get(marker)
        if route:
            route_add.append(route)

    flags = [f"{MAJOR_ID}_tag_{tag}" for tag in tags]
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
    if flags:
        effects["flagsAdd"] = sorted(set(flags), key=flags.index)
    if route_add:
        effects["routeAdd"] = sorted(set(route_add), key=route_add.index)
    if unlocked:
        effects["achievementIds"] = sorted(set(unlocked), key=unlocked.index)

    feedback = option.get("反馈文案", "").strip()
    return {
        "id": choice_id,
        "choiceId": choice_id,
        "text": option.get("按钮文案", "").strip(),
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
    is_random = "_random_" in event_id
    options = [option_to_choice(option, idx, achievement_ids) for idx, option in enumerate(raw.get("options", []))]
    return {
        "id": event_id,
        "eventId": event_id,
        "majorId": MAJOR_ID,
        "title": raw.get("事件标题", ""),
        "type": "major_random" if is_random else "main",
        "semester": SEMESTER_MAP.get(raw.get("学年学期", ""), raw.get("学年学期")),
        "stage": "random" if is_random else "middle",
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
        if line.startswith("事件ID："):
            flush()
            current = {"事件ID": field_value(line), "options": []}
            current_option = None
            continue
        if current is None:
            continue
        if re.match(r"^选项[ABC]：?$", line):
            current_option = {}
            current["options"].append(current_option)
            continue
        if current_option is not None:
            for key in ["按钮文案", "反馈文案", "数值变化", "选项标签", "路线标记", "成就触发"]:
                if line.startswith(f"{key}："):
                    current_option[key] = field_value(line)
                    break
            continue
        for key in ["学年学期", "事件标题", "事件描述", "标签"]:
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
        elif line.startswith("系统吐槽："):
            intro["body"] = f"{intro.get('body', '')}\n\n{field_value(line)}".strip()
        elif line.startswith("进入按钮："):
            intro["startButton"] = field_value(line)
        elif line.startswith("分享文案 "):
            share_texts.append(field_value(line))
    return {"intro": intro, "shareTexts": share_texts}


def condition_from_text(text: str) -> dict:
    text = text.replace("，", "且").replace(",", "且")
    parts = [part.strip() for part in text.split("或") if part.strip()]

    def parse_and(part: str) -> dict:
        conditions = []
        for name, op, raw in re.findall(r"([\u4e00-\u9fffA-Za-z0-9_]+)\s*(>=|<=|>|<|=|==)\s*(\d+)", part):
            name = name.strip().removeprefix("且").strip()
            if name in GLOBAL_STAT_MAP:
                conditions.append({"type": "stat", "key": GLOBAL_STAT_MAP[name], "op": "==" if op == "=" else op, "value": int(raw)})
            elif name in MAJOR_STAT_MAP:
                conditions.append({"type": "majorStat", "key": MAJOR_STAT_MAP[name], "op": "==" if op == "=" else op, "value": int(raw)})
        for marker in ROUTE_MARKER_MAP:
            if f"{marker} 已触发" in part:
                conditions.append({"type": "route", "key": ROUTE_MARKER_MAP[marker]})
        return conditions[0] if len(conditions) == 1 else {"all": conditions}

    if len(parts) > 1:
        return {"any": [parse_and(part) for part in parts]}
    return parse_and(text)


def read_endings(paragraphs: list[str]) -> list[dict]:
    endings = []
    current: dict | None = None
    priority = 80
    in_endings = False
    for line in paragraphs:
        if line.startswith("七、终局结局"):
            in_endings = True
            continue
        if in_endings and line.startswith("八、"):
            break
        if not in_endings:
            continue
        if line.startswith("结局ID："):
            if current:
                endings.append(current)
            ending_id = field_value(line)
            current = {"id": ending_id, "endingId": ending_id, "priority": priority}
            priority -= 5
            continue
        if current is None:
            continue
        if line.startswith("结局名："):
            current["title"] = f"汉语言文学·{field_value(line)}"
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
        ending.setdefault("title", ending.get("id", "汉语言文学结局"))
        ending.setdefault("description", "")
        ending.setdefault("condition", {})
        ending.setdefault("shareText", f"我在汉语言文学副本里活成了：{ending['title']}。")
        ending.setdefault("advice", ending["description"])
    return endings


def update_major_config(new_events: list[dict], endings: list[dict], achievements: list[dict], keep_events: list[dict], settings: dict) -> None:
    path = SCRIPT_DIR / "majors.json"
    majors = json.loads(path.read_text())
    for major in majors:
        if major["id"] != MAJOR_ID:
            continue
        major["intro"] = settings["intro"] or major.get("intro", {})
        existing_by_key = {stat["key"]: stat for stat in major["majorStats"]}
        for key, (name, description) in MAJOR_STAT_META.items():
            if key not in existing_by_key:
                major["majorStats"].append({"key": key, "name": name, "initialValue": 0, "description": description})
        for stat in major["majorStats"]:
            if stat["key"] in MAJOR_STAT_META:
                stat["name"], stat["description"] = MAJOR_STAT_META[stat["key"]]

        main_by_sem = {event["semester"]: event["id"] for event in new_events if event["type"] == "main"}
        special_by_sem: dict[str, list[str]] = {}
        for event in keep_events:
            if event.get("semester") and event.get("type") in {"transfer", "route", "gg_check", "settlement"}:
                special_by_sem.setdefault(event["semester"], []).append(event["id"])
        for item in major["timeline"]:
            sem = item.get("key") or item.get("semester")
            if sem in main_by_sem:
                item["mainEventIds"] = [main_by_sem[sem], *special_by_sem.get(sem, [])]
                item["theme"] = next(e["title"] for e in new_events if e["id"] == main_by_sem[sem])
        major["randomEvents"] = [event["id"] for event in new_events if event["type"] == "major_random"]
        major["achievements"] = [achievement["id"] for achievement in achievements]
        major["endings"] = [ending["id"] for ending in endings]
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
    word_endings = read_endings(paragraphs)
    settings = read_settings(paragraphs)

    existing_events = json.loads((BY_MAJOR / f"{MAJOR_ID}.events.json").read_text())
    keep_events = [event for event in existing_events if event.get("type") not in {"main", "major_random"}]
    events = new_events + keep_events

    existing_achievements = json.loads((BY_MAJOR / f"{MAJOR_ID}.achievements.json").read_text())
    existing_achievement_ids = {achievement["id"] for achievement in existing_achievements}
    word_achievements = [
        {
            "id": achievement_id,
            "achievementId": achievement_id,
            "majorId": MAJOR_ID,
            "title": title,
            "description": f"在汉语言文学副本中解锁「{title}」。",
            "condition": {"type": "flag", "key": achievement_id},
            "shareText": f"我在汉语言文学副本里解锁了：{title}。",
        }
        for title, achievement_id in achievement_ids.items()
    ]
    achievements = existing_achievements + [
        achievement for achievement in word_achievements if achievement["id"] not in existing_achievement_ids
    ]

    (BY_MAJOR / f"{MAJOR_ID}.events.json").write_text(json.dumps(events, ensure_ascii=False) + "\n")
    (BY_MAJOR / f"{MAJOR_ID}.endings.json").write_text(json.dumps(word_endings, ensure_ascii=False) + "\n")
    (BY_MAJOR / f"{MAJOR_ID}.achievements.json").write_text(json.dumps(achievements, ensure_ascii=False) + "\n")
    update_major_config(new_events, word_endings, achievements, keep_events, settings)
    update_aggregate("events.json", events)
    update_aggregate("endings.json", word_endings)
    update_aggregate("achievements.json", achievements)

    print(f"imported {len(new_events)} chinese literature events, {len(word_endings)} endings, {len(achievements)} achievements")


if __name__ == "__main__":
    main()
