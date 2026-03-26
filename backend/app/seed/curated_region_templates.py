"""Build curated seasonal availability_templates for each legacy region file (git HEAD).

Used to generate per-state JSON under seasons/states/ after applying food_locality filters.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[3]

NE_MARINE: set[int] = set(range(21, 24)) | set(range(73, 86)) | {148, 150}

RANK: dict[str, int] = {"peak": 0, "moderate": 1, "light": 2}


def merge_templates(templates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    best: dict[tuple[int, int], dict[str, Any]] = {}
    for t in templates:
        fid = int(t["food_id"])
        av = str(t["availability"])
        months = t.get("months", [])
        notes = t.get("notes")
        for m in months:
            m = int(m)
            key = (fid, m)
            cur = best.get(key)
            if cur is None or RANK[av] < RANK[str(cur["availability"])]:
                best[key] = {"availability": av, "notes": notes}
    from collections import defaultdict

    groups: dict[tuple[int, str, str | None], set[int]] = defaultdict(set)
    for (fid, m), payload in best.items():
        nk = payload["notes"]
        gkey = (fid, str(payload["availability"]), nk)
        groups[gkey].add(m)
    out: list[dict[str, Any]] = []
    for (fid, av, notes), months in sorted(
        groups.items(), key=lambda x: (x[0][0], RANK[x[0][1]], x[0][2] or "")
    ):
        row: dict[str, Any] = {"food_id": fid, "availability": av, "months": sorted(months)}
        if notes is not None:
            row["notes"] = notes
        out.append(row)
    return out


def strip_food_ids(templates: list[dict[str, Any]], remove: set[int]) -> list[dict[str, Any]]:
    return [t for t in templates if int(t["food_id"]) not in remove]


def replace_food(
    templates: list[dict[str, Any]], food_id: int, new_rows: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    t = [x for x in templates if int(x["food_id"]) != food_id]
    t.extend(new_rows)
    return t


def _git_show_region(region_file: str) -> dict[str, Any]:
    rel = f"backend/app/seed/seasons/{region_file}.json"
    out = subprocess.run(
        ["git", "-C", str(REPO_ROOT), "show", f"HEAD:{rel}"],
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(out.stdout)


def curated_great_plains() -> list[dict[str, Any]]:
    gp = _git_show_region("great-plains")
    gp_remove = NE_MARINE | {33, 32, 36, 115, 116, 89, 90, 159}
    gp_t = strip_food_ids(gp["availability_templates"], gp_remove)
    gp_t = replace_food(
        gp_t,
        3,
        [
            {
                "food_id": 3,
                "availability": "light",
                "months": [7, 8],
                "notes": "Limited peaches; mostly southern fringe of the Plains.",
            },
        ],
    )
    for fid in (8, 9, 43):
        gp_t = replace_food(gp_t, fid, [])
    gp_t.extend(
        [
            {
                "food_id": 8,
                "availability": "light",
                "months": [4, 8],
                "notes": "Cool-weather spinach; High Plains short season.",
            },
            {
                "food_id": 8,
                "availability": "moderate",
                "months": [5, 7],
                "notes": "Spring and fall spinach windows.",
            },
            {
                "food_id": 8,
                "availability": "peak",
                "months": [6],
                "notes": "Best spring spinach before heat.",
            },
            {
                "food_id": 9,
                "availability": "light",
                "months": [3, 9],
                "notes": "Limited glasshouse / early plantings.",
            },
            {
                "food_id": 9,
                "availability": "moderate",
                "months": [4, 8],
                "notes": "Shoulder-season lettuce.",
            },
            {
                "food_id": 9,
                "availability": "peak",
                "months": [5, 6],
                "notes": "Peak cool-season lettuce.",
            },
            {
                "food_id": 43,
                "availability": "light",
                "months": [4],
                "notes": "Late thaw; peas go in later than Northeast.",
            },
            {
                "food_id": 43,
                "availability": "moderate",
                "months": [5, 7],
                "notes": "Spring and summer pea windows.",
            },
            {
                "food_id": 43,
                "availability": "peak",
                "months": [6],
                "notes": "Peak spring peas.",
            },
        ]
    )
    return merge_templates(gp_t)


def curated_mountain_west() -> list[dict[str, Any]]:
    mw = _git_show_region("mountain-west")
    mw_remove = NE_MARINE | {33, 2, 32, 36, 115, 116, 89, 159}
    mw_t = strip_food_ids(mw["availability_templates"], mw_remove)
    for fid in (8, 9, 43, 7):
        mw_t = replace_food(mw_t, fid, [])
    mw_t.extend(
        [
            {
                "food_id": 7,
                "availability": "light",
                "months": [5],
                "notes": "Late snowmelt; asparagus starts later.",
            },
            {
                "food_id": 7,
                "availability": "moderate",
                "months": [6],
                "notes": "Asparagus into early summer in valleys.",
            },
            {
                "food_id": 7,
                "availability": "peak",
                "months": [6],
                "notes": "Short peak in favorable pockets.",
            },
            {
                "food_id": 8,
                "availability": "light",
                "months": [5, 9],
                "notes": "Cool-weather spinach at elevation.",
            },
            {
                "food_id": 8,
                "availability": "moderate",
                "months": [6, 8],
                "notes": "Spring and fall spinach.",
            },
            {
                "food_id": 8,
                "availability": "peak",
                "months": [7],
                "notes": "Peak before peak summer heat in basins.",
            },
            {
                "food_id": 9,
                "availability": "light",
                "months": [4, 10],
                "notes": "Very short outdoor lettuce season high up.",
            },
            {
                "food_id": 9,
                "availability": "moderate",
                "months": [5, 9],
                "notes": "Spring and fall lettuce.",
            },
            {
                "food_id": 9,
                "availability": "peak",
                "months": [6, 7],
                "notes": "Peak in intermountain valleys.",
            },
            {
                "food_id": 43,
                "availability": "light",
                "months": [5],
                "notes": "Peas after last frost.",
            },
            {
                "food_id": 43,
                "availability": "moderate",
                "months": [6, 7],
                "notes": "Spring and early summer peas.",
            },
            {
                "food_id": 43,
                "availability": "peak",
                "months": [6],
                "notes": "Peak snap and shell peas.",
            },
        ]
    )
    return merge_templates(mw_t)


def curated_midwest() -> list[dict[str, Any]]:
    mw2 = _git_show_region("midwest")
    mw2_t = strip_food_ids(mw2["availability_templates"], NE_MARINE | {115})
    return merge_templates(mw2_t)


def curated_southeast() -> list[dict[str, Any]]:
    se = _git_show_region("southeast")
    se_remove = (NE_MARINE - {73, 78, 150}) | {33, 35, 89}
    se_t = strip_food_ids(se["availability_templates"], se_remove)
    se_t = replace_food(
        se_t,
        3,
        [
            {
                "food_id": 3,
                "availability": "light",
                "months": [5],
                "notes": "Early cling peaches in Deep South.",
            },
            {
                "food_id": 3,
                "availability": "moderate",
                "months": [6],
                "notes": "Georgia and Carolina peach harvest builds.",
            },
            {
                "food_id": 3,
                "availability": "peak",
                "months": [6, 7],
                "notes": "Peak Southern peach season.",
            },
            {
                "food_id": 3,
                "availability": "light",
                "months": [8],
                "notes": "Late varieties winding down.",
            },
        ],
    )
    se_t = replace_food(se_t, 106, [])
    se_t = replace_food(se_t, 107, [])
    se_t.extend(
        [
            {
                "food_id": 106,
                "availability": "light",
                "months": [5],
                "notes": "Southern staple.",
            },
            {
                "food_id": 106,
                "availability": "moderate",
                "months": [6],
                "notes": "Southern staple.",
            },
            {
                "food_id": 106,
                "availability": "peak",
                "months": [7, 8, 9],
                "notes": "Southern staple.",
            },
            {
                "food_id": 106,
                "availability": "moderate",
                "months": [10],
                "notes": "Southern staple.",
            },
            {
                "food_id": 107,
                "availability": "moderate",
                "months": [3, 4, 5],
                "notes": "Cool-season collards.",
            },
            {
                "food_id": 107,
                "availability": "peak",
                "months": [10, 11, 12],
                "notes": "Sweetened by frost.",
            },
            {
                "food_id": 107,
                "availability": "light",
                "months": [1, 2],
                "notes": "Winter harvest in mild areas.",
            },
        ]
    )
    return merge_templates(se_t)


def curated_south_central() -> list[dict[str, Any]]:
    sc = _git_show_region("south-central")
    sc_remove = {21, 22, 23, 74, 75, 76, 77, 79, 80, 81, 82, 83, 84, 148} | {
        33,
        35,
        115,
        116,
        89,
        90,
    }
    sc_t = strip_food_ids(sc["availability_templates"], sc_remove)
    for fid in (10, 12, 27):
        sc_t = replace_food(sc_t, fid, [])
    sc_t.extend(
        [
            {
                "food_id": 10,
                "availability": "light",
                "months": [4, 11],
                "notes": "Tunnel and early transplant tomatoes.",
            },
            {
                "food_id": 10,
                "availability": "moderate",
                "months": [5, 9],
                "notes": "Warming season and late fields.",
            },
            {
                "food_id": 10,
                "availability": "peak",
                "months": [6, 7, 8, 10],
                "notes": "Long hot-season tomato production.",
            },
            {
                "food_id": 12,
                "availability": "light",
                "months": [4, 11],
                "notes": "Early and late peppers.",
            },
            {
                "food_id": 12,
                "availability": "moderate",
                "months": [5, 9],
                "notes": "Shoulder months.",
            },
            {
                "food_id": 12,
                "availability": "peak",
                "months": [6, 7, 8, 10],
                "notes": "Chile and sweet peppers in southern basins.",
            },
            {
                "food_id": 27,
                "availability": "light",
                "months": [5],
                "notes": "Early melons in South Texas.",
            },
            {
                "food_id": 27,
                "availability": "moderate",
                "months": [6, 9],
                "notes": "High Plains and Rio Grande melon windows.",
            },
            {
                "food_id": 27,
                "availability": "peak",
                "months": [7, 8],
                "notes": "Peak summer watermelon.",
            },
        ]
    )
    return merge_templates(sc_t)


def curated_pacific_northwest() -> list[dict[str, Any]]:
    pn = _git_show_region("pacific-northwest")
    pn_t = strip_food_ids(pn["availability_templates"], NE_MARINE | {116})
    pn_t = replace_food(
        pn_t,
        6,
        [
            {
                "food_id": 6,
                "availability": "light",
                "months": [5],
                "notes": "Early sweet cherries (warm OR / transition).",
            },
            {
                "food_id": 6,
                "availability": "moderate",
                "months": [6],
                "notes": "WA/OR cherry harvest ramp-up.",
            },
            {
                "food_id": 6,
                "availability": "peak",
                "months": [6, 7],
                "notes": "Peak Northwest cherry season.",
            },
            {
                "food_id": 6,
                "availability": "light",
                "months": [8],
                "notes": "Late varieties.",
            },
        ],
    )
    pn_t = replace_food(
        pn_t,
        4,
        [
            {
                "food_id": 4,
                "availability": "light",
                "months": [8],
                "notes": "Early WA/OR apples.",
            },
            {
                "food_id": 4,
                "availability": "moderate",
                "months": [9],
                "notes": "Main Northwest apple harvest.",
            },
            {
                "food_id": 4,
                "availability": "peak",
                "months": [9, 10],
                "notes": "Peak apple quality and volume.",
            },
            {
                "food_id": 4,
                "availability": "light",
                "months": [11],
                "notes": "Late storage varieties.",
            },
        ],
    )
    pn_t = replace_food(
        pn_t,
        5,
        [
            {
                "food_id": 5,
                "availability": "light",
                "months": [7],
                "notes": "Early pears (OR Hood River etc.).",
            },
            {
                "food_id": 5,
                "availability": "moderate",
                "months": [8],
                "notes": "Strong late-summer pear flow.",
            },
            {
                "food_id": 5,
                "availability": "peak",
                "months": [8, 9],
                "notes": "Peak Northwest pear harvest.",
            },
            {
                "food_id": 5,
                "availability": "light",
                "months": [10],
                "notes": "Late varieties and storage.",
            },
        ],
    )
    if not any(int(t["food_id"]) == 115 for t in pn_t):
        pn_t.extend(
            [
                {
                    "food_id": 115,
                    "availability": "light",
                    "months": [4],
                    "notes": "Early fiddleheads (ostrich fern) in wet lowlands.",
                },
                {
                    "food_id": 115,
                    "availability": "peak",
                    "months": [4, 5],
                    "notes": "Peak Pacific Northwest fiddlehead season.",
                },
                {
                    "food_id": 115,
                    "availability": "moderate",
                    "months": [6],
                    "notes": "Late coiled fronds; harvest responsibly.",
                },
            ]
        )
    return merge_templates(pn_t)


def curated_california_hawaii() -> list[dict[str, Any]]:
    ch = _git_show_region("california-hawaii")
    ch_t = strip_food_ids(ch["availability_templates"], NE_MARINE | {33, 35, 115, 116})
    ch_t = replace_food(
        ch_t,
        1,
        [
            {
                "food_id": 1,
                "availability": "light",
                "months": [1, 2, 3, 11, 12],
                "notes": "Southern CA winter fields; lower volume.",
            },
            {
                "food_id": 1,
                "availability": "moderate",
                "months": [4, 7, 8, 9, 10],
                "notes": "Strong spring transition and Central Coast summer/fall.",
            },
            {
                "food_id": 1,
                "availability": "peak",
                "months": [5, 6],
                "notes": "Statewide peak — Salinas, Santa Maria, Oxnard overlap.",
            },
        ],
    )
    ch_t = replace_food(
        ch_t,
        108,
        [
            {
                "food_id": 108,
                "availability": "light",
                "months": [1, 2, 12],
                "notes": "Limited winter artichoke (coastal).",
            },
            {
                "food_id": 108,
                "availability": "moderate",
                "months": [3, 10, 11],
                "notes": "Spring and fall peaks (Castroville).",
            },
            {
                "food_id": 108,
                "availability": "peak",
                "months": [4, 5, 9],
                "notes": "Primary California artichoke harvests.",
            },
        ],
    )
    ch_t = replace_food(
        ch_t,
        104,
        [
            {
                "food_id": 104,
                "availability": "light",
                "months": [1, 2],
                "notes": "Lower winter volume; Mexico and stored fruit.",
            },
            {
                "food_id": 104,
                "availability": "moderate",
                "months": [3, 4, 11, 12],
                "notes": "Year-round California crop; variable spring lull by district.",
            },
            {
                "food_id": 104,
                "availability": "peak",
                "months": [5, 6, 7, 8, 9, 10],
                "notes": "Peak California Hass and greenskin harvest.",
            },
        ],
    )
    ch_t = replace_food(
        ch_t,
        96,
        [
            {
                "food_id": 96,
                "availability": "light",
                "months": [6, 7, 8],
                "notes": "Slower summer field lemons (coastal fog belts).",
            },
            {
                "food_id": 96,
                "availability": "moderate",
                "months": [4, 5, 9],
                "notes": "Good commercial lemon flow.",
            },
            {
                "food_id": 96,
                "availability": "peak",
                "months": [10, 11, 12, 1, 2, 3],
                "notes": "Main California lemon season — deserts and Central Valley.",
            },
        ],
    )
    ch_t = replace_food(
        ch_t,
        103,
        [
            {
                "food_id": 103,
                "availability": "light",
                "months": [7, 8],
                "notes": "Early fruit set.",
            },
            {
                "food_id": 103,
                "availability": "moderate",
                "months": [9],
                "notes": "Harvest ramp-up — Central Valley.",
            },
            {
                "food_id": 103,
                "availability": "peak",
                "months": [10, 11],
                "notes": "Peak California pomegranates.",
            },
            {
                "food_id": 103,
                "availability": "light",
                "months": [12],
                "notes": "Holiday storage fruit.",
            },
        ],
    )
    ch_t = replace_food(
        ch_t,
        120,
        [
            {
                "food_id": 120,
                "availability": "light",
                "months": [2, 11],
                "notes": "Hawaii taro shoulder seasons.",
            },
            {
                "food_id": 120,
                "availability": "moderate",
                "months": [3, 4, 9, 10],
                "notes": "Steady loʻi and dryland harvest.",
            },
            {
                "food_id": 120,
                "availability": "peak",
                "months": [5, 6, 7, 8],
                "notes": "Peak Hawaii taro availability.",
            },
        ],
    )
    ch_t = replace_food(
        ch_t,
        98,
        [
            {
                "food_id": 98,
                "availability": "light",
                "months": [1, 12],
                "notes": "Lower volume — Hawaii pineapple.",
            },
            {
                "food_id": 98,
                "availability": "moderate",
                "months": [2, 3, 10, 11],
                "notes": "Good commercial flow.",
            },
            {
                "food_id": 98,
                "availability": "peak",
                "months": [4, 5, 6, 7, 8, 9],
                "notes": "Peak Hawaii pineapple harvest.",
            },
        ],
    )
    ch_t = replace_food(
        ch_t,
        97,
        [
            {
                "food_id": 97,
                "availability": "light",
                "months": [3, 4],
                "notes": "Early Hawaii/South FL mangoes.",
            },
            {
                "food_id": 97,
                "availability": "moderate",
                "months": [5, 10],
                "notes": "Shoulder crop.",
            },
            {
                "food_id": 97,
                "availability": "peak",
                "months": [6, 7, 8, 9],
                "notes": "Peak tropical mango season.",
            },
        ],
    )
    return merge_templates(ch_t)


def curated_northeast() -> list[dict[str, Any]]:
    data = _git_show_region("northeast")
    return merge_templates(data["availability_templates"])


CURATED_BUILDERS = {
    "northeast": curated_northeast,
    "midwest": curated_midwest,
    "southeast": curated_southeast,
    "south-central": curated_south_central,
    "great-plains": curated_great_plains,
    "mountain-west": curated_mountain_west,
    "pacific-northwest": curated_pacific_northwest,
    "california-hawaii": curated_california_hawaii,
}


def templates_for_region(region_key: str) -> list[dict[str, Any]]:
    fn = CURATED_BUILDERS.get(region_key)
    if fn is None:
        raise KeyError(f"Unknown region: {region_key}")
    return fn()
