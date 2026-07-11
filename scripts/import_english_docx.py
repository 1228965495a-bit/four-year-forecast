from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import docx


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = ROOT / "src" / "data" / "script"
BY_MAJOR = SCRIPT_DIR / "byMajor"

MAJOR_ID = "english"
DOCX_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/Users/zhenzhen/Downloads/S09-英语专业-完整四年脚本补强包.docx")

SEMESTER_MAP = {
    "大一上": "y1s1",
    "大一下": "y1s2",
    "大二上": "y2s1",
    "大二下": "y2s2",
    "大三上": "y3s1",
    "大三下": "y3s2",
    "大四上": "y4s1",
    "大四下": "y4s2",
    "随机事件": None,
    "随机": None,
}

GLOBAL_STAT_MAP = {
    "majorInterest": "obsession",
    "上头值": "obsession",
    "mentalEnergy": "energy",
    "精神电量": "energy",
    "filterThickness": "filter",
    "滤镜": "filter",
    "gpaDesire": "gpaWill",
    "绩点意志": "gpaWill",
    "jobIllusion": "careerFantasy",
    "就业幻觉": "careerFantasy",
    "escapeImpulse": "escapeImpulse",
    "逃跑冲动": "escapeImpulse",
    "嘴硬浓度": "stubbornness",
}

MAJOR_STAT_MAP = {
    "languageConfidence": "oralCourage",
    "语言自信": "oralCourage",
    "temAnxiety": "tem8Shadow",
    "专四焦虑": "tem8Shadow",
    "专四/专八焦虑": "tem8Shadow",
    "专四专八焦虑": "tem8Shadow",
    "translationAccent": "translationTangle",
    "翻译腔": "translationTangle",
    "toolDisillusion": "toolDisillusion",
    "工具论祛魅": "toolDisillusion",
    "careerBranchPressure": "careerBranchPressure",
    "就业分流压力": "careerBranchPressure",
}

ROUTE_MARKER_MAP = {
    "translation_track_hint": "english_route_translation",
    "translation_track": "english_route_translation",
    "tem_track": "english_route_tem",
    "teacher_track": "english_route_teaching",
    "foreign_trade_track": "english_route_foreign_trade",
    "cross_major_track": "english_route_cross",
    "language_plus_track": "english_route_language_plus",
    "clear_tool_track": "english_route_clear_tool",
    "career_pivot_track": "english_route_cross",
}

SPECIAL_ENDING_IDS = {
    "ending_english_mid_gg",
    "ending_english_transfer_success",
    "ending_english_transfer_fail",
    "ending_english_hidden",
}

PRESERVED_TIMELINE_IDS_BY_SEMESTER = {
    "y1s2": ["english_y1s2_transfer_005"],
    "y2s2": ["english_y2s2_transfer_011"],
    "y3s1": ["english_y3s1_route_015"],
    "y3s2": ["english_y3s2_route_016", "english_y3s2_route_017"],
    "y4s1": ["english_y4s1_route_020", "english_y4s1_gg_check_021"],
    "y4s2": ["english_y4s2_settlement_023"],
}

MAJOR_STAT_SCALE = {
    "oralCourage": 3,
    "tem8Shadow": 3,
    "translationTangle": 3,
    "toolDisillusion": 3,
    "careerBranchPressure": 3,
}

MAJOR_STAT_META = {
    "oralCourage": ("语言自信值", "越高越敢开口、越相信自己能靠语言吃饭。"),
    "tem8Shadow": ("专四专八焦虑", "越高越容易进入英专大型渡劫状态。"),
    "translationTangle": ("翻译腔浓度", "越高越容易写出“进行一个学习”的译文。"),
    "toolDisillusion": ("工具论祛魅值", "越高越意识到英语本身很难单独当饭吃。"),
    "careerBranchPressure": ("就业分流压力", "越高越容易在教资、考研、外贸、跨境、考公、转行之间反复横跳。"),
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
    names: list[str] = []
    collecting = False
    for line in paragraphs:
        if line == "十一、成就":
            collecting = True
            continue
        if collecting and line.startswith("十二、"):
            break
        if collecting:
            names.append(line.lstrip("•").strip())
    return {name: f"ach_{MAJOR_ID}_doc_{i:03d}" for i, name in enumerate(names, 1)}


def option_to_choice(option: dict, idx: int, achievement_ids: dict[str, str]) -> dict:
    choice_id = ["a", "b", "c"][idx]
    tags = split_slash(option.get("标签", "")) + split_slash(option.get("选项标签", ""))
    marker = option.get("路线/标记", option.get("路线标记", "")).strip()
    stats, major_stats = parse_delta(option.get("数值变化", ""))

    flags = [f"{MAJOR_ID}_tag_{tag}" for tag in tags]
    route_add = []
    if marker:
        flags.append(f"{MAJOR_ID}_route_marker_{marker}")
        route = ROUTE_MARKER_MAP.get(marker)
        if route:
            route_add.append(route)

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
        if line.startswith("七、中途 GG"):
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
            for key in ["按钮文案", "反馈文案", "数值变化", "标签", "选项标签", "路线/标记", "路线标记"]:
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
    initial_stats: dict[str, int] = {}
    initial_major_stats: dict[str, int] = {}
    share_texts = []

    in_initial = False
    for line in paragraphs:
        if line.startswith("开场标题："):
            intro["title"] = field_value(line)
        elif line.startswith("开场文案："):
            intro["body"] = field_value(line)
        elif line.startswith("系统提醒：") or line.startswith("系统吐槽："):
            intro["body"] = f"{intro.get('body', '')}\n\n{field_value(line)}".strip()
        elif line.startswith("进入按钮："):
            intro["startButton"] = field_value(line)
        elif line == "三、初始数值":
            in_initial = True
            continue
        elif in_initial and line.startswith("四、"):
            in_initial = False
        elif in_initial and "：" in line:
            name, raw = [part.strip() for part in line.split("：", 1)]
            if raw.isdigit() and name in GLOBAL_STAT_MAP:
                initial_stats[GLOBAL_STAT_MAP[name]] = int(raw)
            elif raw.isdigit() and name in MAJOR_STAT_MAP:
                initial_major_stats[MAJOR_STAT_MAP[name]] = int(raw)
        elif line.startswith("分享文案"):
            share_texts.append(field_value(line))

    return {
        "intro": intro,
        "initialStats": initial_stats,
        "initialMajorStats": initial_major_stats,
        "shareTexts": share_texts,
    }


def leaf_condition(name: str, op: str, raw: str) -> dict | None:
    if name in GLOBAL_STAT_MAP:
        return {"type": "stat", "key": GLOBAL_STAT_MAP[name], "op": "==" if op == "=" else op, "value": int(raw)}
    if name in MAJOR_STAT_MAP:
        return {"type": "majorStat", "key": MAJOR_STAT_MAP[name], "op": "==" if op == "=" else op, "value": int(raw)}
    route = ROUTE_MARKER_MAP.get(name)
    if route and op in {"==", "="}:
        return {"type": "route", "key": route}
    return None


def and_condition_from_text(text: str) -> dict:
    conditions = []
    for name, op, raw in re.findall(r"([A-Za-z0-9_\u4e00-\u9fff/]+)\s*(>=|<=|>|<|==|=)\s*(true|\d+)", text):
        cond = leaf_condition(name, op, raw) if raw != "true" else None
        if raw == "true":
            route = ROUTE_MARKER_MAP.get(name)
            if route:
                cond = {"type": "route", "key": route}
        if cond:
            conditions.append(cond)
    return conditions[0] if len(conditions) == 1 else {"all": conditions}


def condition_from_text(text: str) -> dict:
    normalized = text.replace("且", "&&").replace("并且", "&&")
    or_parts = [part.strip() for part in normalized.split("||") if part.strip()]
    if len(or_parts) > 1:
        return {"any": [and_condition_from_text(part) for part in or_parts]}
    return and_condition_from_text(normalized)


def read_endings(paragraphs: list[str]) -> list[dict]:
    endings = []
    current: dict | None = None
    priority = 80
    in_endings = False
    for line in paragraphs:
        if line.startswith("八、终局结局"):
            in_endings = True
            continue
        if in_endings and line.startswith("九、"):
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
            current["title"] = f"英语·{field_value(line)}"
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
        ending.setdefault("title", ending.get("id", "英语结局"))
        ending.setdefault("description", "")
        ending.setdefault("condition", {})
        ending.setdefault("shareText", f"我在英语专业副本里活成了：{ending['title']}。")
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
        obsolete_keys = {"languageConfidence", "temAnxiety", "translationAccent"}
        major["majorStats"] = [stat for stat in major["majorStats"] if stat.get("key") not in obsolete_keys]
        existing_by_key = {stat["key"]: stat for stat in major["majorStats"]}
        for key, (name, description) in MAJOR_STAT_META.items():
            if key not in existing_by_key:
                major["majorStats"].append(
                    {
                        "key": key,
                        "name": name,
                        "initialValue": settings["initialMajorStats"].get(key, 0),
                        "description": description,
                    }
                )
        for stat in major["majorStats"]:
            if stat["key"] in MAJOR_STAT_META:
                stat["name"], stat["description"] = MAJOR_STAT_META[stat["key"]]
            if stat["key"] in settings["initialMajorStats"]:
                stat["initialValue"] = settings["initialMajorStats"][stat["key"]]

        main_by_sem = {event["semester"]: event["id"] for event in new_events if event["type"] == "main"}
        kept_event_ids = {event["id"] for event in keep_events}
        for item in major["timeline"]:
            sem = item.get("key") or item.get("semester")
            if sem in main_by_sem:
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

    existing_events = json.loads((BY_MAJOR / f"{MAJOR_ID}.events.json").read_text())
    keep_events = [event for event in existing_events if event.get("type") not in {"main", "major_random"}]
    events = new_events + keep_events

    existing_endings = json.loads((BY_MAJOR / f"{MAJOR_ID}.endings.json").read_text())
    keep_endings = [ending for ending in existing_endings if ending.get("id") in SPECIAL_ENDING_IDS]
    endings = keep_endings + word_endings

    existing_achievements = json.loads((BY_MAJOR / f"{MAJOR_ID}.achievements.json").read_text())
    existing_achievement_ids = {achievement["id"] for achievement in existing_achievements}
    word_achievements = [
        {
            "id": achievement_id,
            "achievementId": achievement_id,
            "majorId": MAJOR_ID,
            "title": title,
            "description": f"在英语专业副本中解锁「{title}」。",
            "condition": {"type": "flag", "key": achievement_id},
            "shareText": f"我在英语专业副本里解锁了：{title}。",
        }
        for title, achievement_id in achievement_ids.items()
    ]
    achievements = existing_achievements + [
        achievement for achievement in word_achievements if achievement["id"] not in existing_achievement_ids
    ]

    (BY_MAJOR / f"{MAJOR_ID}.events.json").write_text(json.dumps(events, ensure_ascii=False) + "\n")
    (BY_MAJOR / f"{MAJOR_ID}.endings.json").write_text(json.dumps(endings, ensure_ascii=False) + "\n")
    (BY_MAJOR / f"{MAJOR_ID}.achievements.json").write_text(json.dumps(achievements, ensure_ascii=False) + "\n")
    update_major_config(new_events, word_endings, settings, achievements, keep_endings, keep_events)
    update_aggregate("events.json", events)
    update_aggregate("endings.json", endings)
    update_aggregate("achievements.json", achievements)

    print(f"imported {len(new_events)} english events, {len(endings)} endings, {len(achievements)} achievements")


if __name__ == "__main__":
    main()
