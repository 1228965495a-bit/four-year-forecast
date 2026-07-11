from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import docx


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = ROOT / "src" / "data" / "script"
BY_MAJOR = SCRIPT_DIR / "byMajor"

MAJOR_ID = "teacher_education"
DOCX_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/Users/zhenzhen/Downloads/S10-师范类-完整四年脚本补强包.docx")

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
    "专业上头值": "obsession",
    "上头值": "obsession",
    "精神电量": "energy",
    "滤镜厚度": "filter",
    "滤镜": "filter",
    "绩点意志": "gpaWill",
    "就业幻觉": "careerFantasy",
    "逃跑冲动": "escapeImpulse",
    "嘴硬浓度": "stubbornness",
}

MAJOR_STAT_MAP = {
    "讲台掌控": "teachingSkill",
    "教资进度": "certPressure",
    "编制执念": "examPressure",
    "嗓子耐久": "voiceDurability",
    "教学良心": "teachingConscience",
}

ROUTE_MARKER_MAP = {
    "teacher_exam_track": "teacher_education_route_exam",
    "postgraduate_track": "teacher_education_route_postgrad",
    "education_related_exit": "teacher_education_route_job",
    "编制上岸/新手教师": "teacher_education_route_exam",
    "教育相关转向": "teacher_education_route_job",
    "清醒退出": "teacher_education_route_cross",
}

SPECIAL_ENDING_IDS = {
    "ending_teacher_education_mid_gg",
    "ending_teacher_education_transfer_success",
    "ending_teacher_education_transfer_fail",
    "ending_teacher_education_hidden",
}

PRESERVED_TIMELINE_IDS_BY_SEMESTER = {
    "y1s2": ["teacher_education_y1s2_transfer_005"],
    "y2s2": ["teacher_education_y2s2_transfer_011"],
    "y3s1": ["teacher_education_y3s1_route_015"],
    "y3s2": ["teacher_education_y3s2_route_016", "teacher_education_y3s2_route_017"],
    "y4s1": ["teacher_education_y4s1_route_020", "teacher_education_y4s1_gg_check_021"],
    "y4s2": ["teacher_education_y4s2_settlement_023"],
}

MAJOR_STAT_SCALE = {
    "teachingSkill": 3,
    "certPressure": 3,
    "examPressure": 3,
    "voiceDurability": 1,
    "teachingConscience": 3,
}

MAJOR_STAT_META = {
    "teachingSkill": ("讲台掌控", "能不能站稳讲台、控住节奏、把知识讲清楚。"),
    "certPressure": ("教资进度", "普通话、教资笔试、面试、试讲等证书副本推进程度。"),
    "examPressure": ("编制执念", "对稳定、岗位表、考编、上岸的执念强度。"),
    "voiceDurability": ("嗓子耐久", "连续讲课、试讲、答辩、面试后的物理续航。"),
    "teachingConscience": ("教学良心", "是否真的在乎学生听没听懂、学没学会。"),
}


def field_value(line: str) -> str:
    return line.split("：", 1)[1].strip()


def clean_value(value: str) -> str:
    return re.sub(r"^(触发条件|评级|一句话总结|系统诊断|后遗症|分享文案|标签)：", "", value.strip()).strip()


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
    for line in paragraphs:
        if line.startswith("成就列表："):
            names = split_slash(field_value(line))
            break
    return {name: f"ach_{MAJOR_ID}_doc_{i:03d}" for i, name in enumerate(names, 1)}


def parse_extra_effect(value: str) -> tuple[list[str], list[str]]:
    tags: list[str] = []
    routes: list[str] = []
    value = value.strip()
    for prefix in ["获得标签：", "隐藏标记："]:
        if value.startswith(prefix):
            tags.append(value.removeprefix(prefix).split("+", 1)[0].strip())
    for prefix in ["路线标记：", "结局倾向："]:
        if value.startswith(prefix):
            marker = value.removeprefix(prefix).strip()
            if marker in ROUTE_MARKER_MAP:
                routes.append(ROUTE_MARKER_MAP[marker])
            tags.append(marker)
    return tags, routes


def option_to_choice(option: dict, idx: int, achievement_ids: dict[str, str]) -> dict:
    choice_id = ["a", "b", "c"][idx]
    tags = split_slash(option.get("标签", "")) + split_slash(option.get("选项标签", ""))
    route_add: list[str] = []
    for extra in option.get("附加效果", []):
        extra_tags, extra_routes = parse_extra_effect(extra)
        tags.extend(extra_tags)
        route_add.extend(extra_routes)

    stats, major_stats = parse_delta(option.get("数值变化", ""))
    flags = [f"{MAJOR_ID}_tag_{tag}" for tag in tags if tag]
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


def parse_compact_options(line: str) -> list[dict]:
    if not line.startswith("选项与效果："):
        return []
    body = field_value(line)
    options = []
    pattern = r"([ABC])：(.+?)｜反馈：(.+?)｜数值变化：(.+?)(?=；[ABC]：|$)"
    for _, text, feedback, delta in re.findall(pattern, body):
        options.append({"按钮文案": text.strip(), "反馈文案": feedback.strip(), "数值变化": delta.strip()})
    return options


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
        if line.startswith("6. 中途 GG"):
            break
        if line.startswith("事件ID："):
            flush()
            current = {"事件ID": field_value(line), "options": []}
            current_option = None
            continue
        if current is None:
            continue
        compact_options = parse_compact_options(line)
        if compact_options:
            current["options"].extend(compact_options)
            current_option = None
            continue
        if re.match(r"^选项[ABC]：?$", line):
            current_option = {"附加效果": []}
            current["options"].append(current_option)
            continue
        if current_option is not None:
            for key in ["按钮文案", "反馈文案", "数值变化", "标签", "选项标签"]:
                if line.startswith(f"{key}："):
                    current_option[key] = field_value(line)
                    break
            else:
                if line.startswith("附加效果："):
                    current_option.setdefault("附加效果", []).append(field_value(line))
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

    for line in paragraphs:
        if line.startswith("开场标题："):
            intro["title"] = field_value(line)
        elif line.startswith("开场文案："):
            intro["body"] = field_value(line)
        elif line.startswith("系统提醒：") or line.startswith("系统吐槽："):
            intro["body"] = f"{intro.get('body', '')}\n\n{field_value(line)}".strip()
        elif line.startswith("进入按钮："):
            intro["startButton"] = field_value(line)
        elif line.startswith("分享文案"):
            share_texts.append(field_value(line))
        elif line.startswith("初始数值建议："):
            for name, raw in re.findall(r"([^，；]+?)\s*(\d+)", field_value(line)):
                name = name.strip()
                if name in GLOBAL_STAT_MAP:
                    initial_stats[GLOBAL_STAT_MAP[name]] = int(raw)
                elif name in MAJOR_STAT_MAP:
                    initial_major_stats[MAJOR_STAT_MAP[name]] = int(raw)

    return {
        "intro": intro,
        "initialStats": initial_stats,
        "initialMajorStats": initial_major_stats,
        "shareTexts": share_texts,
    }


def condition_from_text(text: str) -> dict:
    text = clean_value(text).replace("，", "且").replace(",", "且")
    conditions = []
    for name, op, raw in re.findall(r"([\u4e00-\u9fffA-Za-z0-9_]+)\s*(>=|<=|>|<|=|==)\s*(\d+)", text):
        name = name.strip().removeprefix("且").strip()
        if name in GLOBAL_STAT_MAP:
            conditions.append({"type": "stat", "key": GLOBAL_STAT_MAP[name], "op": "==" if op == "=" else op, "value": int(raw)})
        elif name in MAJOR_STAT_MAP:
            conditions.append({"type": "majorStat", "key": MAJOR_STAT_MAP[name], "op": "==" if op == "=" else op, "value": int(raw)})
    return conditions[0] if len(conditions) == 1 else {"all": conditions}


def read_endings(paragraphs: list[str]) -> list[dict]:
    endings = []
    current: dict | None = None
    priority = 80
    in_endings = False
    for line in paragraphs:
        if line.startswith("7. 终局结局"):
            in_endings = True
            continue
        if in_endings and line.startswith("8. "):
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
            current["title"] = f"师范类·{field_value(line)}"
        elif line.startswith("触发条件："):
            current["condition"] = condition_from_text(field_value(line))
        elif line.startswith("一句话总结："):
            current["description"] = clean_value(field_value(line))
        elif line.startswith("系统诊断："):
            current["advice"] = clean_value(field_value(line))
        elif line.startswith("分享文案："):
            current["shareText"] = clean_value(field_value(line))
    if current:
        endings.append(current)

    for ending in endings:
        ending["majorId"] = MAJOR_ID
        ending.setdefault("title", ending.get("id", "师范类结局"))
        ending.setdefault("description", "")
        ending.setdefault("condition", {})
        ending.setdefault("shareText", f"我在师范类副本里活成了：{ending['title']}。")
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
            "description": f"在师范类副本中解锁「{title}」。",
            "condition": {"type": "flag", "key": achievement_id},
            "shareText": f"我在师范类副本里解锁了：{title}。",
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

    print(f"imported {len(new_events)} teacher education events, {len(endings)} endings, {len(achievements)} achievements")


if __name__ == "__main__":
    main()
