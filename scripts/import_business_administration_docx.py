from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import docx


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = ROOT / "src" / "data" / "script"
BY_MAJOR = SCRIPT_DIR / "byMajor"

MAJOR_ID = "business_administration"
DOCX_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/Users/zhenzhen/Downloads/B02-工商管理-完整四年脚本补强包.docx")

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
    "专业上头值": "obsession",
    "majorInterest": "obsession",
    "精神电量": "energy",
    "mentalEnergy": "energy",
    "滤镜": "filter",
    "滤镜厚度": "filter",
    "filterThickness": "filter",
    "绩点意志": "gpaWill",
    "gpaDesire": "gpaWill",
    "就业幻觉": "careerFantasy",
    "jobIllusion": "careerFantasy",
    "逃跑冲动": "escapeImpulse",
    "跑路冲动": "escapeImpulse",
    "escapeImpulse": "escapeImpulse",
    "嘴硬浓度": "stubbornness",
    "stubbornness": "stubbornness",
    "发际线余额": "hairline",
    "hairline": "hairline",
}

MAJOR_STAT_MAP = {
    "PPT求生力": "pptSurvival",
    "pptSurvival": "pptSurvival",
    "管理黑话浓度": "businessJargon",
    "businessJargon": "businessJargon",
    "实习焦虑": "internshipAnxiety",
    "实习焦虑值": "internshipAnxiety",
    "internshipAnxiety": "internshipAnxiety",
    "管理滤镜": "managementFilter",
    "managementFilter": "managementFilter",
    "PPT浓度": "pptDensity",
    "pptDensity": "pptDensity",
    "职业迷雾": "careerFog",
    "careerFog": "careerFog",
}

HIDDEN_STAT_MAP = {
    "社交能量": "socialEnergy",
}

MAJOR_STAT_SCALE = {
    "pptSurvival": 3,
    "businessJargon": 3,
    "internshipAnxiety": 3,
    "managementFilter": 1,
    "pptDensity": 1,
    "careerFog": 1,
}

MAJOR_STAT_META = {
    "pptSurvival": ("PPT求生力", "把普通观点包装成战略路径、把小组材料整成能讲清楚的PPT的能力。", 38),
    "businessJargon": ("管理黑话浓度", "抓手、闭环、赋能、沉淀、颗粒度、方法论等词汇在脑内自动生成的浓度。", 22),
    "internshipAnxiety": ("实习焦虑值", "意识到“管理”岗位不是入职第一天就让你管理别人后的现实焦虑。", 18),
    "managementFilter": ("管理滤镜", "对商业精英、管理层和公司运营的想象厚度。", 76),
    "pptDensity": ("PPT浓度", "小组展示、案例分析和汇报排版积累的浓度。", 0),
    "careerFog": ("职业迷雾", "宽口径专业带来的就业定位迷雾。", 20),
}

ROUTE_MARKER_MAP = {
    "public_exam_hint": ["business_administration_route_civil_service"],
    "management_trainee_hint": ["business_administration_route_management_trainee"],
    "operation_market_hint": ["business_administration_route_operation_market"],
    "hr_hint": ["business_administration_route_hr"],
    "postgrad_hint": ["business_administration_route_postgrad"],
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
        if in_achievements and line.strip():
            names.append(line.strip())
    return {name: f"ach_{MAJOR_ID}_doc_{i:03d}" for i, name in enumerate(names, 1)}


def option_to_choice(option: dict, idx: int, achievement_ids: dict[str, str]) -> dict:
    choice_id = ["a", "b", "c"][idx]
    tags = split_slash(option.get("标签", "")) + split_slash(option.get("获得标签", ""))
    marker = option.get("路线标记", "").strip()
    tendency = option.get("结局倾向", "").strip()
    if marker:
        tags.append(marker)
    if tendency:
        tags.append(tendency)
    stats, major_stats, hidden_stats, delta_tags = parse_delta(option.get("数值变化", ""))
    all_tags = unique([*tags, *delta_tags])
    flags = [f"{MAJOR_ID}_tag_{tag}" for tag in all_tags]

    route_add: list[str] = []
    for route in ROUTE_MARKER_MAP.get(marker, []):
        route_add.append(route)

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
    if route_add:
        effects["routeAdd"] = route_add
    if unlocked:
        effects["achievementIds"] = unique(unlocked)

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
        "tagsUnlocked": all_tags,
        "achievementUnlocked": unique(unlocked),
        "nextEventId": None,
        "nextEvent": None,
    }


def finalize_event(raw: dict, achievement_ids: dict[str, str]) -> dict:
    event_id = raw["事件ID"]
    options = [option_to_choice(option, idx, achievement_ids) for idx, option in enumerate(raw.get("options", []))]
    is_random = "_random_" in event_id
    semester = SEMESTER_MAP.get(raw.get("学年学期", ""), raw.get("学年学期"))
    if is_random:
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
        if line.startswith("七、工商管理中途 GG"):
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
            for key in ["按钮文案", "反馈文案", "数值变化", "标签", "获得标签", "路线标记", "结局倾向"]:
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
    share_texts: list[str] = []
    in_share_texts = False
    for line in paragraphs:
        if line.startswith("十二、分享文案"):
            in_share_texts = True
            continue
        if in_share_texts:
            if line.startswith("分享文案") and "：" in line:
                share_texts.append(field_value(line))
            continue
        if line.startswith("标题：") or line.startswith("开场标题："):
            intro["title"] = field_value(line)
        elif line.startswith("开场文案："):
            intro["body"] = field_value(line)
        elif line.startswith("系统提醒：") or line.startswith("系统吐槽："):
            intro["body"] = f"{intro.get('body', '')}\n\n{field_value(line)}".strip()
        elif line.startswith("进入按钮："):
            intro["startButton"] = field_value(line)

        code_match = re.match(r"^([A-Za-z_]+)\s*:\s*(\d+),?$", line.strip())
        if code_match:
            name, raw = code_match.groups()
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
        if line.startswith("七、工商管理中途 GG"):
            in_gg = True
            continue
        if in_gg and line.startswith("八、终局结局"):
            break
        if not in_gg:
            continue
        if line.startswith("中途GG ID："):
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
        elif line.startswith("称号："):
            title = field_value(line)
            current["title"] = title
            current["semester"] = "y4s1" if "PPT" in title else "y3s2"
        elif line.startswith("文案："):
            current["description"] = field_value(line)
        elif line.startswith("标签："):
            current["tags"] = split_slash(field_value(line))
    if current:
        events.append(current)

    for event in events:
        title = event.get("title", "工商管理中途警报")
        tags = event.get("tags", [])
        event.setdefault("semester", "y3s2")
        event.setdefault("description", "")
        event.setdefault("conditions", {})
        event.setdefault("triggerCondition", event["conditions"])
        options = [
            {
                "id": f"{event['id']}_gg",
                "choiceId": f"{event['id']}_gg",
                "text": f"正面处理「{title}」",
                "feedback": event["description"],
                "resultText": event["description"],
                "effects": {"stats": {"energy": -12, "escapeImpulse": 8}, "flagsAdd": [f"{MAJOR_ID}_flag_{event['id']}"], "ggRisk": 1},
                "statChanges": {"energy": -12, "escapeImpulse": 8},
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
                "text": "先管理自己，再管理世界",
                "feedback": "你没有立刻解决所有问题，但你终于承认：工商管理第一课不是管理别人，而是管理预期、协作和自己的崩溃边缘。",
                "resultText": "你没有立刻解决所有问题，但你终于承认：工商管理第一课不是管理别人，而是管理预期、协作和自己的崩溃边缘。",
                "effects": {"stats": {"energy": 8, "escapeImpulse": -4, "stubbornness": 5}, "flagsAdd": [f"{MAJOR_ID}_flag_revive"]},
                "statChanges": {"energy": 8, "escapeImpulse": -4, "stubbornness": 5},
                "routeChanges": [],
                "condition": None,
                "tagsUnlocked": ["自我管理续命"],
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
            current["title"] = f"工商管理·{field_value(line)}"
        elif line.startswith("触发条件："):
            current["condition"] = condition_from_text(field_value(line))
        elif line.startswith("评级："):
            current["rank"] = field_value(line)
        elif line.startswith("一句话总结："):
            current["description"] = field_value(line)
        elif line.startswith("系统诊断："):
            current["advice"] = field_value(line)
        elif line.startswith("分享文案："):
            current["shareText"] = field_value(line)
    if current:
        endings.append(current)

    for ending in endings:
        ending.setdefault("title", "工商管理结局")
        ending.setdefault("condition", {})
        ending.setdefault("description", "")
        ending.setdefault("advice", ending["description"])
        ending.setdefault("shareText", f"我在工商管理副本里活成了：{ending['title']}。")
    return endings


def build_achievements(achievement_ids: dict[str, str]) -> list[dict]:
    return [
        {
            "id": achievement_id,
            "achievementId": achievement_id,
            "majorId": MAJOR_ID,
            "title": title,
            "description": f"在工商管理副本中解锁「{title}」。",
            "condition": {"type": "flag", "key": achievement_id},
            "shareText": f"我在工商管理副本里解锁了：{title}。",
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
    word_achievements = build_achievements(achievement_ids)
    settings = read_settings(paragraphs)

    existing_events = json.loads((BY_MAJOR / f"{MAJOR_ID}.events.json").read_text())
    keep_events = [event for event in existing_events if event.get("type") not in {"main", "major_random", "gg_check"}]
    events = new_events + keep_events + gg_events

    existing_achievements = json.loads((BY_MAJOR / f"{MAJOR_ID}.achievements.json").read_text())
    existing_ids = {achievement["id"] for achievement in existing_achievements}
    achievements = existing_achievements + [achievement for achievement in word_achievements if achievement["id"] not in existing_ids]

    (BY_MAJOR / f"{MAJOR_ID}.events.json").write_text(json.dumps(events, ensure_ascii=False) + "\n")
    (BY_MAJOR / f"{MAJOR_ID}.endings.json").write_text(json.dumps(endings, ensure_ascii=False) + "\n")
    (BY_MAJOR / f"{MAJOR_ID}.achievements.json").write_text(json.dumps(achievements, ensure_ascii=False) + "\n")
    update_major_config(new_events, gg_events, endings, achievements, keep_events, settings)
    update_aggregate("events.json", events)
    update_aggregate("endings.json", endings)
    update_aggregate("achievements.json", achievements)

    print(f"imported {len(new_events)} business administration events, {len(gg_events)} gg checks, {len(endings)} endings, {len(achievements)} achievements")


if __name__ == "__main__":
    main()
