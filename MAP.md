# MAPA KODU — projekt-mebli.jsx

Plik referencyjny do szybkich edycji. Wszystkie wymiary w mm, linie kodu orientacyjne.

---

## Globalne stałe (linia ~27)

```
T = 25              grubość każdej płyty [mm]
IW1 = 2150          wewnętrzna szerokość regału (2200 - 2*T)
dx1(f) = round(IW1 * f)   — helper, np. dx1(1/3) ≈ 717
```

## Układ współrzędnych SVG

**fy(mm)** — przelicznik "mm od podłogi → SVG Y", używany w Szafie, Łazience, Butach:
```
fy(mm) = bodyBot - t - mm * S
fy(0)    = wewnętrzna podłoga
fy(2200) = 2200mm od podłogi (wyżej = niższy Y w SVG)
```
**W Regale nie ma fy()** — rects[] budowane z cursorem od góry w dół.

Skale S (px/mm):
| Mebel       | S    |
|-------------|------|
| Regal       | 0.12 |
| Szafa       | 0.09 |
| Łazienka    | 0.16 |
| Buty F/S    | 0.20 |
| Buty góra   | 0.22 |

---

## 01 · REGAL NA KSIĄŻKI

**Dane:** linia 32–52 (`REGAL`)  
**Wymiary:** 2200 × 2545 × (350 góra / 600 dół) mm, nóżki 100 mm

### rows[] — rzędy od GÓRY do DOŁU (linia 35–42)

```
idx  clearH  co                              dividers (frac IW1)
 0    200    rząd otwarty                    [1/3, 5/6]
 1    200    rząd otwarty                    [1/6, 2/3]
 2    300    rząd otwarty                    [1/3, 5/6]
 3    300    rząd otwarty                    [1/6, 2/3]
 4    350    rząd otwarty                    [1/3, 5/6]
 5    350    rząd otwarty + partialShelfAbove [1/2, 5/6]
 6    310    SZAFKA dół (isCabinet)          [1/3, 2/3]
 7    310    SZAFKA dół (isCabinet)          [1/3, 2/3]
```

Suma: (200+200+300+300+350+350+310+310) + 7×25 = 2495 = outerH − 2T ✓  
**Jeśli zmieniasz clearH jednego rzędu — musisz dopasować inny (lub outerH) żeby suma się zgadzała.**

### Ważne zmienne regału

| Zmienna (linia ~43)    | Znaczenie |
|------------------------|-----------|
| `partialShelfEnd`      | do jakiego x sięga niepełna półka nad row 5 → `dx1(5/6)` |
| `cabShelfFrac`         | wew. półka w sekcji szafkowej sięga do `dx1(2/3)` od lewej |

### Drzwi regału (linia 44–48)

3 drzwi, dolna sekcja (rows 6+7 razem):
```
door 0: 0..1/3     uchwyt prawy, otwiera się w lewo
door 1: 1/3..2/3   uchwyt prawy, otwiera się w lewo
door 2: 2/3..1     uchwyt lewy,  otwiera się w prawo  ← "P bez półki"
```

### Komponenty SVG

- `RegalFront` linia 157–206
- `RegalSide` linia 207–233

---

## 02 · SZAFA W KORYTARZU

**Dane:** linia 54–70 (`SZAFA`)  
**Wymiary:** 2760 × 2910 × 500 mm, 5 segmentów

### Stałe (linia 56–59)

```
W2 = 2760,  H2 = 2910,  D2 = 500
IW2 = 2710  (wew. szer.)
SEG = 527   (szer. jednego segmentu, ≈ IW2/5 z uwzgl. 3 przegródek)
```

### SzafaFront (linia 238–403)

Kluczowe Y-poziomy:
```
y2200 = fy(2200)   główna półka podziałowa (dolna/górna strefa)
yFloor = bodyBot-t wewnętrzna podłoga
```

**Segment 1** (linia ~293)
```
Szuflada duża:   0 – 600 mm     AnimDrw
Półka:           600 mm
Drzwi:           600 – 2200 mm  AnimDoor  (uchwyt prawy)
Górna półka mid: fy((2200+H2-T)/2)
Górne drzwi:     2200 – 2910 mm
```

**Segment 2** (linia ~314)
```
Szuflada dolna:  0 – 300 mm     AnimDrw
Szuflada górna:  300 – 600 mm   AnimDrw
Półka:           600 mm
4 półki równe:   fy(938), fy(1275), fy(1613), fy(1950)   ← co ~337mm
Drzwi:           600 – 2200 mm (uchwyt prawy, otwiera lewo)
Górne drzwi:     2200 – 2910 mm
```

**Segment 3** (linia ~333)
```
Szuflada dolna:  0 – 300 mm     AnimDrw
Szuflada górna:  300 – 600 mm   AnimDrw
Półka:           600 mm
Drążek:          1900 mm        Rod
Półka nad drążk: 1950 mm
Drzwi:           600 – 2200 mm (uchwyt lewy, otwiera prawo)
Górne drzwi:     2200 – 2910 mm
```

**Segment 4+5 (połączone, linia ~353)**
```
Półki otwarte:   200, 400, 600 mm
Drążek:          1900 mm
Półka nad drążk: 1950 mm
2× drzwi dolne (para):  0 – 2200 mm  (połówki)
2× drzwi górne:         2200 – 2910 mm (po jednym na połówkę)
```

### Komponenty SVG

- `SzafaFront` linia 238–403
- `SzafaSide` linia 407–423
- `SzafaTop` linia 426–446

---

## 03 · SZAFKA ŁAZIENKOWA

**Dane:** linia 72–91 (`LAZIENKA`)  
**Wymiary:** 790 × 2480 × 440 mm, dostęp z dwóch stron

### Stałe (linia 73–75)

```
W3 = 790,  H3 = 2480,  D3 = 440
IW3 = 740 (wew. szer.),  ID3 = 390 (wew. głęb.)
```

### LazienkaFront (linia 451–615)

Strefy od dołu:

| od–do mm | co | kluczowa zmienna |
|----------|----|-----------------|
| 0–750    | Geberit + drzwiczki na magnesy (zdejmowane) | `y700 = fy(750)` |
| 750–1000 | otwarta półka (dostęp z przodu) | `y1000 = fy(1000)` |
| 1000–1230 | ściana, dostęp z boku (półki boczne po prawej) | `yTopDoorBot = fy(1230)` |
| 1230–2480 | drzwi otwierane w lewo + 4 półki | `topShelfYs` |

**Geberit:** GEB_W = 170 mm, pozycja od lewej, wysokość 0–1220 mm  
**GEB_TOP_MM = 1220** (linia ~461) — zmień tu żeby przesunąć Geberit  
**TOP_DOOR_BOTTOM_MM = 1230** (GEB_TOP_MM + 10)

**4 półki w sekcji drzwiowej** (linia ~482):
```
topClear = 2480 - 50 - 1230 = 1200 mm
shGap    = 1200 / 5 = 240 mm
półki: fy(1470), fy(1710), fy(1950), fy(2190)
```
Chcesz zmienić rozstaw → zmień `5` na inną liczbę lub ręcznie wpisz `[...]`.

**Półki boczne (po prawej, linia ~474):**  
`SHELF_W = 200 mm` — szerokość strefy półek bocznych (wchodzi w skład 790mm)

**Lampa** (linia ~490): `fy(1830)`, ø150 mm — środek na 1830 mm od podłogi

### Komponenty SVG

- `LazienkaFront` linia 451–615
- `LazienkaSide` linia 617–701
- `LazienkaTop` linia 703–742

---

## 04 · SZAFKA NA BUTY (PRZEDPOKÓJ)

**Dane:** linia 93–110 (`BUTY`)  
**Wymiary:** trapez front 680 / tył 530, głęb. 250, wys. 2000 mm

### Stałe (linia 97–99)

```
W4F = 680  (szer. front dolny)
W4B = 530  (szer. tył dolny)
D4  = 250  (głębokość)
H4  = 2000 (całkowita wysokość)

BLAT_H = 1200   blat na 1200 mm od podłogi
TOP_W  = 530    szerokość kolumny górnej
TOP_D  = 180    głębokość kolumny górnej (cofnięta do tyłu)
BUTY.offset = 150  (W4F - W4B) — skos lewej ściany
```

### ButyFront (linia 747–836)

Strefy od dołu:

| od–do mm | co | zmienne |
|----------|----|---------|
| 0–1200   | dolna szafka (trapez), 2 drzwi, 3 półki | `yBlatTop = fy(1200)` |
| 1200–1238 | blat 38 mm | `BLAT_T = 38mm`, `yBlatBot` |
| 1238–1400 | górna kolumna — pusta przestrzeń | — |
| 1400–1600 | otwarta półka nr 1 | `yUp1 = fy(1400)` |
| 1600–2000 | otwarta półka nr 2 | `yUp2 = fy(1600)` |

Drzwi górne (linia ~792): 1238 – fy(1600), zawiasy z lewej, uchwyt z prawej  
Wnętrze drzwi górnych: półka na `fy(1800)` (dymowana gdy zamknięte)

Drzwi dolne (linia ~808): 2 skrzydła od `yBlatBot`, zawiasy na zewnątrz  
3 półki dolne: `fy(300)`, `fy(600)`, `fy(900)` (dymowane gdy zamknięte)

### Komponenty SVG

- `ButyFront` linia 747–836
- `ButySide` linia 838–879
- `ButyTop` linia 881–914

---

## SZYBKIE PRZEPISY

### Przesuń półkę o X mm (Szafa / Łazienka / Buty)
```
Znajdź fy(STARA_WARTOŚĆ) → zamień na fy(NOWA_WARTOŚĆ)
```

### Zmień wysokość rzędu (Regal)
```
REGAL.rows[i].clearH = NOWA_WARTOŚĆ
Pamiętaj: suma clearH + 7×25 musi = 2495
Zazwyczaj zmieniasz dwa rzędy jednocześnie.
```

### Dodaj półkę (Szafa)
```jsx
// W odpowiednim IIFE segmentu w SzafaFront:
<Shelf x={L} y={fy(WYSOKOSC_MM)} w={w}/>
```

### Dodaj półkę (Regal)
```
REGAL.rows nie mają swobodnych półek — struktura to rzędy z dividerami.
Żeby dodać podziałkę w rzędzie: dodaj frac do rows[i].dividers.
```

### Zmień drążek (Szafa seg 3 lub 4+5)
```
yRod = fy(NOWA_WYSOKOSC)  →  Rod x= y=yRod
Półka nad drążkiem zazwyczaj +50mm wyżej.
```

### Zmień tekst specyfikacji
```
REGAL.specs, SZAFA.specs, LAZIENKA.specs, BUTY.specs
Każdy wpis to [etykieta, wartość].
```

---

## UWAGI

- Pliki `*-kopia.jsx` i `*-kopia 2.jsx` — NIE EDYTOWAĆ, to ręczne snapshoty
- `AnimDoor` i `AnimDrw` (linia ~140–154) — współdzielone animowane drzwi/szuflady
- `Dim` (linia ~113) — komponent wymiaru z linią i strzałkami
- App (linia 917) — zarządza stanem: `tab`, `view`, `doorsOpen`, `theme`, `printAll`
- localStorage: zapisuje stan pod kluczem `projekt-mebli.v1`
