# Gym statue images

The Gym progression shows a marble statue being carved over 8 stages. Generate one image per stage and save them as:

`public/statue/stage-0.png` … `public/statue/stage-7.png`

The app uses them automatically and falls back to the drawn placeholder for any that are missing.

**Every image:**
- square, 1024×1024
- same camera, framing, lighting and plinth
- warm black background (#0b0b0c)
- soft gold rim light from above
- the figure stays the same man throughout, a classical heroic male torso and head, front three-quarter view
- no text and no watermark

Generate stage 0 first, then pass it as the reference image for every later stage, so the block, plinth and framing stay identical.

| Stage | Name | Points | Prompt |
|---|---|---|---|
| 0 | Raw stone | 0 | An uncarved rough block of white marble on a dark stone plinth, chisel and mallet resting at its base, dust on the plinth, dramatic low-key studio lighting, gold rim light, warm black background, photorealistic sculpture photography |
| 1 | First cut | 1 | The same marble block with the first rough chisel cuts: only the outline of a head and shoulders barely hinted at the top, most of the block still raw, marble chips on the plinth, same lighting and framing |
| 2 | Rough form | 12 | The same block, now a crude roughed-out male torso and head emerging from the top half, deep tool marks everywhere, no detail yet, lower half still raw stone, same lighting and framing |
| 3 | Shaped | 30 | The figure clearly a man's torso: shoulders, chest and arms blocked in, coarse tooth-chisel texture, the waist still merging into raw stone, same lighting and framing |
| 4 | Defined | 60 | An athletic male torso with visible chest, shoulder and arm muscle forms, abs lightly roughed in, rasp texture on the surface, base still rough stone, same lighting and framing |
| 5 | Carved | 100 | A muscular classical male torso with defined pecs, delts, arms and six-pack, crisp anatomy, surface smoothed but not polished, small rough patch at the base, same lighting and framing |
| 6 | Polished | 160 | The same heroic muscular statue, fully carved and smooth, polished marble catching the gold rim light, faint veins in the marble, the base now a clean carved plinth, same lighting and framing |
| 7 | Masterpiece | 250 | The finished masterpiece: a flawless heroic marble statue of a powerful muscular man, gleaming polished marble with subtle gold leaf accents, a soft golden glow behind it, museum-quality, same framing |
