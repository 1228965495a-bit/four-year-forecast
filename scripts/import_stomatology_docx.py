from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import docx


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = ROOT / "src" / "data" / "script"
BY_MAJOR = SCRIPT_DIR / "byMajor"

MAJOR_ID = "stomatology"
DOCX_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/Users/zhenzhen/Downloads/A03-口腔医学-完整四年脚本补强包.docx")

SEMESTER_MAP = {
    "大一上": "y1s1",
    "大一下": "y1s2",
    "大二上": "y2s1",
    "大二下": "y2s2",
    "大三上": "y3s1",
    "大三下": "y3s2",
    "大四上": "y4s1",
    "大四下": "y4s2",
}

RANDOM_SEMESTERS = ["y1s1", "y1s2", "y2s1", "y2s2", "y3s1", "y3s2", "y4s1", "y4s2", "y4s1", "y4s2"]

GLOBAL_STAT_MAP = {
    "上头值": "obsession",
    "精神电量": "energy",
    "滤镜": "filter",
    "绩点意志": "gpaWill",
    "就业幻觉": "careerFantasy",
    "跑路冲动": "escapeImpulse",
    "逃跑冲动": "escapeImpulse",
    "嘴硬浓度": "stubbornness",
    "stubbornness": "stubbornness",
}

MAJOR_STAT_MAP = {
    "手稳值": "handStability",
    "手稳指数": "handStability",
    "牙齿雷达": "dentalRadar",
    "颈椎余额": "cervicalBalance",
    "患者沟通值": "patientCommunication",
    "临床沟通": "patientCommunication",
    "牙科滤镜": "dentalFilter",
    "临床敬畏": "clinicalRespect",
}

HIDDEN_STAT_MAP = {
    "社交能量": "socialEnergy",
}

MAJOR_STAT_SCALE = {
    "handStability": 3,
    "dentalRadar": 3,
    "patientCommunication": 3,
    "dentalFilter": 1,
    "clinicalRespect": 3,
    "cervicalBalance": 1,
}

MAJOR_STAT_META = {
    "dentalFilter": ("牙科滤镜", "对“牙医是不是很赚钱、是不是轻松香”的想象厚度。", 88),
    "handStability": ("手稳值", "雕牙、备洞、根管、修复等精细操作时手和心态的稳定程度。", 42),
    "dentalRadar": ("牙齿雷达", "看到别人说话、笑、自拍时自动扫描牙列、牙龈和咬合的程度。", 18),
    "cervicalBalance": ("颈椎余额", "长期低头、悬腕、盯模型、看口内操作后剩余的颈椎耐久度。", 95),
    "patientCommunication": ("患者沟通值", "把专业判断讲成人话、让患者安心并保持边界感的能力。", 15),
    "clinicalPressure": ("临床操作压力", "从模型到真实患者时积累的压力。", 0),
    "competitionAnxiety": ("竞争焦虑", "热门高分和考研竞争带来的压力。", 0),
    "clinicalRespect": ("临床敬畏", "对患者、责任和细节底线的敬畏。", 0),
}


def field_value(line: str) -> str:
    return line.split("：", 1)[1].strip()


def split_slash(value: str) -> list[str]:
    return [part.strip() for part in re.split(r"[/／]", value or "") if part.strip()]


def unique(values: list[str]) -> list[str]:
    return list(dict.fromkeys(value for value in values if value))


def parse_delta(value: str) -> tuple[dict[str, int], dict[str, int], dict[str, int], list[str]]:
    stats: dict[str, int] = {}
    major_stats: dict[str, int] = {}
    hidden_stats: dict[str, int] = {}
    tags: list[str] = []
    for piece in re.split(r"[，,、;；]", value or ""):
        piece = piece.strip()
        if not piece:
            continue
        if piece.startswith("标签："):
            tags.extend(split_slash(piece.removeprefix("标签：")))
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
            hidden_stats[key] = hidden_stats.get(key, 0) + delta
    return stats, major_stats, hidden_stats, tags


def make_achievement_ids(paragraphs: list[str]) -> dict[str, str]:
    names: list[str] = []
    in_achievements = False
    for line in paragraphs:
        if line.startswith("十一、成就"):
            in_achievements = True
            continue
        if in_achievements and line.startswith("十二、"):
            break
        if in_achievements:
            names.append(line.strip())
    return {name: f"ach_{MAJOR_ID}_doc_{i:03d}" for i, name in enumerate(names, 1)}


def choice_from_parts(event_id: str, idx: int, text: str, feedback: str, delta_text: str, tags: list[str], achievement_ids: dict[str, str]) -> dict:
    choice_id = ["a", "b", "c"][idx]
    if not feedback.strip():
        feedback = f"你选择了「{text.strip()}」。系统记录：口腔副本的小齿轮又转了一格。"
    stats, major_stats, hidden_stats, delta_tags = parse_delta(delta_text)
    all_tags = unique([*tags, *delta_tags])
    flags = [f"{MAJOR_ID}_tag_{tag}" for tag in all_tags]
    unlocked = [achievement_ids[tag] for tag in all_tags if tag in achievement_ids]

    effects: dict = {}
    if stats:
        effects["stats"] = stats
    if major_stats:
        effects["majorStats"] = major_stats
    if hidden_stats:
        effects["hiddenStats"] = hidden_stats
    if flags:
        effects["flagsAdd"] = flags
    if unlocked:
        effects["achievementIds"] = unlocked

    return {
        "id": choice_id,
        "choiceId": choice_id,
        "text": text.strip(),
        "feedback": feedback.strip(),
        "resultText": feedback.strip(),
        "effects": effects,
        "statChanges": stats,
        "routeChanges": [],
        "condition": None,
        "tagsUnlocked": all_tags,
        "achievementUnlocked": unlocked,
        "nextEventId": None,
        "nextEvent": None,
    }


def finalize_event(raw: dict, achievement_ids: dict[str, str]) -> dict:
    event_id = raw["事件ID"]
    options = [
        choice_from_parts(
            event_id,
            idx,
            option.get("按钮文案", ""),
            option.get("反馈文案", ""),
            option.get("数值变化", ""),
            split_slash(option.get("标签", "")),
            achievement_ids,
        )
        for idx, option in enumerate(raw.get("options", []))
    ]
    is_random = "_random_" in event_id
    semester = SEMESTER_MAP.get(raw.get("学年学期", ""), raw.get("学年学期"))
    if is_random and not semester:
        match = re.search(r"_random_(\d+)$", event_id)
        if match:
            semester = RANDOM_SEMESTERS[(int(match.group(1)) - 1) % len(RANDOM_SEMESTERS)]
    return {
        "id": event_id,
        "eventId": event_id,
        "majorId": MAJOR_ID,
        "title": raw.get("事件标题", ""),
        "type": "major_random" if is_random else "main",
        "semester": semester,
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


def parse_random_options(line: str, description: str) -> list[dict]:
    value = field_value(line)
    options = []
    for piece in [part.strip() for part in re.split(r"[；;]", value) if part.strip()]:
        chunks = [part.strip() for part in piece.split("｜")]
        if len(chunks) < 2:
            continue
        text, delta_text = chunks[0], chunks[1]
        options.append({"按钮文案": text, "数值变化": delta_text, "反馈文案": f"你选择了「{text}」。{description}"})
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
        if line.startswith("七、中途 GG"):
            break
        if line.startswith("事件ID："):
            flush()
            current = {"事件ID": field_value(line), "options": []}
            current_option = None
            continue
        if current is None:
            continue
        if re.match(r"^选项[ABC]$", line):
            current_option = {}
            current["options"].append(current_option)
            continue
        if line.startswith("选项与效果："):
            current["options"] = parse_random_options(line, current.get("事件描述", ""))
            continue
        if current_option is not None:
            for key in ["按钮文案", "反馈文案", "数值变化", "标签"]:
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
    intro: dict[str, str] = {}
    initial_stats: dict[str, int] = {}
    initial_major_stats: dict[str, int] = {}
    share_texts = []
    for line in paragraphs:
        if line.startswith("开场标题："):
            intro["title"] = field_value(line)
        elif line.startswith("开场描述："):
            intro["body"] = field_value(line)
        elif line.startswith("系统吐槽："):
            intro["body"] = f"{intro.get('body', '')}\n\n{field_value(line)}".strip()
        elif line.startswith("进入按钮："):
            intro["startButton"] = field_value(line)
        elif line.startswith("分享文案"):
            share_texts.append(field_value(line))
        else:
            match = re.match(r"^(.+?)：(\d+)$", line)
            if match:
                name, raw = match.groups()
                if name in GLOBAL_STAT_MAP:
                    initial_stats[GLOBAL_STAT_MAP[name]] = int(raw)
                elif name in MAJOR_STAT_MAP:
                    initial_major_stats[MAJOR_STAT_MAP[name]] = int(raw)
    return {"intro": intro, "initialStats": initial_stats, "initialMajorStats": initial_major_stats, "shareTexts": share_texts}


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
        return conditions[0] if len(conditions) == 1 else {"all": conditions}

    if len(parts) > 1:
        return {"any": [parse_and(part) for part in parts]}
    return parse_and(text)


def read_gg_events(paragraphs: list[str]) -> list[dict]:
    events = []
    current: dict | None = None
    in_gg = False
    for line in paragraphs:
        if line.startswith("七、中途 GG"):
            in_gg = True
            continue
        if in_gg and line.startswith("八、终局结局"):
            break
        if not in_gg:
            continue
        if line.startswith("事件ID："):
            if current:
                events.append(current)
            event_id = field_value(line)
            current = {"id": event_id, "eventId": event_id, "majorId": MAJOR_ID, "type": "gg_check", "stage": "crisis", "weight": 1}
            continue
        if current is None:
            continue
        if line.startswith("触发条件："):
            condition = condition_from_text(field_value(line))
            current["conditions"] = condition
            current["triggerCondition"] = condition
        elif line.startswith("中途GG称号："):
            title = field_value(line)
            current["title"] = title
            current["semester"] = "y3s2" if "滤镜" in title else "y4s1"
        elif line.startswith("中途GG文案："):
            current["description"] = field_value(line)
        elif line.startswith("标签："):
            current["tags"] = split_slash(field_value(line))
    if current:
        events.append(current)

    for event in events:
        title = event.get("title", "口腔中途警报")
        tags = event.get("tags", [])
        event.setdefault("semester", "y4s1")
        event.setdefault("description", "")
        event.setdefault("conditions", {})
        event.setdefault("triggerCondition", event["conditions"])
        options = [
            {
                "id": f"{event['id']}_gg",
                "choiceId": f"{event['id']}_gg",
                "text": f"硬着头皮处理「{title}」",
                "feedback": event["description"],
                "resultText": event["description"],
                "effects": {"stats": {"energy": -15, "escapeImpulse": 10}, "flagsAdd": [f"{MAJOR_ID}_flag_{event['id']}"], "ggRisk": 1},
                "statChanges": {"energy": -15, "escapeImpulse": 10},
                "routeChanges": [],
                "condition": None,
                "tagsUnlocked": tags,
                "achievementUnlocked": [],
                "nextEventId": None,
                "nextEvent": None,
            },
            {
                "id": f"{event['id']}_revive",
                "choiceId": f"{event['id']}_revive",
                "text": "先保命，再继续修牙",
                "feedback": "你没有否定口腔医学，只是承认副本难度需要重新调参。系统记录：清醒也是一种续命。",
                "resultText": "你没有否定口腔医学，只是承认副本难度需要重新调参。系统记录：清醒也是一种续命。",
                "effects": {"stats": {"energy": 8, "escapeImpulse": -4, "stubbornness": 6}, "flagsAdd": [f"{MAJOR_ID}_flag_revive"]},
                "statChanges": {"energy": 8, "escapeImpulse": -4, "stubbornness": 6},
                "routeChanges": [],
                "condition": None,
                "tagsUnlocked": ["嘴硬续命"],
                "achievementUnlocked": [],
                "nextEventId": None,
                "nextEvent": None,
            },
        ]
        event["options"] = options
        event["choices"] = options
        event["fallbackEventId"] = None
        event["resultText"] = ""
        event["statChanges"] = {}
        event["routeChanges"] = []
        event["tagsUnlocked"] = []
        event["achievementUnlocked"] = []
        event["nextEvent"] = None
        event["body"] = event["description"]
    return events


def read_endings(paragraphs: list[str]) -> list[dict]:
    endings = []
    current: dict | None = None
    priority = 90
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
            current = {"id": ending_id, "endingId": ending_id, "majorId": MAJOR_ID, "priority": priority}
            priority -= 5
            continue
        if current is None:
            continue
        if line.startswith("结局名："):
            current["title"] = f"口腔医学·{field_value(line)}"
        elif line.startswith("触发条件："):
            current["condition"] = condition_from_text(field_value(line))
        elif line.startswith("评级："):
            current["rank"] = field_value(line)
        elif line.startswith("一句话总结："):
            current["description"] = field_value(line)
        elif line.startswith("系统诊断："):
            current["advice"] = field_value(line).removeprefix("系统诊断：")
        elif line.startswith("分享文案："):
            current["shareText"] = field_value(line)
    if current:
        endings.append(current)

    for ending in endings:
        ending.setdefault("title", "口腔医学结局")
        ending.setdefault("condition", {})
        ending.setdefault("description", "")
        ending.setdefault("advice", ending["description"])
        ending.setdefault("shareText", f"我在口腔医学副本里活成了：{ending['title']}。")
    return endings


def build_achievements(achievement_ids: dict[str, str]) -> list[dict]:
    return [
        {
            "id": achievement_id,
            "achievementId": achievement_id,
            "majorId": MAJOR_ID,
            "title": title,
            "description": f"在口腔医学副本中解锁「{title}」。",
            "condition": {"type": "flag", "key": achievement_id},
            "shareText": f"我在口腔医学副本里解锁了：{title}。",
        }
        for title, achievement_id in achievement_ids.items()
    ]


def update_major_config(new_events: list[dict], gg_events: list[dict], endings: list[dict], achievements: list[dict], keep_events: list[dict], settings: dict) -> None:
    path = SCRIPT_DIR / "majors.json"
    majors = json.loads(path.read_text())
    for major in majors:
        if major["id"] != MAJOR_ID:
            continue
        major["intro"] = settings["intro"] or major.get("intro", {})
        if settings["initialStats"]:
            major["initialStats"] = {**major.get("initialStats", {}), **settings["initialStats"]}
        existing_by_key = {stat["key"]: stat for stat in major.get("majorStats", [])}
        major["majorStats"] = []
        for key, (name, description, initial_value) in MAJOR_STAT_META.items():
            stat = existing_by_key.get(key, {})
            major["majorStats"].append(
                {
                    "key": key,
                    "name": name,
                    "description": description,
                    "initialValue": settings.get("initialMajorStats", {}).get(key, stat.get("initialValue", initial_value)),
                }
            )

        main_by_sem = {event["semester"]: event["id"] for event in new_events if event["type"] == "main"}
        special_by_sem: dict[str, list[str]] = {}
        for event in [*keep_events, *gg_events]:
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
    gg_events = read_gg_events(paragraphs)
    endings = read_endings(paragraphs)
    achievements = build_achievements(achievement_ids)
    settings = read_settings(paragraphs)

    existing_events = json.loads((BY_MAJOR / f"{MAJOR_ID}.events.json").read_text())
    keep_events = [event for event in existing_events if event.get("type") not in {"main", "major_random", "gg_check"}]
    events = new_events + keep_events + gg_events

    (BY_MAJOR / f"{MAJOR_ID}.events.json").write_text(json.dumps(events, ensure_ascii=False) + "\n")
    (BY_MAJOR / f"{MAJOR_ID}.endings.json").write_text(json.dumps(endings, ensure_ascii=False) + "\n")
    (BY_MAJOR / f"{MAJOR_ID}.achievements.json").write_text(json.dumps(achievements, ensure_ascii=False) + "\n")
    update_major_config(new_events, gg_events, endings, achievements, keep_events, settings)
    update_aggregate("events.json", events)
    update_aggregate("endings.json", endings)
    update_aggregate("achievements.json", achievements)

    print(f"imported {len(new_events)} stomatology events, {len(gg_events)} gg checks, {len(endings)} endings, {len(achievements)} achievements")


if __name__ == "__main__":
    main()
