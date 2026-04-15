# Riot Games API — League of Legends

**Research question**: What do I need to know to implement a LoL player lookup + match history feature using the Riot Games API?
**Date**: 2026-04-15
**Sources searched**: developer.riotgames.com, hextechdocs.dev, riot-api-libraries.readthedocs.io, riot-watcher.readthedocs.io, mingweisamuel.com/riotapi-schema, static.developer.riotgames.com/docs/lol/queues.json, darkintaqt.com, github.com/fightmegg/riot-api, github.com/RiotGames/developer-relations issues, github.com/Lacerdash, codepull.com
**Coverage notes**: Endpoint URLs, parameters, and routing are well-covered. Full ParticipantDto field list is partially incomplete — the official portal renders via JS and won't scrape; the schema was reconstructed from community wrappers and GitHub issues. Core fields for kills/deaths/assists/damage/champion/role/win are confirmed. CORS behavior is confirmed.

---

## Key findings (TL;DR)

1. API key goes in `X-Riot-Token` header — never expose it client-side; browser direct calls are blocked by CORS — [hextechdocs.dev](https://hextechdocs.dev/getting-started-with-the-riot-games-api/), [riot-api-libraries CORS](https://riot-api-libraries.readthedocs.io/en/latest/mobile.html)
2. Player lookup is a two-step process: `account-v1` (regional cluster) to get PUUID from `gameName#tagLine`, then `summoner-v4` (platform host) to get summoner data — [developer.riotgames.com/docs/lol](https://developer.riotgames.com/docs/lol)
3. Match history uses `match-v5` on regional cluster hosts (americas/europe/asia/sea), not platform hosts — [riot-watcher docs](https://riot-watcher.readthedocs.io/en/latest/riotwatcher/LeagueOfLegends/MatchApiV5.html)
4. Match details live in `info.participants[]` — each entry has kills, deaths, assists, champion, role, damage dealt, win/loss, gold, CS — [codepull.com](https://codepull.com/api/getting-league-of-legends-matches-stats-from-the-riot-api/)
5. Dev keys expire every 24h and are rate-limited to 20 req/s / 100 req/2min — [developer.riotgames.com/docs/portal](https://developer.riotgames.com/docs/portal)

---

## Evidence

### 1. Authentication

**Header (recommended):**
```
X-Riot-Token: RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Query param (alternative, avoid in production):**
```
?api_key=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Source: "API key should be included within the header as the 'X-Riot-Token'" — [hextechdocs.dev](https://hextechdocs.dev/getting-started-with-the-riot-games-api/)

**Key types and rate limits:**

| Key type       | Expiry          | Rate limit                              | Use case                     |
|----------------|-----------------|----------------------------------------|------------------------------|
| Development    | Every 24 hours  | 20 req/1s, 100 req/2min (per region)   | Local dev/testing only       |
| Personal       | Does not expire | 20 req/1s, 100 req/2min                | Private tools, small communities |
| Production     | Does not expire | 500 req/10s, 30,000 req/10min          | Public-facing apps           |

Source: [developer.riotgames.com/docs/portal](https://developer.riotgames.com/docs/portal)

**Rate limit types (three layers):**
1. **Application-level** — per API key, per region
2. **Method-level** — per endpoint
3. **Service-level** — across all applications using Riot backend

429 responses include a `Retry-After` header.

**Getting a key:** Sign into [developer.riotgames.com](https://developer.riotgames.com) with your Riot account. Dev key is provisioned immediately. Production key requires submitting an application with a working prototype.

---

### 2. Regional Routing — Two Separate Concepts

This is the most confusing part of the API. There are **two different host types** used by different endpoints.

#### Platform hosts (used by summoner-v4, league-v4, champion-mastery)
These are per-server-region:

| Platform | Host |
|----------|------|
| NA       | `na1.api.riotgames.com` |
| EUW      | `euw1.api.riotgames.com` |
| EUNE     | `eun1.api.riotgames.com` |
| KR       | `kr.api.riotgames.com` |
| JP       | `jp1.api.riotgames.com` |
| BR       | `br1.api.riotgames.com` |
| LAN      | `la1.api.riotgames.com` |
| LAS      | `la2.api.riotgames.com` |
| OCE      | `oc1.api.riotgames.com` |
| TR       | `tr1.api.riotgames.com` |
| RU       | `ru.api.riotgames.com` |
| PH       | `ph2.api.riotgames.com` |
| SG       | `sg2.api.riotgames.com` |
| TH       | `th2.api.riotgames.com` |
| TW       | `tw2.api.riotgames.com` |
| VN       | `vn2.api.riotgames.com` |

#### Regional cluster hosts (used by account-v1 AND match-v5)
These are continental aggregates:

| Region   | Host | Covers |
|----------|------|--------|
| americas | `americas.api.riotgames.com` | NA, BR, LAN, LAS |
| europe   | `europe.api.riotgames.com` | EUW, EUNE, TR, RU |
| asia     | `asia.api.riotgames.com` | KR, JP |
| sea      | `sea.api.riotgames.com` | OCE, PH, SG, TH, TW, VN |

**Mapping platform -> regional cluster (needed to route match-v5 calls):**
```
na1, br1, la1, la2  ->  americas
euw1, eun1, tr1, ru ->  europe
kr, jp1             ->  asia
oc1, ph2, sg2, th2, tw2, vn2 -> sea
```

Source: [developer.riotgames.com/docs/lol](https://developer.riotgames.com/docs/lol)

---

### 3. Account Lookup (Riot ID -> PUUID)

**Step 1: Get PUUID from Riot ID (gameName#tagLine)**

```
GET https://{regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
```

- Uses **regional cluster** host, not platform host
- `gameName` = the part before `#`
- `tagLine` = the part after `#` (e.g., `NA1`, `EUW`, or a custom tag)
- You can query any account from any cluster (recommended: use nearest)

**Response (AccountDto):**
```json
{
  "puuid": "string",
  "gameName": "string",
  "tagLine": "string"
}
```

Example:
```
GET https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Doublelift/NA1
```

**Step 2 (optional): Get summoner data from PUUID**

Only needed if you require summoner level, profile icon, or encrypted summoner ID for league-v4 calls.

```
GET https://{platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}
```

- Uses **platform** host
- PUUID from account-v1 works directly here

**Response (SummonerDto):**
```json
{
  "id": "string (encrypted summoner ID, platform-specific)",
  "accountId": "string (encrypted, platform-specific)",
  "puuid": "string",
  "profileIconId": 4567,
  "revisionDate": 1713820800000,
  "summonerLevel": 312
}
```

Note: The `name` field is deprecated as of November 2023. Use `account-v1` gameName/tagLine instead.

Source: [darkintaqt.com/blog/summoner-v4](https://darkintaqt.com/blog/summoner-v4), [developer.riotgames.com/docs/lol](https://developer.riotgames.com/docs/lol)

**Also available:**
```
GET https://{regional}.api.riotgames.com/riot/account/v1/accounts/by-puuid/{puuid}
```
Returns gameName + tagLine for a known PUUID.

---

### 4. Match History

```
GET https://{regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids
```

**Query parameters:**

| Parameter  | Type   | Default | Max  | Description |
|------------|--------|---------|------|-------------|
| `queue`    | int    | —       | —    | Filter by queue ID (see queue IDs below) |
| `type`     | string | —       | —    | `ranked`, `normal`, `tourney`, `tutorial` |
| `start`    | int    | 0       | —    | Pagination offset (start index) |
| `count`    | int    | 20      | 100  | Number of match IDs to return |
| `startTime`| long   | —       | —    | Epoch timestamp in **seconds** (not ms) |
| `endTime`  | long   | —       | —    | Epoch timestamp in **seconds** (not ms) |

**Returns:** Array of match ID strings
```json
["NA1_5123456789", "NA1_5123456788", ...]
```

**Example — last 20 ranked solo matches:**
```
GET https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/PUUID_HERE/ids?queue=420&count=20&start=0
```

**Key queue IDs:**

| ID   | Mode |
|------|------|
| 420  | Ranked Solo/Duo (5v5 SR) |
| 440  | Ranked Flex (5v5 SR) |
| 400  | Normal Draft Pick |
| 430  | Normal Blind Pick |
| 490  | Quickplay |
| 450  | ARAM |
| 700  | Clash |
| 1700 | Arena |
| 1710 | Arena (16 player) |
| 480  | Swiftplay |

Full list: [static.developer.riotgames.com/docs/lol/queues.json](https://static.developer.riotgames.com/docs/lol/queues.json)

Source: [riot-watcher MatchApiV5 docs](https://riot-watcher.readthedocs.io/en/latest/riotwatcher/LeagueOfLegends/MatchApiV5.html)

---

### 5. Match Details

```
GET https://{regional}.api.riotgames.com/lol/match/v5/matches/{matchId}
```

**Returns: MatchDto**

```json
{
  "metadata": {
    "dataVersion": "2",
    "matchId": "NA1_5123456789",
    "participants": ["puuid1", "puuid2", "...10 total"]
  },
  "info": {
    "gameId": 5123456789,
    "gameCreation": 1713820800000,
    "gameDuration": 1842,
    "gameStartTimestamp": 1713820800000,
    "gameEndTimestamp": 1713822642000,
    "gameMode": "CLASSIC",
    "gameType": "MATCHED_GAME",
    "gameVersion": "14.7.123456789",
    "mapId": 11,
    "platformId": "NA1",
    "queueId": 420,
    "participants": [ /* array of ParticipantDto — see below */ ],
    "teams": [ /* array of TeamDto */ ]
  }
}
```

**Key `info` fields:**
- `gameCreation` — Unix ms when lobby was created
- `gameStartTimestamp` — Unix ms when game actually started
- `gameDuration` — seconds (post ~patch 11.20); earlier patches stored ms
- `queueId` — matches queue IDs listed above

#### ParticipantDto — key fields for cycle-gg

**Identity:**
```
puuid                   string   globally unique
summonerId              string   platform-specific encrypted ID
riotIdGameName          string   gameName portion of Riot ID
riotIdTagline           string   tagLine portion
summonerLevel           int
profileIcon             int
```

**Champion:**
```
championId              int      numeric champion ID
championName            string   e.g. "Jinx", "LeeSin"
championTransform       int      0=none, 1=Slayer, 2=Assassin (Kayn)
champExperience         int
champLevel              int      level at end of game
```

**Role/Position:**
```
teamId                  int      100=Blue, 200=Red
individualPosition      string   lane without constraints: "TOP","JUNGLE","MIDDLE","BOTTOM","UTILITY","INVALID"
teamPosition            string   constrained best-guess: "TOP","JUNGLE","MIDDLE","BOTTOM","UTILITY"
lane                    string   raw lane value
role                    string   raw role value (legacy, less reliable)
```

Note: `teamPosition` is the more reliable field. It can be empty string in some edge cases (dodgy games, remakes).

**Core combat stats:**
```
kills                   int
deaths                  int
assists                 int
largestKillingSpree     int
largestMultiKill        int
killingSprees           int
doubleKills             int
tripleKills             int
quadraKills             int
pentaKills              int
unrealKills             int
firstBloodKill          bool
firstBloodAssist        bool
```

**Damage dealt:**
```
totalDamageDealt                    int   all damage types combined
totalDamageDealtToChampions         int   to champions only (key metric)
physicalDamageDealtToChampions      int
magicDamageDealtToChampions         int
trueDamageDealtToChampions          int
largestCriticalStrike               int
```

**Damage taken/healed:**
```
totalDamageTaken                    int
physicalDamageTaken                 int
magicDamageTaken                    int
trueDamageTaken                     int
damageSelfMitigated                 int
totalHeal                           int
totalHealsOnTeammates               int
totalDamageShieldedOnTeammates      int
```

**Economy:**
```
goldEarned              int
goldSpent               int
totalMinionsKilled      int   CS (creep score) — minions only
neutralMinionsKilled    int   jungle camp CS
```

**Vision:**
```
visionScore             int
wardsPlaced             int
wardsKilled             int
visionWardsBoughtInGame int
sightWardsBoughtInGame  int
detectorWardsPlaced     int
```

**Objectives:**
```
turretKills             int
inhibitorKills          int
baronKills              int
dragonKills             int
objectivesStolen        int
objectivesStolenAssists int
```

**Utility:**
```
totalTimeCCDealt        int   CC score equivalent
timeCCingOthers         int
totalTimeSpentDead      int
timePlayed              int   actual seconds played (useful for remakes)
```

**Outcome:**
```
win                     bool
gameEndedInSurrender    bool
gameEndedInEarlySurrender bool
teamEarlySurrendered    bool
```

**Items:**
```
item0 - item6           int   item IDs (item6 = trinket slot)
itemsPurchased          int
consumablesPurchased    int
```

**Summoner spells:**
```
summoner1Id             int
summoner2Id             int
summoner1Casts          int
summoner2Casts          int
```

**Spells/abilities cast:**
```
spell1Casts             int
spell2Casts             int
spell3Casts             int
spell4Casts             int
```

**Perks (runes):**
```
perks: {
  statPerks: { defense, flex, offense },
  styles: [
    { description: "primaryStyle", selections: [...], style: int },
    { description: "subStyle", selections: [...], style: int }
  ]
}
```

**Undocumented fields present in responses** (added via patch, docs lagging):
- `allInPings`, `assistMePings`, `basicPings`, `commandPings`, `dangerPings`, `enemyMissingPings`, `onMyWayPings`, `pushPings` (all int — ping counts)
- `totalAllyJungleMinionsKilled`, `totalEnemyJungleMinionsKilled` (added 2023-04-19)
- `riotIdGameName` (added 2023-11-22)
- `playerScore0` through `playerScore11`, also nested in `missions` object

Source: [GitHub issue #754 RiotGames/developer-relations](https://github.com/RiotGames/developer-relations/issues/754), [fightmegg/riot-api types](https://github.com/fightmegg/riot-api/blob/master/src/@types/index.ts), [gist RiotTuxedo match-v5](https://gist.github.com/RiotTuxedo/758ee4d88693b768a880ece93cd78663)

#### TeamDto shape
```json
{
  "teamId": 100,
  "win": true,
  "bans": [{ "championId": 157, "pickTurn": 1 }],
  "objectives": {
    "baron": { "first": true, "kills": 1 },
    "champion": { "first": true, "kills": 23 },
    "dragon": { "first": false, "kills": 2 },
    "inhibitor": { "first": false, "kills": 0 },
    "riftHerald": { "first": true, "kills": 1 },
    "tower": { "first": true, "kills": 8 }
  }
}
```

#### Match timeline (optional, heavier call)
```
GET https://{regional}.api.riotgames.com/lol/match/v5/matches/{matchId}/timeline
```
Returns frame-by-frame events (kills, item purchases, level ups). Not all matches have timeline data.

---

### 6. CORS — Cannot Call From Browser Directly

"There is no way to make [direct browser calls] without exposing your API key to users." Direct browser calls are blocked — the Riot API does not return `Access-Control-Allow-Origin` headers.

This is confirmed and intentional. Source: [riot-api-libraries CORS/mobile doc](https://riot-api-libraries.readthedocs.io/en/latest/mobile.html)

**Required architecture for a web app:**
```
Browser  ->  Your backend proxy  ->  Riot API
```

The backend:
1. Holds the API key as a server-side env var
2. Accepts requests from your frontend
3. Forwards to Riot API with `X-Riot-Token` header
4. Returns data to the frontend

For cycle-gg (Vite + React frontend), you need at minimum a small API server (e.g., Express, Fastify, or a serverless function like Vercel API routes / Cloudflare Workers).

---

### 7. Full Implementation Flow (Account Lookup + Match History)

```
1. User inputs:  "Doublelift#NA1"
   Split on '#'  =>  gameName="Doublelift", tagLine="NA1"

2. Determine regional cluster from user's selected region
   e.g. user picks "NA"  =>  cluster = "americas"

3. GET https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Doublelift/NA1
   Header: X-Riot-Token: <key>
   Response: { puuid: "abc123...", gameName: "Doublelift", tagLine: "NA1" }

4. GET https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/abc123.../ids
     ?queue=420&count=20&start=0
   Response: ["NA1_5123456789", "NA1_5123456788", ...]

5. For each matchId:
   GET https://americas.api.riotgames.com/lol/match/v5/matches/NA1_5123456789
   Response: MatchDto (see above)

6. Find this player in response.info.participants
   by matching participant.puuid === puuid from step 3

7. Extract: kills, deaths, assists, win, championName, teamPosition,
            totalDamageDealtToChampions, totalMinionsKilled,
            visionScore, goldEarned, gameDuration (from info level)
```

**Rate limit reality check:** 20 matches = 1 IDs call + 20 detail calls = 21 requests.
Dev key allows 20/s so this is fine for a single user. Batch carefully if loading multiple users.

---

### 8. Data Dragon (Static Assets)

Champion icons, item images, spell icons are NOT in the API responses — only IDs. Use Data Dragon:

```
https://ddragon.leagueoflegends.com/cdn/versions.json      # get latest patch version
https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json
https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{championName}.png
https://ddragon.leagueoflegends.com/cdn/{version}/img/item/{itemId}.png
https://ddragon.leagueoflegends.com/cdn/{version}/img/profileicon/{iconId}.png
```

Current version as of research: `14.8.1` (verify via versions.json). No auth required. CORS is open — can be called directly from browser.

Source: [developer.riotgames.com/docs/lol](https://developer.riotgames.com/docs/lol)

---

## Analysis

The API design has a clear two-tier routing pattern that trips up most new implementers: `account-v1` and `match-v5` use continental cluster hosts, while `summoner-v4` and `league-v4` use platform hosts. For cycle-gg you need to store the player's platform (`na1`) alongside their PUUID to correctly construct both types of URLs.

For a React + Vite SPA, the simplest proxy approach is Vite's built-in dev proxy for development (`server.proxy` in `vite.config.ts`) and a Vercel/Cloudflare serverless function for production. This avoids spinning up a separate Express server.

The match data is rich enough for any performance tracking use case. The most relevant fields for a "how did I perform" tracker are: `kills`, `deaths`, `assists`, `totalDamageDealtToChampions`, `teamPosition`, `championName`, `win`, `totalMinionsKilled`, `visionScore`, and `gameDuration` from `info`.

One known gotcha: `gameDuration` was stored in milliseconds in games before approximately patch 11.20. After that patch, it's in seconds. Check the `gameStartTimestamp` and `gameEndTimestamp` fields to compute duration independently if you need backward compatibility.

---

## Open Questions

- **Exact summoner-v4 response with latest patch:** The `id` (summonerId) field was reported missing in a 2024 bug report (#1092) — test before relying on it.
- **Rate limit headers:** The exact header names for current rate limit remaining info (e.g., `X-Rate-Limit-Count`, `X-App-Rate-Limit`) were not confirmed with a live call. Known from community docs to exist but not independently verified here.
- **`sea` cluster coverage:** Exact mapping of ph2/sg2/th2/tw2/vn2 to `sea` vs `asia` not 100% confirmed beyond the docs page summary.
- **`type` parameter vs `queue` parameter:** Whether combining `type=ranked` with `queue=420` is additive or redundant was not confirmed — safe to just use `queue=420` alone.

---

## Sources

1. [Riot Developer Portal — LoL docs](https://developer.riotgames.com/docs/lol)
2. [Riot Developer Portal — Portal/key docs](https://developer.riotgames.com/docs/portal)
3. [hextechdocs.dev — Getting Started](https://hextechdocs.dev/getting-started-with-the-riot-games-api/)
4. [riot-api-libraries — CORS/Mobile](https://riot-api-libraries.readthedocs.io/en/latest/mobile.html)
5. [riot-api-libraries — IDs](https://riot-api-libraries.readthedocs.io/en/latest/ids.html)
6. [riot-api-libraries — Collecting Data](https://riot-api-libraries.readthedocs.io/en/latest/collectingdata.html)
7. [RiotWatcher MatchApiV5 docs](https://riot-watcher.readthedocs.io/en/latest/riotwatcher/LeagueOfLegends/MatchApiV5.html)
8. [darkintaqt.com — summoner-v4](https://darkintaqt.com/blog/summoner-v4)
9. [static.developer.riotgames.com — queues.json](https://static.developer.riotgames.com/docs/lol/queues.json)
10. [GitHub — RiotGames/developer-relations issue #754 (undocumented ParticipantDto fields)](https://github.com/RiotGames/developer-relations/issues/754)
11. [GitHub — fightmegg/riot-api TypeScript types](https://github.com/fightmegg/riot-api/blob/master/src/@types/index.ts)
12. [Gist — RiotTuxedo match-v5 changelog](https://gist.github.com/RiotTuxedo/758ee4d88693b768a880ece93cd78663)
13. [codepull.com — LoL match stats from Riot API](https://codepull.com/api/getting-league-of-legends-matches-stats-from-the-riot-api/)
14. [GitHub — Lacerdash Extracting Match Data notebook](https://github.com/Lacerdash/Extracting-League-of-Legends-data-with-Riot-Api/blob/main/Extracting%20Match%20Data.ipynb)
15. [Riot Games DevRel — Summoner Name to Riot ID migration](https://www.riotgames.com/en/DevRel/summoner-names-to-riot-id)
16. [mingweisamuel.com — Riot API OpenAPI schema tool](http://www.mingweisamuel.com/riotapi-schema/tool/)
