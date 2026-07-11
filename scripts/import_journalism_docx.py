from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import docx


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = ROOT / "src" / "data" / "script"
BY_MAJOR = SCRIPT_DIR / "byMajor"

MAJOR_ID = "journalism_communication"
DOCX_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/Users/zhenzhen/Downloads/S07-新闻传播学-完整四年脚本补强包.docx")

SEMESTER_MAP = {
    "大一上": "y1s1",
    "大一下": "y1s2",
    "大二上": "y2s1",
    "大二下": "y2s2",
    "大三上": "y3s1",
    "大三下": "y3s2",
    "大四上": "y4s1",
    "大四下": "y4s2",
    "随机事件池": None,
    "随机": None,
}

GLOBAL_STAT_MAP = {
    "上头值": "obsession",
    "majorInterest": "obsession",
    "mentalEnergy": "energy",
    "精神电量": "energy",
    "滤镜": "filter",
    "滤镜厚度": "filter",
    "filterThickness": "filter",
    "绩点意志": "gpaWill",
    "gpaDesire": "gpaWill",
    "就业幻觉": "careerFantasy",
    "逃跑冲动": "escapeImpulse",
    "escapeImpulse": "escapeImpulse",
}

MAJOR_STAT_MAP = {
    "内容嗅觉": "topicSensitivity",
    "contentSense": "topicSensitivity",
    "作品集热度": "portfolioProgress",
    "portfolioHeat": "portfolioProgress",
    "平台焦虑": "hotspotChase",
    "platformAnxiety": "hotspotChase",
}

ROUTE_MARKER_MAP = {
    "job_track": "journalism_communication_route_job",
    "postgraduate_track": "journalism_communication_route_postgrad",
    "civil_service_track": "journalism_communication_route_civil_service",
    "portfolio_ending_bias": "journalism_communication_route_content",
    "theory_ending_bias": "journalism_communication_route_postgrad",
    "clear_exit_ending_bias": "journalism_communication_route_civil_service",
}

SPECIAL_ENDING_IDS = {
    "ending_journalism_communication_mid_gg",
    "ending_journalism_communication_transfer_success",
    "ending_journalism_communication_transfer_fail",
    "ending_journalism_communication_hidden",
}

PRESERVED_TIMELINE_IDS_BY_SEMESTER = {
    "y1s2": ["journalism_communication_y1s2_transfer_005"],
    "y2s2": ["journalism_communication_y2s2_transfer_011"],
    "y3s1": ["journalism_communication_y3s1_route_015"],
    "y3s2": ["journalism_communication_y3s2_route_016", "journalism_communication_y3s2_route_017"],
    "y4s1": ["journalism_communication_y4s1_route_020", "journalism_communication_y4s1_gg_check_021"],
    "y4s2": ["journalism_communication_y4s2_settlement_023"],
}

MAJOR_STAT_SCALE = {
    "topicSensitivity": 3,
    "portfolioProgress": 4,
    "hotspotChase": 3,
}


def split_slash(value: str) -> list[str]:
    return [part.strip() for part in re.split(r"[/／]", value or "") if part.strip()]


def field_value(line: str) -> str:
    return line.split("：", 1)[1].strip()


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
    names: list[str] = []
    for idx, line in enumerate(paragraphs):
        if line == "十、成就":
            cursor = idx + 1
            while cursor < len(paragraphs) and paragraphs[cursor].startswith("•"):
                names.append(paragraphs[cursor].lstrip("•").strip())
                cursor += 1
            break
    return {name: f"ach_{MAJOR_ID}_doc_{i:03d}" for i, name in enumerate(names, 1)}


def option_to_choice(option: dict, idx: int, achievement_ids: dict[str, str]) -> dict:
    choice_id = ["a", "b", "c"][idx]
    tags = split_slash(option.get("选项标签", ""))
    marker = option.get("路线标记", "").strip()
    stats, major_stats = parse_delta(option.get("数值变化", ""))

    route_add = []
    if marker in ROUTE_MARKER_MAP:
        route_add.append(ROUTE_MARKER_MAP[marker])

    flags = [f"{MAJOR_ID}_tag_{tag}" for tag in tags]
    if marker:
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
    is_random = "_random_" in event_id
    event_type = "major_random" if is_random else "main"
    options = [option_to_choice(option, idx, achievement_ids) for idx, option in enumerate(raw.get("options", []))]
    return {
        "id": event_id,
        "eventId": event_id,
        "majorId": MAJOR_ID,
        "title": raw.get("事件标题", ""),
        "type": event_type,
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
        if line.startswith("六、新闻传播学中途 GG"):
            break
        if line.startswith("主线事件：") or line.startswith("随机事件："):
            flush()
            current = {"options": []}
            current_option = None
            continue
        if current is None:
            continue
        if re.match(r"^选项[ABC]$", line):
            current_option = {}
            current["options"].append(current_option)
            continue
        if current_option is not None:
            for key in ["按钮文案", "反馈文案", "数值变化", "选项标签", "路线标记"]:
                if line.startswith(f"{key}："):
                    current_option[key] = field_value(line)
                    break
            continue
        for key in ["事件ID", "学年学期", "事件标题", "事件描述", "标签"]:
            if line.startswith(f"{key}："):
                current[key] = field_value(line)
                break
    flush()
    return events


def read_settings(paragraphs: list[str]) -> dict:
    intro = {}
    initial_stats = {}
    initial_major_stats = {}
    share_texts = []
    for line in paragraphs:
        if line.startswith("标题："):
            intro["title"] = field_value(line)
        elif line.startswith("开场文案："):
            intro["body"] = field_value(line)
        elif line.startswith("系统吐槽："):
            intro["body"] = f"{intro.get('body', '')}\n\n{field_value(line)}".strip()
        elif line.startswith("进入按钮："):
            intro["startButton"] = field_value(line)
        elif line.startswith("初始核心数值："):
            # The line uses `名称 数值`, not deltas, so parse it separately.
            for name, raw in re.findall(r"([\u4e00-\u9fff]+)\s*(\d+)", field_value(line)):
                if name in GLOBAL_STAT_MAP:
                    initial_stats[GLOBAL_STAT_MAP[name]] = int(raw)
        elif line.startswith("初始专业数值："):
            for name, raw in re.findall(r"([\u4e00-\u9fff]+)\s*(\d+)", field_value(line)):
                if name in MAJOR_STAT_MAP:
                    initial_major_stats[MAJOR_STAT_MAP[name]] = int(raw)
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
    for name, op, raw in re.findall(r"([A-Za-z0-9_\u4e00-\u9fff]+)\s*(>=|<=|>|<|=)\s*(\d+)", text):
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
        if line.startswith("终局结局："):
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
            current["title"] = f"新闻传播学·{field_value(line)}"
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
        ending.setdefault("title", ending.get("id", "新闻传播学结局"))
        ending.setdefault("description", "")
        ending.setdefault("condition", {})
        ending.setdefault("shareText", f"我在新闻传播学副本里活成了：{ending['title']}。")
        ending.setdefault("advice", ending["description"])
    return endings


def update_major_config(
    new_events: list[dict],
    word_endings: list[dict],
    settings: dict,
    achievements: list[dict],
    kept_endings: list[dict],
    keep_events: list[dict],
) -> None:
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
            if stat["key"] == "topicSensitivity":
                stat["name"] = "内容嗅觉"
                stat["description"] = "发现选题、理解平台和用户情绪的能力。"
            elif stat["key"] == "hotspotChase":
                stat["name"] = "平台焦虑"
                stat["description"] = "被数据、算法、热搜、流量和甲方需求牵引的程度。"
            elif stat["key"] == "portfolioProgress":
                stat["name"] = "作品集热度"
                stat["description"] = "稿件、视频、策划、实习成果等可展示积累。"
        main_by_sem = {event["semester"]: event["id"] for event in new_events if event["type"] == "main"}
        for item in major["timeline"]:
            sem = item.get("key") or item.get("semester")
            if sem in main_by_sem:
                kept_event_ids = {event["id"] for event in keep_events}
                preserved_ids = [event_id for event_id in PRESERVED_TIMELINE_IDS_BY_SEMESTER.get(sem, []) if event_id in kept_event_ids]
                item["mainEventIds"] = [main_by_sem[sem], *preserved_ids]
                item["theme"] = next(e["title"] for e in new_events if e["id"] == main_by_sem[sem])
        major["randomEvents"] = [event["id"] for event in new_events if event["type"] == "major_random"]
        major["achievements"] = [achievement["id"] for achievement in achievements]
        major["endings"] = [ending["id"] for ending in kept_endings + word_endings]
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

    existing_events = json.loads((BY_MAJOR / "journalism_communication.events.json").read_text())
    keep_events = [event for event in existing_events if event.get("type") not in {"main", "major_random"}]
    events = new_events + keep_events

    existing_endings = json.loads((BY_MAJOR / "journalism_communication.endings.json").read_text())
    keep_endings = [ending for ending in existing_endings if ending.get("id") in SPECIAL_ENDING_IDS]
    endings = keep_endings + word_endings

    existing_achievements = json.loads((BY_MAJOR / "journalism_communication.achievements.json").read_text())
    existing_achievement_ids = {achievement["id"] for achievement in existing_achievements}
    word_achievements = [
        {
            "id": achievement_id,
            "achievementId": achievement_id,
            "majorId": MAJOR_ID,
            "title": title,
            "description": f"在新闻传播学副本中解锁「{title}」。",
            "condition": {"type": "flag", "key": achievement_id},
            "shareText": f"我在新闻传播学副本里解锁了：{title}。",
        }
        for title, achievement_id in achievement_ids.items()
    ]
    achievements = existing_achievements + [
        achievement for achievement in word_achievements if achievement["id"] not in existing_achievement_ids
    ]

    (BY_MAJOR / "journalism_communication.events.json").write_text(json.dumps(events, ensure_ascii=False) + "\n")
    (BY_MAJOR / "journalism_communication.endings.json").write_text(json.dumps(endings, ensure_ascii=False) + "\n")
    (BY_MAJOR / "journalism_communication.achievements.json").write_text(json.dumps(achievements, ensure_ascii=False) + "\n")
    update_major_config(new_events, word_endings, settings, achievements, keep_endings, keep_events)
    update_aggregate("events.json", events)
    update_aggregate("endings.json", endings)
    update_aggregate("achievements.json", achievements)

    print(f"imported {len(new_events)} journalism events, {len(endings)} endings, {len(achievements)} achievements")


if __name__ == "__main__":
    main()
