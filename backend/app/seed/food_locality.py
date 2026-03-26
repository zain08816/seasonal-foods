"""Per-food US state locality: a food appears in a state's seasonal seed data only if
that state is listed here (commercial, common wild/foraged, or strong regional fishery).

Foods omitted from this map are treated as available in all 50 states when their
regional template includes them.
"""

from __future__ import annotations

import re

ALL_STATES = frozenset(
    {
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
    }
)

# food_id -> states where it is meaningfully local (subset of ALL_STATES)
FOOD_LOCAL_STATES: dict[int, frozenset[str]] = {
    # Citrus & warm-climate fruit
    93: frozenset(
        {"VA", "WV", "NC", "SC", "GA", "FL", "AL", "MS", "TN", "KY", "LA", "AR", "TX"}
    ),  # muscadines
    94: frozenset({"FL", "TX", "CA", "AZ", "HI"}),  # oranges
    95: frozenset({"FL", "TX", "CA", "AZ", "HI"}),  # grapefruit
    96: frozenset({"FL", "TX", "CA", "AZ", "HI"}),  # lemons — incl. Hawaiʻi growers
    97: frozenset({"HI", "FL"}),  # mangoes
    98: frozenset({"HI"}),  # pineapple — US commercial
    99: frozenset({"WA", "OR", "ID", "MT", "WY", "AK"}),  # huckleberries
    102: frozenset({"CA", "WA", "OR", "UT", "CO", "ID"}),  # apricots — Intermountain/West
    103: frozenset({"CA"}),  # pomegranates — US commercial core
    104: frozenset({"CA", "HI", "FL"}),  # avocados
    105: frozenset({"HI", "FL"}),  # guava
    # Vegetables / herbs with narrow belts
    106: frozenset(
        {"VA", "NC", "SC", "GA", "FL", "AL", "MS", "TN", "KY", "AR", "LA", "TX", "OK", "MO"}
    ),
    107: frozenset(
        {"VA", "NC", "SC", "GA", "FL", "AL", "MS", "TN", "KY", "AR", "LA", "TX", "OK", "MD", "DE"}
    ),
    108: frozenset({"CA"}),  # artichokes
    111: frozenset({"TX", "NM", "AZ", "CA"}),  # tomatillos
    115: frozenset({"ME", "NH", "VT", "NY", "MA", "CT", "WA", "OR"}),  # fiddleheads
    116: frozenset(
        {
            "WV",
            "VA",
            "KY",
            "TN",
            "NC",
            "GA",
            "PA",
            "NY",
            "VT",
            "NH",
            "ME",
            "OH",
            "MD",
            "SC",
            "AL",
        }
    ),
    117: frozenset({"FL", "TX", "LA", "CA", "AZ"}),  # chayote
    120: frozenset({"HI"}),  # taro — US center of production
    121: frozenset({"HI", "FL", "CA"}),  # lemongrass — niche farms
    124: frozenset({"TX", "NM", "AZ", "CA"}),  # epazote
    # Fungi
    128: frozenset({"OR", "WA", "ID", "MT"}),
    130: frozenset({"OR", "WA", "ID"}),
    131: frozenset({"CA"}),  # candy cap — California oak
    133: frozenset({"OR", "WA"}),
    # Seafood & freshwater
    73: frozenset(
        {"NJ", "DE", "MD", "VA", "NC", "SC", "GA", "FL", "AL", "MS", "LA", "TX"}
    ),  # blue crab (Chesapeake + Gulf; not northern New England)
    74: frozenset({"ME", "NH", "MA", "RI", "CT", "NY", "NJ"}),  # American lobster
    135: frozenset({"WA", "OR", "CA", "AK"}),  # Dungeness
    136: frozenset({"WA", "OR", "CA", "AK", "ID"}),  # Pacific salmon
    137: frozenset({"WA", "OR", "AK", "CA"}),
    138: frozenset({"WA", "OR", "CA"}),
    139: frozenset({"TX", "LA", "MS", "AL", "FL"}),  # Gulf shrimp
    140: frozenset({"TX", "LA", "MS", "AL", "FL", "GA", "SC", "NC"}),
    141: frozenset({"TX", "LA", "MS", "AL", "FL", "GA", "SC", "NC"}),
    142: frozenset({"LA", "TX", "MS", "AR"}),  # crawfish belt
    144: frozenset(
        {"MN", "WI", "MI", "OH", "IN", "IL", "IA", "MO", "ND", "SD", "NE", "MT"}
    ),  # walleye — Great Plains / Great Lakes focus
    146: frozenset({"TX", "LA", "MS", "AL", "FL", "SC", "NC"}),
    147: frozenset({"FL"}),  # stone crab
    149: frozenset({"WA", "OR"}),  # razor clams
    # Game
    151: frozenset(
        {"MT", "WY", "CO", "NM", "AZ", "UT", "WA", "OR", "ID", "CA", "NV", "AK"}
    ),
    152: frozenset({"TX", "FL", "GA", "AL", "MS", "LA", "CA", "SC", "NC", "TN", "AR", "OK"}),
    153: frozenset(
        {"ND", "SD", "NE", "KS", "OK", "TX", "MN", "IA", "MO", "MT", "WY", "CO", "ID"}
    ),
    154: frozenset(
        {
            "TX",
            "OK",
            "KS",
            "NE",
            "SD",
            "GA",
            "AL",
            "MS",
            "LA",
            "AR",
            "TN",
            "KY",
            "FL",
            "AZ",
            "NM",
            "CA",
        }
    ),
    155: frozenset({"AK", "ME", "NH", "VT", "MN", "MI", "NY", "ID", "MT", "WY", "CO"}),
    156: frozenset(
        {
            "MT",
            "WY",
            "CO",
            "NM",
            "AZ",
            "UT",
            "TX",
            "OK",
            "KS",
            "NE",
            "SD",
            "ND",
            "ID",
            "NV",
            "CA",
        }
    ),
    157: frozenset({"MT", "WY", "SD", "ND", "NE", "KS", "OK", "CO", "ID", "UT", "AZ", "NM", "TX"}),
    160: frozenset({"AZ", "NM", "TX"}),
    161: frozenset({"NV", "UT", "CO", "ID", "OR", "WA", "MT", "WY", "CA", "AZ", "NM"}),
    162: frozenset({"AK"}),
}

# Ocean (or Gulf) shoreline — excludes states with only Great Lakes / inland waters.
LANDLOCKED_NO_OCEAN: frozenset[str] = frozenset(
    {
        "PA",
        "VT",
        "WV",
        "KY",
        "TN",
        "AR",
        "OH",
        "IN",
        "IL",
        "MO",
        "IA",
        "MN",
        "WI",
        "MI",
        "ND",
        "SD",
        "NE",
        "KS",
        "OK",
        "CO",
        "WY",
        "MT",
        "NM",
        "AZ",
        "UT",
        "NV",
        "ID",
    }
)

COASTAL_US: frozenset[str] = ALL_STATES - LANDLOCKED_NO_OCEAN

_DEFAULT_COASTAL_SEAFOOD: frozenset[int] = frozenset(
    {
        21,
        22,
        23,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        83,
        84,
        85,
        148,
        150,
    }
)

for _fid in _DEFAULT_COASTAL_SEAFOOD:
    FOOD_LOCAL_STATES.setdefault(_fid, COASTAL_US)

# Gulf of Maine / Northwest Atlantic cod — not Hawaiʻi-local.
FOOD_LOCAL_STATES.setdefault(82, COASTAL_US - {"HI"})


# True if food_id may appear for this state when the regional baseline includes it.
def food_is_local_to_state(food_id: int, state_code: str) -> bool:
    st = state_code.upper()
    allowed = FOOD_LOCAL_STATES.get(food_id)
    if allowed is None:
        return True
    return st in allowed


# Strip notes that reference California production when generating HI data.
def scrub_hawaii_notes(templates: list[dict]) -> list[dict]:
    ca_place_fragments = (
        "Santa Maria",
        "Oxnard",
        "Castroville",
        "Central Coast",
        "Central Valley",
        "desert valleys",
        "island supply extend",
    )
    out: list[dict] = []
    for row in templates:
        r = dict(row)
        notes = r.get("notes")
        if isinstance(notes, str):
            n = notes
            n = (
                n.replace("California", "Hawaiʻi")
                .replace("CA cool", "Cool")
                .replace("CA lavender", "Lavender")
                .replace("Mild CA climate", "Mild island climate")
            )
            n = re.sub(r"\bCA\b", "Hawaiʻi", n)
            for frag in ca_place_fragments:
                n = n.replace(frag, "local farms")
            n = n.replace("Salinas", "local growers").replace("local farms, local farms", "local farms")
            n = n.replace("local growers, local farms", "local growers")
            if n.startswith("Statewide peak"):
                n = "Strong spring strawberry peaks from island growers."
            if "Mexico and stored fruit" in n:
                n = n.replace("Mexico and stored fruit", "imports and cold storage")
            r["notes"] = n
        out.append(r)
    return out
