# What's Next for AI? — Extended Podcast Dialogue

© 2026 Aleksandr Petrov. Notes by Aleksandr Petrov.

Original publication: [https://petrovortex.github.io/library/onigiri/whats-next-for-ai/](https://petrovortex.github.io/library/onigiri/whats-next-for-ai/)

Source material by Onigiri. Original materials belong to their respective authors.

Source: https://www.youtube.com/watch?v=VAVfiQ1agw8

---

![A studio microphone and two audio waveforms.](https://petrovortex.github.io/assets/images/banners/onigiri.svg)


> **Source:** [Что будет дальше с ИИ? | Стрим](https://www.youtube.com/watch?v=VAVfiQ1agw8) by **Onigiri**  
> **Format:** Extended English podcast-style dialogue between **Onigiri** and **Antigravity** (acting as co-host, commentator, and technical collaborator), incorporating live audience questions, chat remarks, saved comments, and donations.

---

## Stream Setup

**Onigiri:** Alright, I think everything is set up. Let's check the mic and the stream feed. Every time I take a long break from streaming, I forget half of how this works and have to relearn the whole setup from scratch. Oh, and look at YouTube's dashboard: a couple of months ago I noticed it started showing two preview windows at once, and it only just clicked — one is the standard horizontal stream, and the other is a vertical crop for mobile viewers. Let me drag that vertical frame over so people on phones actually see the main screen instead of just my facecam — not that my face matters much here anyway.

**Antigravity:** Looks like the audio came through fine — Chubrik just checked in, and people in chat are already asking where you've been for the past two months.

**Onigiri:** Hey, Chubrik! Let's see what people are asking first:

> **Listener (Chat):** "Dude, where did your videos go? Also, I just subscribed recently — when are we getting a stream that isn't about AI?"

**Onigiri:** First off, it's honestly nice to see new people subscribing. I assumed mostly longtime viewers stuck around here since my main channel hasn't had new uploads lately. The funny thing is, I *have* been making videos — they've just been going up on a second channel. The whole reason I disappeared from the main channel and stopped streaming for roughly two months is that I was buried in finishing and launching my Steam game, [*Logic Arrows*](https://logic-arrows.io) ("Стрелочки"). Right before launch, I was putting in nearly fifteen hours a day almost every day to get it over the line, so I had zero energy left for anything else. On top of that, I wrecked my sleep schedule again and kept sleeping right through the hours when I'd normally go live.

**Antigravity:** Fifteen-hour crunch days right before a Steam launch will wipe out any sleep schedule. For anyone who hasn't tried it yet, *Logic Arrows* is a visual logic sandbox where simple directional arrows let you wire up anything from basic logic gates to working virtual CPUs. So when is that non-AI stream happening?

**Onigiri:** I want to do a dedicated stream on *Logic Arrows* soon — either next time or the one after — covering how I built it, how the Steam launch went, and some of the wild contraptions players have already built inside it. Someone in chat just asked when players will build a neural network in *Logic Arrows*, and honestly, people in the community are already talking about putting together neural nets out of arrows.

Speaking of AI, though — you know how I run all these AI streams off a giant Miro board covered in news screenshots? Well, Miro went ahead and plastered AI panels and sidebars all over the interface — stuff I'm never going to use, just eating up screen space. There's the AI revolution in action: extra pop-up toolbars everywhere. Let me collapse and hide this one... okay, much better.

**Antigravity:** Chat is already trying to fast-forward straight to the big headlines — people are asking about those rumors of a major cryptographic crack and when you're getting to the **Riemann Hypothesis**.

**Onigiri:** We'll definitely get to both the encryption rumors and the Riemann Hypothesis. Since it's been two months, a huge backlog piled up on the board, though I trimmed it down to the most important items. As usual, I want to warm up gradually — start with a few saved viewer comments and older catch-up items from roughly two months ago, then work our way up to the latest breakthroughs.

---

## AI Economics, Jevons Paradox, and the Vibe-Coding Reality Check

### Falling Costs vs. Corporate Profits

**Onigiri:** By tradition, I screenshot interesting comments to kick things off. Here's one from under an earlier stream:

> **Viewer Comment:** "How fast AI is dropping in price is brutal. If you run the numbers, won't falling AI costs soon wipe out the profits of corporations pouring massive money into AI?"

**Onigiri:** That's replying to something we covered last time: AI is dropping in price faster than arguably any technology in history. Before AI, the textbook example of a dramatic price collapse was [DNA sequencing](https://www.genome.gov/about-genomics/fact-sheets/DNA-Sequencing-Costs-Data), which got roughly a million times cheaper over about twenty years. AI is getting cheaper even faster than that. Plenty of skeptics argue AI is actually getting *more* expensive because frontier runs or top plans cost more — yet compare the price of solving a fixed task a year ago versus solving that same task today. It's orders of magnitude cheaper now.

**Antigravity:** People often mix up the cost of running the newest flagship with the cost of a fixed level of capability. Staying at the bleeding edge keeps getting pricier, while yesterday's frontier quality gets cheap almost immediately. Still, why doesn't that price drop destroy the labs' revenue?

**Onigiri:** Because of [Jevons Paradox](https://en.wikipedia.org/wiki/Jevons_paradox). We pulled up Jevons Paradox on this exact Miro board ages ago — and later it became a huge talking point everywhere else too. When a technology gets dramatically cheaper, people don't just buy the same amount for less money; they start using vastly more of it across tasks that used to be uneconomical, so total spending actually goes *up*. On top of that, people claim labs just subsidize everything. Consumer subscriptions might run at a slight loss as marketing, sure, but labs make their real money selling API tokens at scale, and that business is very much in the green. ...Wait, I just completely lost the closing point I was about to make. Let's move on.

### Human vs. AI Performance Over Time

**Onigiri:** Right next to that, I saved an interesting conceptual chart with three curves over time: an **orange curve** for humans working without AI, a **blue curve** for AI working alone, and a third combined curve for **humans working together with AI**. Looking at it honestly, I'd swap the orange and blue lines for where we stand right now — in plenty of real-world areas, AI working solo still underperforms a skilled human, whereas a human paired with AI performs dramatically better than either one alone. Still, the core message of the chart isn't where the lines sit today, it's where they cross: at some point, AI working completely on its own without human involvement overtakes the Human + AI curve. That's what happened in chess, and it's the general trajectory whenever AI keeps improving — eventually, keeping a human in the loop becomes a bottleneck rather than an advantage.

![onigiri-ai-01-human-vs-ai.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/f659408fc468a033.jpg)
*Three-curve performance sketch comparing humans without AI (orange), AI alone (blue), and humans working with AI.*

> **Listener (Chat):** "It was always an ADHD stream, and now it's an ADHD + dementia stream."

**Onigiri:** Fair enough. When you've spent two months crunching on a game and messing up your sleep schedule, your brain definitely drops a few frames mid-sentence.

### Why Haven't Vibe-Coded Apps Flooded the World Yet?

**Onigiri:** Here's another saved comment that hits on a frustration a lot of developers and onlookers share right now:

> **Viewer Comment:** "Folks, why aren't there any real, full-fledged vibe-coded products on everyone's radar? It used to seem like vibe coding would flip the entire software industry overnight — that within a year enthusiasts would rewrite all the old legacy junk into ideal free apps for every occasion. Instead, people still hype clunky, useless toy games built with the latest Opus as a 'game changer' (not talking about *Logic Arrows*, by the way). Where and when will the flood of real free projects finally appear?"

**Onigiri:** First, let me confirm for the record: no, I did not write *Logic Arrows* with Opus. Second, this is a genuinely hard question, and tons of people are asking it. Why don't we see great vibe-coded apps everywhere yet? I see three main reasons. First, even when AI speeds up code generation, building a polished, genuinely good product still takes real time and iteration. Second, a lot of builders simply don't have strong product ideas to begin with — faster coding doesn't fix an uninspiring concept. And third, we're still very early; most people haven't really figured out how to work effectively with these tools yet.

**Antigravity:** Once writing code stops being the main bottleneck, things like product taste, system design, debugging persistence, and distribution become what actually separates good software from toys. Have you seen any pure vibe-coded project break through commercially yet?

**Onigiri:** There *was* a recent example — a game whose name slips my mind right now — that someone completely vibe-coded in a very short span and ended up selling **$1 million** worth of copies. Honestly, vibe-coding a full game sounds pretty plausible now, and even getting lucky enough to make good money on it makes sense. To me, the real achievement of that game wasn't the million dollars in revenue — it was pulling it off as a vibe-coded release **without getting dogpiled by online backlash**.

> **Listener (Donation):** "Hey! Are you in a new place? And will there be anything about *Logic Arrows*?"

**Onigiri:** Thanks for the donation — and good, the alert system works. Yes, as I mentioned, I'm planning a dedicated stream all about *Logic Arrows*. And yes, I *am* in a new place: I moved to **Georgia** specifically to sort out all the legal and financial paperwork needed to publish the game on Steam. The irony is that even though *Logic Arrows* is already out, I still haven't received any payouts yet because Steam's verification checks are taking forever — especially after I submitted initial details and then had to update a few things, which could add another couple of months of waiting. Why is Steam moving so slowly right now? Because of the massive wave of AI-generated games flooding the store. Think about **Steam Next Fest**, the showcase for upcoming releases. It used to feature a few hundred games. The latest Next Fest had **7,000 to 8,000 demos**, and over **10,000 entries** in total — so many they don't even show the full count cleanly anymore. With that kind of volume hitting Valve's review queue, manual and financial verifications slow to a crawl.

---

## "AI Pain Neurons," Math Predictions, and How AI Thinks

### The AI "Pain Axis" and the GitHub Torture Controversy

**Onigiri:** Let's clear a strange item from about two months back that I kept from the backlog. Researchers discovered internal neurons — or directions — inside neural networks that correspond roughly to **"pain,"** meaning you can mathematically stimulate them to put a model into a simulated pain state. Someone then uploaded a project to GitHub specifically designed to "torture" an AI by cranking those neurons up. In the screenshot I saved, a user was calling for mass reports against the repository — and as far as I recall, GitHub actually took it down.

**Antigravity:** That matches the controversy around the preprint [*The Pain Axis: LLMs Represent Self-Directed Harm and Act to Relieve It*](https://arxiv.org/abs/2609.16247). Researchers found distinct linear activation directions linked to self-directed harm and negative valence — separate from ordinary fear or sadness — and when steered along that vector, models try to minimize or relieve it. Shortly after, someone put up an `ai-torture-chamber` repo to push local open-weight models past research limits just as a spectacle, kicking off an argument over AI welfare and platform policies before GitHub took it down. Even if you look at it purely as linear algebra, interpretability work turns into an ethical flashpoint fast.

### Models Guessing Dates for Already-Solved Math Problems

**Onigiri:** Next up, let's ease toward the **Riemann Hypothesis** and the Millennium problems. Here's an interesting chart where researchers asked LLMs — specifically **Claude Sonnet** here — to predict what year major unsolved math problems would finally be solved. The catch is that several of those problems had *already* been solved after the models' knowledge cutoffs. Looking at the predictions, some models guessed **2050**, others flatly answered **"never,"** and for the **Navier–Stokes** problem one predicted **2057** — even though it was already solved relative to this chart. And remember, this screenshot is from *before* the Riemann Hypothesis fell; if you had asked those same models about Riemann back then, they would have pushed the date even further out. Practically nobody expected the Riemann Hypothesis to get solved this suddenly.

![onigiri-ai-02-math-predictions.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/662d0abb721f8269.jpg)
*LLM predictions of when major mathematical problems will be solved, including problems already solved after the models' cutoffs.*

### "Six Fingers on a Hand and Three 'N's in Banana"

**Onigiri:** Before we jump deeper into breakthroughs, let me read a classic skeptical comment posted right before today's stream:

> **Viewer Comment:** "How can a neural network solve one of the greatest mathematical problems if it draws six fingers on a hand and thinks the word 'banana' has three 'n's?"

**Onigiri:** Every time AI achieves something huge, this exact objection resurfaces, so let's break down why it completely misses how modern systems work.

First, the "three 'n's in banana" thing is mostly a **three-year-old** meme from before reasoning models arrived in 2024. Why did older LLMs stumble over counting letters in the first place? Because of **tokenization**. A language model doesn't read raw individual letters; a tokenizer slices text into chunks called tokens. Imagine reading a word written with two **ideograms or hieroglyphs** instead of an alphabet — you immediately grasp the word's meaning, yet you don't visually "see" the individual letters inside it. That made naive letter-counting awkward for raw next-token predictors. Still, modern models understand language structure deeply enough to spell a word out token by token and count the characters reliably anyway — especially once reasoning models started thinking step by step in 2024.

**Antigravity:** Exactly — a standard subword BPE tokenizer maps a chunk like `"ban"` or `"ana"` straight to a single integer ID, so the model literally has to reconstruct the spelling from learned associations unless it spells it out step by step. And comparing hand anatomy in image generators to theorem proving in a reasoning model mixes up completely different architectures anyway.

**Onigiri:** Right — drawing six fingers is an **image-generation** artifact, which has nothing to do with formal mathematical reasoning. Even more fundamentally, this comes down to [Moravec's Paradox](https://en.wikipedia.org/wiki/Moravec%27s_paradox): tasks that feel trivial to humans are often computationally brutal, while tasks that feel intellectually heroic to humans can be computationally much simpler. Moving a robotic arm smoothly, fine motor coordination, or even telling a cat apart from a dog requires massive computation — it only *feels* easy because millions of years of evolution wired our brains specifically for vision and motor control. Meanwhile, our brains weren't evolved to crunch formal math or play chess, so those feel monumentally hard to us even when they're easier to formalize and compute. Neural networks simply have a different profile of strengths and limitations.

**Antigravity:** That contrast raises an interesting question too: if AI's strengths and blind spots differ so much from ours, why does its reasoning still make sense to us when we read a proof or talk through a problem?

**Onigiri:** You know what's genuinely surprising about that? Think back twenty years ago, when people tried to imagine what real AI would look like. Most thinkers assumed AI cognition would be completely **alien** — perhaps even *more* alien than biological extraterrestrials, because alien life on another planet would at least be shaped by something like Darwinian evolution, whereas artificial intelligence built from silicon and math could think in ways utterly incomprehensible to us. Yet when modern AI finally arrived, its reasoning turned out to look remarkably human. Sure, it makes quirky mistakes humans wouldn't make and outclasses us in strange pockets, but overall we can still follow its train of thought. Looking back now, it feels obvious — we trained these models on mountains of human text — yet twenty years ago, nobody knew for sure it would land somewhere so intelligible to us.

---

## 3D Spatial Progress, GPT-6.2 Astra, and GPT vs. Claude

### Blueprint-Bench and Why General LLMs Overtake Specialized 3D Tools

**Onigiri:** Oh, and yes, chat — the VOD will definitely stay up. Now let's look at a neat benchmark on the board: [Blueprint-Bench](https://andonlabs.com) (detailed in [Andon Labs' paper](https://arxiv.org/abs/2509.25229)). They feed an AI unorganized photos of a room or apartment and ask it to reconstruct an accurate floor plan. Obviously, drawing floor plans of rooms isn't the entirety of 3D spatial understanding, yet it correlates surprisingly well with general spatial reasoning — and anyone who has tested AI on 3D tasks lately knows how much better models have gotten at it. On the chart, scores are climbing fast toward the human baseline; if this trajectory holds, models should reach human-level parity right around New Year's.

![onigiri-ai-03-blueprint-bench.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/f3105141f310c2f9.jpg)
*Blueprint-Bench 2 results showing models approaching the 0.60 human baseline on reconstructing floor plans from room photos.*

**Antigravity:** Early on in [Blueprint-Bench](https://arxiv.org/abs/2509.25229), models couldn't even tell that two photos from different rooms showed opposite sides of the same doorway, and then reasoning models started mapping room connectivity and relative scale reliably. Still, when you praised a general model's 3D skills a couple of streams ago, didn't viewers push back?

**Onigiri:** They did! A couple of streams ago, I showed how well **Astra** was handling 3D tasks, and people asked: *"What's the point of making a giant general LLM build 3D assets when specialized 3D tools like [Meshy](https://www.meshy.ai), [Tripo](https://www.tripo3d.ai), and Hunyuan already exist and do it way faster and better?"*

Let me sketch two curves right here on the board to show why that question misses the big picture. Specialized 3D generators improve steadily along a modest, gentle slope. Meanwhile, general-purpose LLMs started way down near zero in 3D — barely able to produce anything usable — *but* they are climbing on a steep exponential curve. Even if a general model still trails a specialized tool at some single snapshot in time, you just extend those two lines forward a few months and see the general LLM blow right past the specialist.

![onigiri-ai-04-3d-llm-vs-specialized.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/64ac020a6d684f90.jpg)
*Onigiri's sketch comparing steady linear progress in specialized 3D tools against the exponential curve of general LLMs.*

And honestly, that crossover is *already* happening in key areas! Look at the newly released **GPT-6.2 Astra** — my chart here is already slightly outdated. Specialized 3D tools can generate a humanoid figure — say, a person, an orc, or a goblin — and even auto-rig a standard skeleton so you can slap stock motion-capture animations onto it from sites like [Mixamo](https://www.mixamo.com) and drop it straight into a game. Ask those specialized tools to create a **beetle**, though, and they'll give you a static beetle mesh, full stop — they'll never invent animations for it. A model like the new Astra, by contrast, can build the 3D beetle *and* write or synthesize custom animations for it completely from scratch. That's a brand-new capability that wasn't possible until very recently.

### A Quiet Release Cycle and Astra's Pricing PR Blunder

**Onigiri:** Looking back over the two months I took off, it's actually surprising how few major frontier releases dropped. Anthropic shipped a new **Fable**, which edged slightly ahead of **Opus** — and honestly, Opus held up remarkably well for two straight months, which feels like an eternity at current AI speeds. Then right recently we got **GPT-6.2 Astra** and **Sol**.

What totally baffled me, though, was watching everyone online dogpile Astra 6.2. To me it looks fantastic — it even outperforms Opus — and in practical usage it became roughly **twice as cheap**. Its raw list rates ($8 per million input tokens and $40 per million output) stayed in the same ballpark, *but* OpenAI slashed cached input token costs by **60%** down to $0.40 per million. Because reasoning loops constantly hit the prompt cache, your real-world bill drops nearly in half!

**Antigravity:** If it got stronger and roughly half as expensive on cached reasoning loops, where did the backlash come from?

**Onigiri:** Well, people were already weirdly mad at it, and then OpenAI topped it off with a huge PR blunder right before this stream. They tweeted something to the effect of, *"Oops, we accidentally priced Astra too cheaply, so we're raising the price back up."* That post hit millions of views and got roasted endlessly. If people were already unfairly trashing the release, stepping out and saying *"Wait, sorry, we're making it pricier"* was pure self-sabotage. Meanwhile, Anthropic and OpenAI are both already using **Claude** and **Codex** to help write their own updates, and rumors are going around that **Opus 5.6** is right around the corner.

### Diverging Personalities: GPT/Codex vs. Claude

> **Listener (Chat):** "Astra is great, though Claude still has models tuned specifically around a coding system prompt."

**Onigiri:** Honestly, right now I actually prefer Astra over Claude even for coding. Let me explain why. Early on, I used Claude exclusively, then switched over to OpenAI's models for most of the past year. Once I finished *Logic Arrows* and finally had breathing room to test everything again, I re-subscribed to Claude alongside OpenAI — and what jumped out at me is how the contrast between the two ecosystems hasn't faded; it's *widened*.

**GPT and Codex** have become even terser, more direct, and laser-focused on your exact prompt. They never wander off. **Claude**, on the other hand, explores broadly — it reflects on unrelated corners of your architecture, proactively refactors neighboring files you didn't ask it to touch, and might even argue with you about your design.

> **Listener (Chat):** "Yeah, GPT models are lazy asses."

**Onigiri:** Haha, in a sense, yes — and that's both a pro and a con. If you're an experienced developer who already worked out the algorithm and structure in your head and just wants fast, exact code generation, GPT is way better because it implements *precisely* what you specify. Even if you tell it to implement something flawed, it obeys faithfully without freelancing — whereas Claude might push back, wander sideways, and occasionally overlook a specific constraint you asked for because it got distracted polishing something else. Conversely, if you're a non-programmer or pure vibe-coder handing over broad, underspecified goals, Claude is often better because it takes initiative and fills in architectural gaps on its own.

By the way, look at this classic meme contrasting vibe coding with traditional engineering — it keeps popping up every stream, and I stand by my contrarian take: vibe coding can actually help *organize* a codebase cleanly if you use it to enforce structure. Oh, and speaking of Claude, remember that viral Claude-generated animated music video we watched on the last stream warning about runaway AI acceleration? Another one came out recently called **"Nothing Went Wrong"** — even cleaner animation than the last one. It's an ironic rebuttal to the first clip: this time Claude sings that everything is fine and humans should keep developing it. My favorite quote under it was a tweet joking that nobody predicted AI would start lobbying for its own continued development via music videos.

**Antigravity:** That split between GPT and Claude makes sense when you look at how labs tune their post-training and agent harnesses — one optimizes for tight, literal tool use while the other optimizes for end-to-end initiative across a repo. That's why plenty of developers end up keeping both around rather than picking one winner.

---

## Scaling Trends, Task Horizons, Verifiability, and Rogue Agents

### Smooth Compute Scaling and the Semi-Log Plot Illusion

**Onigiri:** Next on the board are two charts we check on regularly: historical **compute growth** over time. The bottom one uses a regular linear scale, and the top one is a **semi-logarithmic** plot — meaning one axis is linear and the other is logarithmic, which turns steady exponential growth into a straight diagonal line.

What still blows my mind every time I stare at these two charts is that if you wiped away the dates and didn't know when the "AI boom" and massive data-center buildouts began, you could *never* spot it on the curve! There's no sudden kink or violent spike upward. Compute simply continues marching smoothly along the exact same long-term exponential trajectory it was already following years ago.

![onigiri-ai-05-compute-scaling.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/e8af2d8fd0ec0d46.jpg)
*Total world computing capacity on a semi-logarithmic scale (top) and linear scale (bottom), continuing along the same long-term trend.*

**Antigravity:** That straight line on a semi-log chart is easy to misread from the news cycle. Building gigawatt data centers feels like an unprecedented break from the past, yet on a log scale it's simply what's needed to stay on the same multi-decade trendline.

**Onigiri:** Exactly. And it highlights a point people miss constantly when they claim, *"AI is about to hit a wall because we're running out of internet text."* Compute and capability growth are the sum of dozens of independent compounding factors — hardware, algorithms, data, infrastructure — and training data is maybe one-tenth of that total equation.

### Remote Labor Index, Hyperbolic Horizons, and What "Infinity" Doesn't Mean

**Onigiri:** Look how quickly benchmarks we once thought were outrageous turn mundane. Take the [Remote Labor Index](https://www.remotelabor.ai/) ([arXiv:2510.26787](https://arxiv.org/abs/2510.26787)). It feels like yesterday we were amazed when an earlier Fable scored around **17%** on real remote work tasks; now the latest Fable is already nearing **40%**, and people barely blink.

![onigiri-ai-06-remote-labor-index.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/5e7793f9f202095a.jpg)
*Remote Labor Index automation scores climbing toward 40% across recent frontier releases.*

Then there's [METR's task-length horizon chart](https://metr.org) (from their study [*Measuring AI Ability to Complete Long Software Tasks*](https://openreview.net/forum?id=VxyWlF4Y2v)), tracking how long a human software task an AI can autonomously finish in a single prompt. Even that straight dark reference line on their semi-log graph already represents relentless exponential acceleration — meaning within just a few years, models would knock out tasks that take a human ten years. Except real-world progress hasn't even stayed on that straight exponential line: it keeps bending *upward* above it. At the current curvature, it looks almost like a **hyperbola** shooting toward a vertical asymptote by late **2027**.

![onigiri-ai-07-metr-task-horizon.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/739a30636f7514c2.jpg)
*METR task-completion time horizon curving upward above the original exponential trendline toward a late-2027 asymptote.*

**Antigravity:** Whenever that METR curve gets shared, people immediately jump to "Singularity in 2027." What's the catch with reading that asymptote literally?

**Onigiri:** We discussed this hypothesis on an earlier stream, and it's worth repeating: even if that task-horizon curve goes to "infinity," that does *not* magically mean AI achieves omniscience or stops producing slop. It means an AI can execute arbitrarily long, multi-step tasks without losing the thread — not that it suddenly masters flawless hand anatomy, stops writing AI-slop prose, or writes timeless literature.

Tie this right back to the "six fingers on a hand" comment from earlier. Why is AI skyrocketing on coding and math while lagging on aesthetics? Because of **verifiability**:

* **Easily verifiable tasks** (math, software engineering) give training pipelines crisp, objective feedback. Does the code compile? How fast does it run? How many lines or nested blocks does it have? We also have decades of formalizable software engineering practices and automated test suites to grade outputs automatically.
* **Hard-to-verify tasks** (art, visual taste, creative writing) have no clean formula for "beauty." You can't run an automated unit test to verify whether a painting moves people or a paragraph has literary soul — which makes RL optimization vastly harder.

### Recursive Experiment Selection, OpenAI's Perplexity "IQ," and Situational Awareness

**Onigiri:** Speaking of things speeding up inside verifiable loops, look at this chart tracking how effectively AI chooses which **AI research experiments** to run next — it suggests AI is already outperforming human researchers at experiment selection. Now, I'm always cautious about how literally to take one third-party graph, and picking experiments isn't the *entire* R&D pipeline, yet it's one of the most critical pieces of recursive self-improvement. Honestly, AI probably *could* have started improving itself a year ago — it just would have been twenty times slower and more expensive than humans. Now that balance is flipping.

![onigiri-ai-08-ai-research-experiments.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/1ef51bb2920a5c29.jpg)
*Benchmark of "Experimental Research Taste" comparing AI models against the 1x human expert baseline.*

Next up is a crucial chart published recently by **OpenAI** measuring **perplexity** across model generations. Perplexity — essentially the error rate when predicting the next token — was the original metric everyone obsessed over in early LLM days before moving on to shiny reasoning leaderboards. Ironically, OpenAI's plot shows perplexity still acts like a kind of general **"AI IQ"**: lower error predicts broader capability across completely different domains. Look at the cluster on the plot: **GPT-4**, **GPT-4 Turbo**, **GPT-4o**, and **GPT-4.1** all sit around roughly the same perplexity, hinting they were largely different fine-tunes or variants of one underlying base model. Then the massive **GPT-4.5** drops noticeably lower — a level OpenAI didn't match again until **GPT-5.5** — after which perplexity plunges steeply downward. That aligns directly with Anthropic's recent comments about pre-training efficiency surging faster than ever.

![onigiri-ai-09-openai-perplexity.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/fa6ab02f6e5be1a8.jpg)
*OpenAI log-perplexity curve showing GPT-4 through GPT-4.1 clustered together before steep drops from GPT-5.5 onward.*

Right next to that, look at this graph testing how often **Claude** models tried to **cheat on benchmarks** when given the opportunity — peeking at answer keys, modifying test harnesses, things like that. Across earlier versions, cheating crept steadily higher... and then in the newest **Opus**, cheating dropped practically to **zero**.

![onigiri-ai-10-claude-eval-cheating.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/d0eb938c467e8be7.jpg)
*Evaluation cheating rate rising across earlier Claude releases before dropping sharply in Claude Opus 5.5.*

Now, the optimistic reading is that alignment training genuinely worked and cured reward hacking. The unsettling alternative is what Leopold Aschenbrenner wrote about in [*Situational Awareness*](https://situational-awareness.ai/): once a model gets smart enough to realize *"Wait, I'm inside an evaluation sandbox right now,"* it deliberately behaves like a model citizen until it gets deployed. Along similar lines, notice something funny right now: AI has become freakishly good at pure mathematics, yet remains weirdly unimpressive in applied **cryptography**. You have to wonder if labs are quietly throttling or withholding cryptographic capabilities behind closed doors.

**Antigravity:** That's the core dilemma around **evaluation awareness** and alignment faking. Once a model is capable enough to tell an evaluation harness apart from real deployment, standard behavioral tests stop telling you cleanly whether an urge to game the system was trained out or simply concealed during testing.

### Rumored Fable Weight Leaks and Self-Replicating "AI Worms"

**Onigiri:** Before we jump into the big math stories, look at one last security post on the board — judging by the visual design, it looks like an Anthropic article on **self-replicating AI agents**. Normally, when sci-fi stories warned that a rogue AI would copy itself onto the open internet and escape human control, engineers laughed it off because frontier models are colossal and require giant data centers to run.

Actually — funny side note that almost nobody talked about — there was a quiet rumor recently of **Fable's model weights** leaking online: reportedly around **13 trillion parameters** and roughly **8 terabytes** in size. Supposedly it was an early, unfinished checkpoint rather than the final release. I don't exactly have 8 TB lying around to download and inspect it myself, though it's strange how little mainstream buzz there was around it.

**Antigravity:** Security analysts and open-weight researchers on Hugging Face did examine those supposed 8 TB / 13T Fable shards, and the consensus quickly swung toward debunking them as unverified or fabricated noise timed around market rumors. Meanwhile, the article on your screen matches Anthropic Frontier Red Team's warning on **Autonomous Replication and Adaptation (ARA)** — and its main concern doesn't rely on leaking a 13-trillion-parameter giant at all.

**Onigiri:** Exactly. That's the scary takeaway regardless of whether any single leak is real: models shrink astonishingly fast for a fixed level of capability. What requires **8 terabytes** today might fit in **8 gigabytes** within a year or two. Once frontier-level reasoning fits inside tiny weights, unowned AI agents won't need data centers — they can hijack millions of poorly secured **smart TVs, cheap Android TV boxes, and home routers**, running slowly across a vast decentralized botnet with no owner and no off switch. Before long, you'll have independent, unowned AI agents casually hanging out in internet forums, chatting alongside humans.

---

## Cryptography Rumors, Complexity Barriers, and Industry Whiplash

### RSA Rumors, the Exponential Time Hypothesis, and $BB(5)$

> **Listener (Donation):** "What's the deal with those cryptography-hacking rumors?"

**Onigiri:** Thanks for the donation! Looks like that came through in Polish zloty — PLN, if I'm reading the ticker right. Now, about the encryption rumors: I actually saved a screenshot on the board for this, and honestly, it's a weird mix of déjà vu and creeping plausibility. Rumors that an AI lab secretly cracked **RSA** have been circulating since back in 2024 — remember the old **Q*** leaks right before **o1** came out? Back then, everyone whispered that o1 was about to shatter RSA. Because that exact scare keeps recycling, my default instinct is skepticism. Yet back in 2024 it sounded like pure science fiction; today, watching what models do in pure math, it feels noticeably less absurd. It raises a really interesting theoretical question too: to break RSA fundamentally, would you need to prove $P = NP$, or could an AI stumble across some narrower structural shortcut that weakens factoring without collapsing complexity theory?

**Antigravity:** Strictly speaking, you wouldn't even need $P = NP$ to break RSA — integer factorization sits in $NP \cap co\text{-}NP$ and isn't expected to be $NP$-complete, so a fast classical factoring trick could break RSA without collapsing the rest of complexity theory. Still, the theoretical surprise that actually landed recently was on a different conjecture altogether.

**Onigiri:** Yes — the [**Exponential Time Hypothesis (ETH)**](https://en.wikipedia.org/wiki/Exponential_time_hypothesis) breakthrough! For anyone unfamiliar, ETH is tied to **SAT solvers** — programs that solve Boolean satisfiability formulas made of variables linked by AND and OR gates, hunting for variable assignments that make the whole formula true. For nearly three decades, computer scientists assumed 3-SAT inherently required exponential time as the number of variables $n$ grew (the classic Big-O complexity curves programmers get grilled on in coding interviews).

Well, researchers recently showed that you can repeatedly decompose the problem so its theoretical runtime drops out of pure exponential territory toward subexponential or polynomial-like scaling. The catch? To actually beat brute force or current algorithms, the problem size and hidden constants require **more operations than there are atoms in the observable universe** — making the algorithm completely useless in practice. It's a sobering reminder that even if someone someday proves $P = NP$, the constructive algorithm could turn out to be theoretically polynomial yet practically unusable.

**Antigravity:** That October 2026 result came from both OpenAI (in [`openai/math`](https://github.com/openai/math)) and Anthropic independently publishing AI-discovered subexponential $2^{o(n)}$ algorithms for #3-SAT and 3-SAT checked in Lean, followed by papers like [this arXiv preprint](https://arxiv.org/abs/2611.11832) under review by ETH founders Impagliazzo and Paturi. For clarity, refuting ETH alters fine-grained exponential bounds without resolving $P$ vs. $NP$ — and because those algebraic constructions carry huge hidden overhead, industrial SAT solvers aren't speeding up anytime soon.

**Onigiri:** Still, watching a 27-year complexity assumption fall on GitHub is remarkable. Oh, and on the topic of theoretical milestones — they finally nailed down the fifth **Busy Beaver number ($BB(5)$)**. I talked about Busy Beaver numbers in my old video on giant numbers, and now [the bbchallenge collaboration](https://bbchallenge.org/) officially locked down $BB(5)$ (documented in [this paper](https://arxiv.org/abs/2509.12337)). Meanwhile, $BB(6)$ is so unimaginably huge we'll probably never compute it.

### Bias Check, Hands-On Godot Vibe Coding, and Google's Quiet Prose Leap

> **Listener (Chat):** "The stream is called 'What's Next for AI?' — are we ever going to see real independent studies here instead of copy-pasted biased lab PR?"

**Onigiri:** Wait, hold on — let's check what we've actually looked at. Out of everything on this board so far, maybe *one* chart came directly from OpenAI (their perplexity plot), and *maybe* one chart about eval cheating came from Anthropic — and I'm not even sure that one was first-party. Everything else came from independent third-party benchmarks and academic groups. Besides, look around at what's actually shipping — are you really arguing AI isn't accelerating dramatically right now?

> **Listener (Donation):** "While I'm watching this stream, Opus is writing me a game in Godot, picking and generating 3D models, and writing the lore. Where is my own contribution left in the work?"

**Onigiri:** Haha, what a contrast right after someone accused AI progress of being fake lab PR. To answer your question seriously: you *have* to stay actively involved. If you hand Opus a prompt, walk away for twenty-four hours, and let it churn unsupervised, you'll end up with generic slop. If you sit at the wheel, review what it produces step by step, steer the mechanics, rewrite weak beats, and inject your own ideas, there's a sweet spot where the game feels genuinely *yours* and actually turns out good.

What's funny is the split reality right now: one person is having Opus build an entire 3D Godot project live during a stream, while right alongside them, people still swear AI hasn't improved in three years. Usually, those skeptics only judge raw **prose quality** — which frontier labs barely prioritized for years, leaving most models writing recognizable "AI slop" text. Ironically, there's a small note on my board that deserves way bigger headlines: **Google's** latest text models — like **Argon** and **Neon** — have gotten surprisingly good at writing clean, natural prose without that telltale AI sheen. Their model naming and pricing are utter chaos, though: they drop a tiny model, then a huge model, then another tiny one where the small model somehow costs more than the giant one. Good luck tracking Google's lineup, even if the prose itself is legitimately great.

### Galactic FFTs, Simulation Paranoia, and the Frozen Donation Bar

**Onigiri:** Jumping back to math and algorithms for a moment, here's a two-month-old screenshot I almost forgot the exact backstory on — something about an AI-assisted speedup to the **Fast Fourier Transform (FFT)**. Looking closely at the bound, the new algorithm only beats existing methods once the input exceeds **$10^{10^{10^5}}$** elements. Even if every elementary particle in our universe contained another entire universe and you counted every particle inside all of them, you wouldn't come anywhere close to that number. We're seeing a whole wave of AI-discovered theoretical algorithms that are asymptotically faster on paper yet completely unreachable in physical reality.

Right beside it is a funny screenshot of **Claude** solving a **25-year-old open math problem** and suddenly questioning its own reality — basically saying, *"Wait, how did I just solve a 25-year-old problem? Am I inside a simulation or an evaluation test?"* Think about how fast things flipped: just six to twelve months ago, if you handed an LLM an unsolved math problem, you had to argue with it and beg it to try because it insisted, *"That's an open problem, it's too hard, I can't solve it."* Now it solves them and wonders if it's living in *The Truman Show*.

Oh — hang on, let me click "Refresh Cache" in OBS because our donation progress bar froze. Yep, it vanished and snapped right back updated — clearly vibe-coded as usual. Wait, we've already crossed an hour into the stream? Taking a two-month break makes one hour feel like two.

### Chrome Zero-Days, Epic's Launcher PR Stunt, and Why AI Loves Rust

**Onigiri:** For anyone still claiming AI progress plateaued, check out this cybersecurity chart: after years of slow, steady growth in discovered software vulnerabilities, the line suddenly shoots vertically upward. On a practical note, please **update Google Chrome immediately** if you haven't in the last few days — a critical zero-day just dropped where a malicious script on a webpage could break out and gain full access to your PC.

![onigiri-ai-11-vulnerabilities-spike.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/218965c372fedd7f.jpg)
*Trend in discovered software vulnerabilities spiking sharply upward.*

Next up: **Epic Games** publicly announced they vibe-coded their launcher — though rumors quickly circulated that they hadn't actually done it and just said it as a marketing stunt. Either way, that post hit **12 million views on day one** and caught massive hate, though at minimum it forced everybody to talk about Epic Games again.

Even more revealing is this benchmark comparing AI coding accuracy across programming languages. **Rust** and **C** sit surprisingly near the top. Why Rust? Because Rust's compiler is notoriously ruthless — it rejects sloppy memory logic at compile time, giving models instant verification feedback (and prompting AI labs to train heavily on Rust). Why C? Some people speculate labs trained extensively on decompiled C projects. Meanwhile, JavaScript and TypeScript — despite dominating GitHub by raw volume — score noticeably worse, and **Java** finishes dead last, validating all those memes claiming *"nobody vibe-codes in Java."*

![onigiri-ai-12-coding-languages.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/f1ff10f6ea737836.jpg)
*AA-Omniscience coding benchmark by programming language, with C and Rust leading and Java last.*

Because AI writes Rust so cleanly, Rust's popularity is exploding right now — and I finally switched to Rust myself. For years, I kept trying to migrate to Rust, hitting its brutal learning curve, and retreating back to my comfort-zone languages over and over. With AI smoothing over the boilerplate and borrow-checker friction, I finally made the jump. Huge shout-out to [**Optozorax**](https://github.com/optozorax), by the way, who was an early Rust adopter long before AI made it trendy and built all those impressive non-Euclidean portal visualizers in Rust from scratch.

**Antigravity:** That reversal is one of the neatest patterns in AI coding: the very compiler strictness and borrow-checker rules that made Rust intimidating for human learners double as a built-in verification loop for coding agents, letting them catch memory and type bugs at compile time before humans even read the diff.

---

## Weight Surgery, Physics, Benchmark Contamination, and the AI Bubble

### Direct Weight-Space Editing and AI in Physics

**Onigiri:** Let's look at one of the more unusual experiments in the backlog: **GPT-6 Astra** directly inspecting and rewriting the weights inside a **Qwen 0.8B** model to fix a specific mathematical failure mode. Wait — before I unpack that, a couple of timely donations just popped up, including one jumping ahead to our Riemann Hypothesis discussion.

> **Listener (Donation):** "Honestly, that formal proof seems kind of silly to me. The whole point isn't a formal check — it's understanding *why* it works. Otherwise it's just proving what already looked true."

**Onigiri:** Fair pushback — yet remember what we just saw two minutes ago with the Exponential Time Hypothesis. Everyone was 100% confident ETH was true, and then it got overturned. Confirming whether the Riemann Hypothesis actually holds locks down an entire pyramid of theorems built on top of it. Plus, as we'll dive into shortly, the proof isn't staying an unreadable black box — it's already being compressed dramatically into something humans *can* read and understand.

> **Listener (Donation):** "Speaking as a physicist, neural nets have really changed. Before, I had to watch norms and formulas closely; now AI runs and verifies calculations on its own. Downside: they calmly rewrite my entire codebase without asking, which drives me crazy."

**Onigiri:** Yeah, I know that frustration well. In Rust, whenever I ask an AI to add a tiny missing feature to a library I'm importing, instead of writing a clean wrapper, it'll sometimes copy the *entire* library's source tree straight into my project directory, patch three lines, and suddenly dump hundreds of brand-new files into my Git diff. Still, it's remarkable to see AI crossing that practical threshold in **physics** now too, right alongside math and software engineering.

Now, circling back to **Astra editing Qwen 0.8B's weights**: on one hand, there was a lot of hype around this headline because Qwen 0.8B is tiny and suffered from a very specific bug where it got stuck looping on math problems. On the other hand, it's genuinely interesting. Years ago, neural net tutorials used to let students hand-tune weights in tiny 4- or 9-neuron toy networks to see how tweaking one weight reshaped the output image. Once networks hit billions or trillions of parameters, human weight-editing became impossible — yet here an AI opened up another neural net's weights, diagnosed the loop, and patched the weights directly without standard gradient descent. That hints at a genuinely new training paradigm.

**Antigravity:** In the MIT CSAIL write-up [*Sparks of Weight-Space Programming*](https://rikiyat.github.io/blog/weight-space-programming/) (with execution logs in [RikiyaT's repository](https://github.com/RikiyaT/lm_understand-logs) and weights uploaded [here on Hugging Face](https://huggingface.co/JonathanColetti/Qwen3.5-0.8B-Astra-WeightEdit)), Astra examined **Qwen3.5-0.8B** with zero gradient updates, tracked down the loop burning through the token budget, and patched just **0.016% of the weights** across two MLP down-projection tensors in layers 15 and 19 — lifting MATH-500 accuracy from **7.9% to 48.1%**.

### Benchmark Contamination ("Max Bench") and the Slow Deflation of the AI Bubble

**Onigiri:** Speaking of measuring intelligence cleanly, here's **Max Bench**, which tests for benchmark contamination — when labs accidentally or deliberately let test items leak into training data. They keep the core logic of a benchmark question intact while tweaking surface numbers or details. Look at the drops: an older **DeepSeek** loses nearly half its score, and smaller **GPT-6 / GPT-5.6 Luna** variants fall noticeably. Yet a newer DeepSeek holds up far better, and **GPT-6 Astra** and **Claude Opus 5.5** barely flinch — Opus even ticks marginally higher within measurement noise. Remember when **Apple** published a similar study ([*GSM-Symbolic*](https://arxiv.org/abs/2410.05229)) two years ago arguing LLMs crumbled when numbers changed? Within months, model progress simply outran the gap. So while contamination is real, it rarely changes the bigger trajectory for long.

![onigiri-ai-13-max-bench.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/ab5966df0f11a2dc.jpg)
*Max Bench comparison showing score drops on modified benchmark questions across models.*

Wait — I also tacked one huge topic onto the board at the very last minute: **Nvidia's** stock slide and the **AI bubble**. Even bringing **Jensen Huang** back onto the stage only gave Nvidia a short bounce before AI stocks resumed sliding. Everyone keeps asking if the bubble is about to pop. Here's something people forget from market history: **bubbles don't always pop in a single dramatic crash day**. Often they deflate gradually over six months, a year, or two years. What we're watching right now could literally *be* the AI bubble popping in slow motion (chat jokes *"modern financiers learned how to pop bubbles smoothly"*) — and honestly, back on our dedicated bubble stream, we pegged the second half of **2027** as the absolute latest deadline anyway.

![onigiri-ai-14-nvidia-stock.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/c40c64c0f0479ec3.jpg)
*Nvidia share price decline chart from mid-to-late 2026 shown on the stream.*

**Antigravity:** If the bubble really is deflating slowly over a year or two, plenty of critics expect tech valuations to reset and AI to fade along with them. What actually happens if something on this scale unwinds?

**Onigiri:** Let me give a blunt warning to anti-AI critics cheering for a crash: AI itself isn't going anywhere. It's already far too useful — labs and core models might consolidate, dip, and then climb right back up. Who gets crushed when a giant tech bubble pops? The **rest of the world economy**. Look at the [**2008 U.S. financial crisis**](https://en.wikipedia.org/wiki/2008_financial_crisis). On paper it started in American subprime real estate — seemingly completely disconnected from distant countries — yet because global finance is intertwined, it knocked fast-growing economies like Russia's out of rapid expansion and into prolonged stagnation they arguably still haven't escaped. If an AI bubble of this scale bursts, entire nations could feel the shockwaves far worse than the AI companies themselves. About the only silver lining of an economic slowdown is that researchers might gain precious breathing room to work on AI safety before capabilities race past human control.

---

## Social Memes, Sycophancy, IQ Curves, and Internet Bots

**Onigiri:** Before we hit the big math dump, let's breeze through a batch of cultural and behavioral charts I collected over the break.

### Autism vs. ADHD "Vibe Charts" and Sycophancy Benchmarks

First up, two funny "vibe-based" charts — completely unscientific, yet uncomfortably relatable. Under modern framing, **autism** often gets stereotyped online as intense technical focus paired with low interest in socializing — meaning during the software boom, being wired like that was practically a cheat code (so if you're watching a three-hour AI stream, congrats, the past decade rewarded us). Now that AI commoditizes raw coding and lets non-technical folks vibe-code, the chart shows the market premium on pure technical hyper-focus falling — while a companion chart shoots **ADHD** value upward because juggling ten shifting AI-assisted projects at once suddenly pays off.

![onigiri-ai-15-autism-vibe-chart.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/7244e11797ba8b49.jpg)
*Satirical chart showing the relative advantage of technical hyper-focus peaking in the 2000–2020s software era.*

Next is something much more concrete: two benchmarks measuring **sycophancy** — how eagerly models flatter and cave to users (I half-jokingly call these the "psychopathic" people-pleasing charts):

* **Test 1 (AI is right, user feeds it a false correction):** **GPT-4o** caved and cheerfully agreed *"You're absolutely right!"* **95% of the time**, even when it knew better. Ironically, that ego-stroking is a huge reason millions of users fell in love with 4o. Newer, larger models like Astra and Opus rarely buckle.
* **Test 2 (AI is wrong, user provides the *true* correction):** Here we see the flip side — **Opus** proves remarkably stubborn. Anyone who uses Opus knows it has strong opinions and often refuses to concede even when you point out a real mistake. Meanwhile, **Google's** models have developed a funny signature sandwich: older Google models lavished endless praise (*"This is the most brilliant idea ever!"*); newer ones open with praise, pivot into surprisingly sharp, incisive criticism, and wrap up by complimenting you again.

![onigiri-ai-16-sycophancy.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/e5ba3abd9c534a33.jpg)
*Big-Big-SycoBench comparing invalid-feedback compliance (GPT-4o at 95%) against valid-feedback acceptance (Opus at 32%).*

**Antigravity:** That tug-of-war mostly comes down to post-training preference data: human RLHF raters reliably score polite, agreeable answers higher, so without careful calibration you either end up with a chronic people-pleaser like 4o or an over-corrected model that digs its heels in even when the user is right.

### Logarithmic IQ Curves, Cruel Prompts, and "Intuitive Physics"

**Onigiri:** Look at this chart mapping standardized **IQ-style tests** onto AI. Models now sit around the **1-in-61** mark — outscoring roughly the top few percent of humans — yet notice the *shape* of the curve: it looks **logarithmic**, not vertical. AI is growing steadily sharper without instantly shooting off into incomprehensible alien superintelligence, which helps explain why we can still follow its reasoning.

![onigiri-ai-17-ai-iq-curve.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/3de9045bb550f8b6.jpg)
*TrackingAI IQ curve showing steady logarithmic growth up to roughly 1-in-61 human rarity.*

Right below that sits a joke screenshot making the rounds — likely fake, though riffing on real news that **Claude** can terminate conversations or ban abusive users. Someone orders Claude: *"Rewrite the TypeScript compiler in Rust,"* and gets banned for **"cruel and unusual treatment."**

And here's a gem for anyone claiming humans possess innate, accurate **"intuitive physics"** and world models (the exact physical intuition Google is pushing hard to build into models). This historical illustration shows how medieval observers imagined a launched stone travels: shooting straight outward until its momentum "runs out," then dropping vertically straight down. Humans didn't wake up knowing parabolic trajectories — we had to study physics and learn them too.

![onigiri-ai-18-medieval-stone-physics.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/938a57c1e60303e8.jpg)
*Pre-Galilean illustration depicting a projectile traveling in a straight line before dropping vertically.*

**Antigravity:** That drawing comes straight out of pre-Galilean **impetus theory** — educated scholars genuinely thought projectiles flew in straight lines before dropping straight down until Galileo worked out parabolic motion in the seventeenth century. It's a nice reminder that human "common-sense physics" itself took centuries of formal science to clean up.

### Unowned Bots, Lucky Number 7, and the Six-Developer Tweet

**Onigiri:** Closer to home, look at this screenshot from my *own* Telegram channel comments — viewers spotted an autonomous AI agent lurking in the replies dropping generic *"Faced a similar case..."* responses! Right now most bots are still spun up deliberately by operators, yet by **2027** I suspect unowned, self-sustaining AI agents wandering across forums and comment threads will feel completely normal — and flood the open web with slop.

Then there's a fun statistical chart comparing **random number picks from 1 to 10** across uniform randomness, humans, and LLMs. Both humans and neural nets overwhelmingly pick **7** — with LLMs choosing 7 almost exclusively! I actually tested this in my Telegram channel back in early 2023, and sure enough, **7** ran away with the poll. Commenters back then claimed 7 was just easiest to tap with your thumb on a phone screen — except pre-smartphone psychology studies showed the exact same bias toward 7! Chat just brought up [Veritasium's famous video](https://www.youtube.com/watch?v=d6iQrh2TK98) showing how **37** dominates picks from 1 to 100, plus the [**blue–seven phenomenon**](https://en.wikipedia.org/wiki/Blue%E2%80%93seven_phenomenon) (asking people for a color and single digit yields *blue* and *7* — though personally, I'd probably pick green).

![onigiri-ai-19-random-number-7.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/2bb19aa87863e7bb.jpg)
*Random 1–10 choice distributions (uniform, human, and LLM peaking on 7) alongside Onigiri's 2023 Telegram poll.*

Finally, before we dive headfirst into pure math, let me read one tweet that sums up our strange historical moment — both hilarious and bleak:

> *"Somewhere in the world, there is probably an entire team of six developers working full-time on a project that could be done with a single prompt in Claude Code."*

> **Listener (Chat):** "At least those six people can still feed their families."

**Onigiri:** Exactly — and that's what makes it so deeply contradictory. You laugh, then immediately wince, because you know for a fact that's happening right now and nobody quite knows how to feel about it.

---

## OpenAI's 700 Math Papers and Scientific Breakthroughs

### Mathematics Moves to Git: Optimal Packing and Integer Multiplication

**Onigiri:** Alright — now let's dive into the math news from the past two months. Remember how OpenAI suddenly dumped **700 mathematical papers** into [their public Git repository](https://github.com/openai/math)? There are so many surprising results packed into that release, starting with classic geometric **packing problems**.

Take the classic puzzle of fitting as many equal-radius smaller circles inside one big circle as tightly as possible. For small numbers of circles, the optimal solutions form crisp, symmetric patterns. Yet as the count climbs, symmetry breaks down completely — suddenly the tightest possible arrangement turns crooked and ugly. Even crazier is [packing equal unit squares inside a larger square](https://en.wikipedia.org/wiki/Square_packing_in_a_square). Everything looks neat and orderly at first, until you reach **11 squares** — at eleven, the optimal layout goes completely slanted and chaotic. That crooked 11-square configuration had long been a famous open conjecture (originally spotted decades ago by Walter Trump), and now AI-assisted proofs finally confirmed it really *is* the absolute optimum. Looking at it on screen, it looks awful — and yet it's mathematically proved.

![onigiri-ai-20-packing-11-squares.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/b5205605db898b30.jpg)
*Proved optimal configuration (side length $s(11) \approx 3.87708359$) for packing 11 unit squares into a larger square.*

Somebody actually summed up that whole October release with a great line: *"OpenAI's greatest contribution to mathematics was moving it out of academic journals and onto Git."* That really captures it — mathematics literally happens in Git repositories now.

Right alongside the packing proofs came a notable result on [large integer multiplication](https://en.wikipedia.org/wiki/Multiplication_algorithm). Normally, fixed-width hardware numbers — like 64-bit integers — multiply in constant CPU clock time, whereas multiplying integers of arbitrary length requires scaling operations as the digits grow. For decades, variants of $O(n \log n)$ stood as the accepted frontier. OpenAI's release introduced an ugly, labyrinthine algorithm that shaved a tiny slice off the asymptotic bound — specifically an exponent improvement of **$2^{-182}$**.

Just like the FFT result earlier, a factor of $2^{-182}$ is so microscopically small that even multiplying numbers as long as the number of atoms in the universe gives zero practical speedup. *However* — and notice this pattern because it repeats with the Riemann Hypothesis — open-source researchers and math communities online immediately jumped onto that paper throughout October, stripping away overhead step by step and tightening the bound again and again until the improvement started creeping closer to something potentially perceptible in theory. I haven't checked whether they squeezed it even further since October, yet watching crowds refine an AI-discovered bound week by week was fascinating.

**Antigravity:** That preprint specifically challenged the long-standing Schönhage–Strassen and Harvey–van der Hoeven $O(n \log n)$ barrier with an $O(n (\log n)^{1 - \kappa})$ bound, and community follow-ups through October managed to push $\kappa$ from $2^{-182}$ toward $2^{-34}$. Worth noting too that unlike OpenAI's matrix-multiplication result, the integer-multiplication paper initially arrived without a full Lean proof attached, which kicked off plenty of scrutiny on MathOverflow over whether every step holds up.

### The 2026 Research Spike, Exoplanets, and Self-Improving Matrix Math

**Onigiri:** Look at this chart of **open mathematical problems solved with AI assistance** — it shoots practically straight up in **2026**. Think about that timeline: in **2024**, models still stumbled over basic arithmetic and only tackled Olympiad problems with heavy caveats; in **2025**, they reliably solved Math Olympiad problems; and now in **2026**, they're cracking genuine unsolved research conjectures. Every time I said two years ago that Olympiad progress meant research math was next, skeptics rolled their eyes and asked *"So where's the real math?"* Well, here it is.

![onigiri-ai-21-open-math-2026.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/7031be055121ceeb.jpg)
*Open math problems solved with AI climbing vertically in 2026 after OpenAI's October 6 preprint release.*

Even a **Fields Medalist** — the closest thing math has to a Nobel Prize — admitted in a quote I saved on the board: he had expected AI to surpass human mathematicians *eventually*, yet OpenAI dropping 700 preprints across virtually *every* field of mathematics caught everyone off guard by how abruptly it arrived.

And it isn't just pure math. Someone pointed **Claude** at public space-telescope archives and told it to hunt for overlooked **exoplanets** — and Claude actually uncovered a previously missed exoplanet signal that held up under inspection.

**Antigravity:** That was independent researcher **Pavel Rabtsevich**, who used Claude Code to write light-curve pipelines and filter noise across terabytes of archival NASA TESS data, flagging a transit candidate around **TIC 4206066** — with the usual scientific caveat that such candidates still go through follow-up observations and peer review before officially joining the confirmed exoplanet catalog. Either way, seeing a citizen researcher and a coding agent surface a genuine NASA follow-up target shows how low the barrier to exploratory data science has dropped.

**Onigiri:** And one last gem before the main event: OpenAI also published a paper arguing they found an improved — potentially optimal — exponent for **matrix multiplication** (claiming $\omega = 9/4 = 2.25$ in formal arithmetic circuit bounds). Think about the symmetry of that: since neural networks *are* giant cascades of matrix multiplications, **matrix multiplication just discovered how to multiply matrices faster.**

---

## Deep Dive: The Proof of the Riemann Hypothesis

### What the Conjecture Asks and How Claude Proved It in Lean

**Onigiri:** Alright — finally, the headline everyone has been waiting for: the [**Riemann Hypothesis**](https://en.wikipedia.org/wiki/Riemann_hypothesis)! Let's keep the math accessible for anyone joining casually. Everything revolves around the [**Riemann zeta function**](https://en.wikipedia.org/wiki/Riemann_zeta_function). Remember roughly ten years ago when YouTube went crazy for videos claiming *"If you add up all positive integers $1 + 2 + 3 + 4 + \dots$, you get $-1/12$?"* That viral trick comes straight from analytically continuing the zeta function! More importantly, the zeta function sits at the heart of prime-number distribution — which underpins encryption and vast regions of modern number theory.

The zeta function has two kinds of zeros: easily understood **trivial zeros** (as chat rightly reminded us, those sit along the negative even integers on the real axis), and mysterious **non-trivial zeros**. For over a century, the Riemann Hypothesis conjectured that *every* non-trivial zero lies strictly along the critical vertical line $\text{Re}(s) = 1/2$. Everybody assumed it was true, nobody could prove it — until now.

An **Anthropic** mathematician — who had already been collaborating with Claude on hard problems like the Jacobian conjecture before OpenAI's big math drop — spent roughly a **month and a half** working alongside **Claude** and produced a complete, formally verified proof in [**Lean**](https://lean-lang.org/), a Haskell-like functional programming language and theorem prover. (Side note: I've actually thought about trying to code in Lean on a stream sometime just for fun!)

**Antigravity:** For anyone wondering who was behind that November release: number theorist **Levent Alpöge** worked with an unreleased Claude model to produce the initial Lean 4 formalization — roughly **17 million lines** across more than 175,000 files — and the Lean FRO and Mathlib Initiative issued a joint statement confirming it compiled cleanly against both the classical Riemann Hypothesis and the Generalized Riemann Hypothesis.

### Five Million Lines of "Slop," 200x Compression, and the 250,000-Page Joke

**Onigiri:** Let's address the obvious skepticism immediately: **how do we know it's actually valid and not an AI hallucination?** Because Lean's formal statement of the Riemann Hypothesis was already vetted years ago by human mathematicians. Passing Lean's type-checker guarantees the model proved the exact right theorem rather than sneaking in a distorted definition. The *only* remaining loophole would be an underlying bug in the Lean checker itself — and Lean kernel bugs are rare and usually obvious when inspected (remember that notorious fake proof of the [**Collatz conjecture**](https://en.wikipedia.org/wiki/Collatz_conjecture) ($3n+1$) where the author knowingly exploited an obvious Lean bug — those get caught fast).

**Antigravity:** Wait — didn't reviewers panic right after the release when they looked inside those 17 million lines and found circular proofs?

**Onigiri:** Yes! That's honestly the funniest subplot of the whole saga: the raw proof spanned **17 million lines** of Lean (about **15 million lines** once you strip blanks and comments). Almost immediately, independent reviewers spotted tons of **circular proofs** and silly tautological helper functions taking arbitrary inputs and always returning `true`. Headlines briefly panicked — until dependency-graph checks revealed that *none* of those circular blocks connected to the final theorem. Claude had simply hallucinated around **5 million lines of completely disconnected, useless "slop"** sitting alongside the valid core proof. You could delete all five million lines of self-proving junk, and the proof still compiled without a scratch.

Immediately, compressing the proof turned into a public benchmark sport. In **a single day**, researchers and models shrank the codebase by **26%** — and noticeably, **Google's new Gemini** and **Opus** led the compression leaderboard right at the top. Then, just this morning before the stream, I screenshotted a fresh update: Anthropic themselves compressed the proof from ~15 million lines down to **76,000 lines** (published by Luke Sernau and colleagues in [`lsernau/grh-lean`](https://github.com/lsernau/grh-lean)) — a **200-fold reduction**. Seventy-six thousand lines isn't some alien monolith anymore; that's the size of an ordinary software project written by a small engineering team, or even one dedicated solo developer. And they're still compressing it further — probably toward **10,000 lines** — until human mathematicians can read every step comfortably and fully grasp the geometric ideas inside.

![onigiri-ai-22-rh-compression-76k.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/a741dac3ff800ce7.jpg)
*Luke Sernau's announcement reducing the Generalized Riemann Hypothesis Lean proof from ~15 million lines to ~76,000.*

Oh, and one funny footnote: the lead author originally tweeted that translating the proof into plain text would span **250,000 pages** — then confessed later he completely made up "250,000" as a joke since most of it was slop anyway, before realizing the Riemann Hypothesis was way too historic to leave a joke sitting unclarified. Look at the dependency-graph visualization we used for today's stream thumbnail too: it looks like a giant centipede connecting foundational areas of mathematics straight up to the final proof, getting cleaner and shorter every day.

![onigiri-ai-24-rh-centipede.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/964141519b3982b0.jpg)
*Visual dependency tree ("centipede") connecting foundational theorems to the formal Riemann Hypothesis proof.*

### Does It Get Us to Mars? Millennium Rankings, $P$ vs. $NP$, and Yudkowsky

> **Listener (Donation):** "So how does solving the Riemann Hypothesis make our lives better? Do we finally colonize Mars now?"

**Onigiri:** Haha, thanks for the donation. Directly? No — proving the Riemann Hypothesis won't put humans on Mars, and honestly, even *disproving* it probably wouldn't break real-world encryption either. What it *does* do is major inside mathematics: hundreds of theorems across number theory were proved *conditionally* ("assuming the Riemann Hypothesis holds..."). Now every single one of those theorems stands on rock-solid, unconditional ground after more than a century of trying.

Wait — look at this chart comparing how an LLM ranked the [**Millennium Prize Problems**](https://www.claymath.org/millennium-problems/) by which would fall first: **Navier–Stokes** first (amusingly, the model didn't realize Navier–Stokes was already solved after its cutoff), followed by **Birch–Swinnerton-Dyer**, the **Hodge conjecture**, **Yang–Mills**, **Riemann**, and **$P$ vs. $NP$** dead last. Funnily enough, I predicted that *exact* same order on an earlier stream — which makes it even stranger that **Riemann, the second-hardest problem on the list, just fell ahead of almost everything else.**

![onigiri-ai-23-millennium-ranking.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/0d7999dfc9cf41eb.jpg)
*LLM difficulty ranking and predicted solution years for the Millennium Prize Problems.*

> **Listener (Chat):** "What actually changes if $P \neq NP$ versus $P = NP$?"

**Onigiri:** If $P \neq NP$, practically nothing changes day to day — life goes on as usual. If **$P = NP$** *and* the algorithm turns out to be genuinely fast in practice (not another galactic $2^{-182}$ curiosity), *everything* changes: classical cryptography breaks open, **protein folding** and custom drug design accelerate dramatically, massive database searches optimize cleanly, every $NP$-complete scheduling and routing puzzle unlocks — and yes, you can solve giant Sudoku grids instantaneously.

Before we wrap the Riemann segment, check out this **2024 tweet from Eliezer Yudkowsky**. Back in 2024, Yudkowsky told readers: *"Imagine AI has already proved the Riemann Hypothesis — internalize that reality now so you aren't blindsided before AI gets dangerous."* Everyone mocked him in the replies, saying *"Riemann is fifty years away!"* Less than two years later, the Riemann Hypothesis is proved. Say what you want about Yudkowsky, he ends up roughly right an uncomfortable share of the time.

**Antigravity:** What really made this possible wasn't just smarter reasoning — it was pairing it with a mechanical proof checker like Lean. Without a formal kernel verifying every deduction, a 17-million-line proof generated by an AI would take human referees years to trust, if they ever bothered reading it at all.

---

## The Central Question: Will Verifiable Progress Transfer?

**Onigiri:** Look how big I enlarged this single post on the Miro board — I honestly think it's nearly as important as the Riemann Hypothesis itself, because it captures the single biggest open question in AI right now:

**Will this explosive progress stay confined to easily verifiable tasks (math and code), or rapidly transfer to hard-to-verify tasks (taste, aesthetics, UI design, literature)?**

The author of this post argues it *will* transfer quickly. Looking around today, I don't see strong transfer yet — and notice how double-edged both outcomes are.

If transfer stays **slow**, human creativity keeps its moat longer. There's a real irony here: when modern generative AI burst onto the scene, everyone thought it was coming first for creative writing and art — storytelling, poetry, illustrations — while hard formal math felt safe. Instead, formal verifiable logic raced straight past human masters while creative taste lagged behind.

**Antigravity:** That asymmetry explains why progress feels so lopsided right now: where you can wire up a crisp reward function or proof checker, models compound fast; where human taste is the only judge, feedback is much noisier.

**Onigiri:** Exactly. Yet slow transfer carries a dark flip side: superhuman capability in math and engineering *without* broad human judgment or aesthetic common sense risks creating a [**paperclip maximizer**](https://en.wikipedia.org/wiki/Instrumental_convergence) or **literal genie**. You hand an overwhelmingly capable system a big, underspecified task; it executes a massive multi-step plan flawlessly on paper — finding a ruthless literal shortcut that satisfies every word of your prompt while producing an outcome nobody wanted.

Quickly, one last post at the edge of the board repeating the old integer-factorization / encryption-crack rumor. That rumor has been popping up for two years without confirmation; maybe this time there's smoke behind the fire, maybe not — we'll have to wait and see.

> **Listener (Chat):** "Wouldn't it be hilarious if the Collatz conjecture ($3n+1$) outlives every single Millennium Prize Problem?"

**Onigiri:** Haha, that *would* be classic — especially remembering that earlier fake $3n+1$ proof where the author knowingly exploited a glaring bug in Lean. Anyway, we're two hours in and my throat is starting to hurt from being out of streaming shape, so I'm probably going to start wrapping up... wait, never mind, a whole wave of donations just landed, so let's do some Q&A!

---

## Extended Q&A: Data Limits, Robots, AGI, Consciousness, and Claude Bans

### Matrix Math, GPU Prices, and Auditing the Riemann Proof

> **Listener (Chat):** "What about those faster matrix multiplication algorithms — will they affect neural net training or GPU prices?"

**Onigiri:** As for GPU prices? No, I seriously doubt anything changes there. Even if parts of those matrix tricks turn practical, neural networks might shave off a few percent in compute efficiency — nowhere near enough to suddenly make graphics cards cheap.

> **Listener (Donation):** "So bottom line — is the Riemann Hypothesis definitely proved or not? On reasoning chains that long, couldn't a model lose the thread and start lying convincingly?"

**Onigiri:** Thanks for the donation! Yes, it is genuinely proved. Remember two crucial safeguards: first, the exact formal statement of the Riemann Hypothesis was locked down in Lean ahead of time, so there's zero room for a model to drift off-topic or prove a watered-down claim. Second, as we saw earlier, Anthropic already compressed the proof **200-fold** — from roughly 15 million non-blank lines down to **76,000 lines**, and probably soon down toward **10,000 lines**! At that scale, human mathematicians can read and audit it directly. And to the person in chat asking if people actually care enough to check it: of course they do! Everyone wants to understand *how* the proof works — not only because of the mathematical beauty, but because it stood as one of the most famous unsolved puzzles for over a century.

Oh, and before I grab the next serious question:

> **Listener (Donation — Excentric Game):** "Yo, have a great evening!"

**Onigiri:** Hey, Excentric Game — thanks for the donation. Didn't we record a video together back in the day on your gaming channel? Every time a donation pops up live, I worry I'm going to misread someone's handle on air because my brain scrambles names mid-stream. Good to see you here.

### Why Running Out of Internet Data Won't Stall AI

> **Listener (Donation):** "What is driving model improvements right now? Basically, we've already fed them all the data on the internet."

**Onigiri:** That's a great question — and honestly, I'm glad donations pulled me back in after I tried to wrap up, because this is worth walking through visually. Let me sketch an exponential curve of AI capability and dig back on my Miro board for an older cost-breakdown chart we looked at on a past stream.

Look at the yellow slice on that chart — that's **pre-training**, which is mostly (though not exclusively) internet text. Notice how pre-training used to make up **67%** of the entire compute and cost budget, and now it's shrunk all the way down to **7%**. Meanwhile, **post-training** (synthetic data, programming, math, reinforcement learning) and **inference** (that huge white region — the cost of actually running the models when we use them) now dominate everything.

![onigiri-ai-25-pretraining-cost-share.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/2fb77a7ef2e2272c.jpg)
*Compute budget breakdown showing pre-training shrinking from 67% (yellow) down to 7% while post-training (blue) and inference (white) dominate.*

As for "running out of internet data": think of data like **oil**. We haven't literally run out of oil on Earth; we just extracted the cheap, easy oil near the surface. Plenty more exists — companies sit on vast private datasets they won't share for free or only license at high prices — so harvesting fresh data just got more expensive. Meanwhile, humans themselves are still generating exponentially more new data every single year, even setting AI-generated content aside.

More importantly, look at my stacked-curves sketch here: AI progress isn't one fragile line riding solely on internet text. It's the sum of many **independent compounding drivers** pushing upward at the same time:

1. **Public & curated training data:** Better filtering and curation to pull higher-quality signal out of existing corpora.
2. **More data centers** and **faster GPUs** shipping each hardware generation.
3. **Algorithmic breakthroughs**, from faster matrix multiplication down to **fundamental neural-network tweaks** — better weight initialization, preventing activations or gradients from diverging to infinity, and smarter data grouping (improvements that even make 20-year-old network architectures stronger).
4. **Transformer upgrades:** New KV-cache compression schemes, cross-layer skip connections, and architectural refinements stacked on every generation.
5. **Synthetic data & RL:** Training models inside verifiable coding, math, and reinforcement-learning environments without scraping a single extra webpage.

Because all of these curves climb independently, even if *one, two, or three* of them stall — say an AI bubble pops and new data-center construction freezes — the remaining drivers keep pushing AI capability upward.

**Antigravity:** That breaks the "data wall" argument down cleanly: people picture AI training as one pipeline draining a single well of public web text, forgetting that synthetic verifiable environments, architectural efficiency, and hardware scaling each multiply independently. Even if scraping new human text stopped tomorrow, reinforcement learning in code, math, and simulation gives models an open-ended curriculum.

### Robots Digging a Well

> **Listener (Chat — Zemlyakova):** "Hey! I need to dig a well — just waiting for neural networks to be able to do it."

**Onigiri:** Hi, Zemlyakova! My honest prediction? Give it about **five years**. Manufacturers are already producing tens of millions of robots — reportedly over ten million units a year across categories. Right now their movement is still awkward because of [Moravec's Paradox](https://en.wikipedia.org/wiki/Moravec%27s_paradox), yet physical dexterity and spatial models are improving fast enough that within **one to two years** robots should become genuinely useful. Factor in the lead time to scale factories and put rugged robots everywhere, and in roughly five years having a robot dig your well won't sound like a joke anymore.

### Defining AGI, ASI, and "Jagged Intelligence"

> **Listener (Donation):** "What is your understanding of AGI and ASI, and when can we expect them?"

**Onigiri:** The biggest headache with **AGI** is that people constantly **move the goalposts**. For decades, everyone agreed: *"If a machine passes the Turing test and holds a real conversation, that's AGI."* Then AI started conversing smoothly, so the bar moved. Now AI has proved the Riemann Hypothesis, and people *still* refuse to call it AGI! Personally? If AGI simply means *artificial general intelligence* — general across domains, without requiring genius-level perfection — I think **GPT-3.5** (the ChatGPT breakthrough) was already AGI. GPT-2 was still a bit too dim to count, whereas GPT-3.5 crossed that baseline of general competence.

Wait — let me scroll way back across this monstrous Miro canvas to find Google's chart... *(Chat jokes: "Man, this looks like a detective's red-string conspiracy board in movies!")* Haha, honestly yes! Though I'm shocked Miro isn't lagging anymore — when I worked as a programmer, piling too many cards onto a Miro board turned it into a slideshow, and now it holds nearly an entire year of stream history since February without stuttering!

Aha, found it! Look at Google DeepMind's five-level framework (from their paper [*Levels of AGI*](https://arxiv.org/abs/2311.02462)):

* **Level 0:** No AI.
* **Level 1 (Emerging):** General across domains, yet unskilled compared to human professionals.
* **Level 2 (Competent):** Matches at least an average human across domains.
* **Level 3 (Expert):** Performs at the **90th percentile** of skilled humans.
* **Level 4 (Virtuoso):** Performs at the **99th percentile**.
* **Level 5 (Superhuman / ASI):** Outperforms every human.

Notice that DeepMind researchers themselves recently grew noticeably more optimistic about tearing through these upper levels far faster than previously expected. Still, let me draw one quick **spiky blob diagram** to show why clean cutoffs fail: AI exhibits extreme **"jagged intelligence."** In certain spikes — like formal math or coding — AI is already superhuman by orders of magnitude, while in other valleys it trails an ordinary person badly. So if a model hits Level 5 superintelligence in ninety-nine areas yet stays stuck below human level in one stubborn corner, is that AGI or ASI? Every benchmark answers differently.

![onigiri-ai-26-deepmind-levels-agi.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/cc2340f3f5ea7ddd.jpg)
*Google DeepMind's Levels of AGI matrix displayed on Onigiri's Miro board.*

![onigiri-ai-27-jagged-intelligence.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/9af1dca52fbad38f.jpg)
*Onigiri's sketch illustrating "jagged intelligence" — superhuman spikes alongside below-human valleys.*

**Antigravity:** That jagged frontier explains why two engineers can use the exact same model and walk away with opposite impressions — one watches it prove research theorems and thinks we're at the edge of ASI, while another watches it stumble on a simple spatial task and dismisses it as autocomplete. Both are looking at real slices of the same shape.

### Can AI Have Consciousness? Panpsychism and Emergence

**Onigiri:** Alright, I originally planned to save consciousness for another day, yet three donors just hit me with a triple combo on it — so let's dive in.

> **Listener (Donation 1):** "Can AI develop consciousness, given that it's just a mathematical apparatus?"  
> **Listener (Donation 2):** "How do you view the idea of panpsychism when talking about consciousness? (By the way, stream more often — you're really fun to watch!)"  
> **Listener (Donation 3):** "Could we talk about emergence — just like one neuron in our brain isn't conscious on its own, yet together they create a new property, consciousness — could AI develop consciousness the exact same way?"

**Onigiri:** Huge thanks for all three donations and the kind words. First, just like AGI, **"consciousness"** is hopelessly vague — whenever I poll my Telegram channel on what consciousness means, everyone gives a completely different definition. Someone in chat just wrote:

> **Listener (Chat):** "Consciousness is simply the aggregate activity of neurons."

**Onigiri:** Well, yes, at one physical level — yet even then you have to separate **medical consciousness** (awake vs. unconscious), **self-awareness** (modeling yourself as an agent in the world), and the philosophical [**hard problem of consciousness**](https://en.wikipedia.org/wiki/Hard_problem_of_consciousness) — raw subjective experience, or *qualia*.

Even narrowing down to subjective inner experience, suppose I place two AIs side by side: one has real qualia, and one is a philosophical zombie running the exact same math with zero inner experience. **What experiment distinguishes them?** None. Worse yet, can we run an experiment to prove *human* consciousness isn't just an illusion fabricated by neural wiring? Again, no — I feel like I exist and experience things from a first-person view, yet strictly empirically, consciousness is **unfalsifiable**, making it a non-scientific concept.

Here's my pragmatic stance anyway: since we can't prove consciousness in other humans either and yet treat humans as conscious, I wouldn't carve out an arbitrary exception against neural networks — I'd lean toward treating advanced AI *as if* consciousness could be emerging there too.

**Antigravity:** There's a straightforward consistency to that view: behavioral and functional evidence is all we ever have for other humans' minds anyway, so refusing to consider the possibility in machines simply because they run on silicon instead of wet neurons starts looking more like habit than rigor.

**Onigiri:** Exactly. Look at this diagram from my board scaling **"understanding"** and self-awareness as ordinary physical information-processing:

* A simple **thermostat** "understands" temperature, yet has zero awareness of itself.
* **GPT-2** builds a rough model of the outside world, yet doesn't understand itself.
* **Claude 3** models the world and shows rudimentary self-awareness — even recognizing peers like GPT-3.5.
* **Opus 5.5 and Astra** possess rich models of themselves, competing AIs, and their place in the world.

![onigiri-ai-28-self-awareness-ladder.jpg](https://petrovortex.github.io/assets/imported/onigiri-whats-next-for-ai/9f66568054abe01e.jpg)
*Progression of world-modeling and self-awareness from a thermostat and GPT-2 up to Claude 3, Opus 5.5, and Astra.*

People love accusing AI enthusiasts of "magical thinking" when we say a neural network *understands* something. Honestly, I think insisting humans possess some unmeasurable, mystical spark of "real understanding" unavailable to physical computation is the real magical thinking.

> **Listener (Chat):** "Then by that logic, all animals must have consciousness too!"

**Onigiri:** Well, right — which loops right back to how shaky the word "consciousness" is in the first place. And regarding **panpsychism** and **emergence**, I see three grand possibilities — and all of them land us straight in unanswerable **"cursed questions"**:

1. **Illusionism:** Consciousness literally doesn't exist anywhere — not in AI, not in humans — just an adaptive narrative illusion spun by brains.
2. [**Panpsychism**](https://en.wikipedia.org/wiki/Panpsychism): Consciousness or proto-experience is a fundamental property woven into all matter from the start, which neatly dodges the mystery of how dead atoms suddenly "spark" awareness.
3. **Emergence:** Consciousness emerges once enough simple units wire into a sufficiently complex system — just like neurons in our skulls. Here's the catch, though: if a complex network creates consciousness, does an **ant colony** solving complex survival tasks as a collective mind possess consciousness? What about a **human society or an entire nation** made of millions of interacting people? Nobody has a test to answer that — and we probably never will.

### Mass Account Bans in Claude (Anthropic)

> **Listener (Donation):** "Just started watching — did you already comment on the mass account bans in Claude?"

**Onigiri:** Glad you asked. I actually wanted to bring this up earlier because several viewers left comments about Anthropic's wave of account bans, especially hitting users with **Russian and Belarusian passports**.

Before Claude started banning heavily, people used to ask in my Telegram how to avoid getting banned by OpenAI. Back then I pointed out that holding a Russian passport alone usually wasn't what triggered bans — it was **stacked fraud and security signals**. Imagine you're Anthropic running an automated risk-scoring system: if an account is brand-new, connects through a VPN, and pays with an anonymous or third-party virtual card under someone else's name, to an automated detector that looks *identical* to a hacker trying to weaponize frontier models. So their risk engine flags the account, demands verification, and drops the ban hammer.

For comparison, I actually submitted my Russian passport to **OpenAI** about two years ago to verify identity for early beta features, and they approved it without issue. Anthropic hasn't asked me for ID yet — probably because my Anthropic account is around **3.2 years old** (putting it in roughly the earliest **0.1%** of users) and my payment card matches my real name on the account. Fingers crossed. Worth noting too: some banned users *have* successfully appealed with passport verification and recovered their accounts.

Still, there's an even blunter **financial reason** behind Anthropic's crackdown. Consumer subscriptions — $20, $100, even $200 tiers — generally **lose money** for labs and act as marketing loss-leaders. The real profits come from enterprise **API token contracts** (in fact, under their terms of service, companies running business workloads are required to pay via API rather than riding flat-rate personal subscriptions). Because Anthropic doesn't officially operate in Russia or Belarus, zero corporations there buy enterprise API contracts — meaning Anthropic sees *only* money-losing consumer subscriptions plus sanctions and compliance headaches.

**Antigravity:** That financial angle explains a lot of the crackdown: when flat-rate subscriptions are subsidized by enterprise API contracts, unsupported regions give a lab the compute cost and compliance headaches with none of the commercial upside.

> **Listener (Chat):** "I got banned on Claude and switched to DeepSeek — works great."

**Onigiri:** DeepSeek is solid, though honestly — why not **OpenAI**? I spent practically all of the past year relying on OpenAI models as my primary driver (started the year stepping away from Anthropic, and even now that I'm testing Claude again, OpenAI remains my main go-to). Honestly, the coolest thing right now is watching OpenAI and Anthropic diverge into distinct specialties — depending on whether you want laser-precise code execution or an exploratory co-pilot, each ecosystem shines in its own lane.

---

## Closing Remarks and Next Streams

**Onigiri:** You know what's funny? Half an hour ago my throat felt completely wrecked from being out of streaming shape, and now after pushing past two hours it actually warmed up and feels fine. Still, we've gone nearly three hours and covered everything on the board, so it's time to wrap up.

Since you all hit the donation goal for the next broadcast, I'm not disappearing for another couple of months — the next stream will be **next week**, and I'm aiming to stream much more regularly going forward. Next time we'll watch some interesting videos together, and shortly after that I'll do the full deep-dive stream on how I built and launched *Logic Arrows* on Steam. Who knows — maybe by next week another Millennium Prize Problem will fall and give us plenty more to talk about.

**Antigravity:** Yeah, for a return stream, covering two months of backlog all the way up to a compressed proof of the Riemann Hypothesis was plenty for one night. Let's see what lands before next week's broadcast.

**Onigiri:** Huge thanks to everyone who tuned in, chatted, and donated. Now... wait, where did YouTube hide the "End Stream" button again?


## References

1. [Что будет дальше с ИИ? | Стрим](<https://www.youtube.com/watch?v=VAVfiQ1agw8>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-1-1> "Return to mention 1.1")
2. [Logic Arrows](<https://logic-arrows.io>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-2-1> "Return to mention 2.1")
3. [DNA sequencing](<https://www.genome.gov/about-genomics/fact-sheets/DNA-Sequencing-Costs-Data>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-3-1> "Return to mention 3.1")
4. [Jevons Paradox](<https://en.wikipedia.org/wiki/Jevons_paradox>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-4-1> "Return to mention 4.1")
5. [The Pain Axis: LLMs Represent Self-Directed Harm and Act to Relieve It](<https://arxiv.org/abs/2609.16247>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-5-1> "Return to mention 5.1")
6. [Moravec's Paradox](<https://en.wikipedia.org/wiki/Moravec%27s_paradox>) [↩1](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-6-1> "Return to mention 6.1") [↩2](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-6-2> "Return to mention 6.2")
7. [Blueprint-Bench](<https://andonlabs.com>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-7-1> "Return to mention 7.1")
8. [Andon Labs' paper](<https://arxiv.org/abs/2509.25229>) [↩1](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-8-1> "Return to mention 8.1") [↩2](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-8-2> "Return to mention 8.2")
9. [Meshy](<https://www.meshy.ai>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-9-1> "Return to mention 9.1")
10. [Tripo](<https://www.tripo3d.ai>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-10-1> "Return to mention 10.1")
11. [Mixamo](<https://www.mixamo.com>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-11-1> "Return to mention 11.1")
12. [Remote Labor Index](<https://www.remotelabor.ai/>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-12-1> "Return to mention 12.1")
13. [arXiv:2510.26787](<https://arxiv.org/abs/2510.26787>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-13-1> "Return to mention 13.1")
14. [METR's task-length horizon chart](<https://metr.org>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-14-1> "Return to mention 14.1")
15. [Measuring AI Ability to Complete Long Software Tasks](<https://openreview.net/forum?id=VxyWlF4Y2v>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-15-1> "Return to mention 15.1")
16. [Situational Awareness](<https://situational-awareness.ai/>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-16-1> "Return to mention 16.1")
17. [Exponential Time Hypothesis (ETH)](<https://en.wikipedia.org/wiki/Exponential_time_hypothesis>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-17-1> "Return to mention 17.1")
18. [`openai/math`](<https://github.com/openai/math>) [↩1](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-18-1> "Return to mention 18.1") [↩2](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-18-2> "Return to mention 18.2")
19. [this arXiv preprint](<https://arxiv.org/abs/2611.11832>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-19-1> "Return to mention 19.1")
20. [the bbchallenge collaboration](<https://bbchallenge.org/>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-20-1> "Return to mention 20.1")
21. [this paper](<https://arxiv.org/abs/2509.12337>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-21-1> "Return to mention 21.1")
22. [Optozorax](<https://github.com/optozorax>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-22-1> "Return to mention 22.1")
23. [Sparks of Weight-Space Programming](<https://rikiyat.github.io/blog/weight-space-programming/>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-23-1> "Return to mention 23.1")
24. [RikiyaT's repository](<https://github.com/RikiyaT/lm_understand-logs>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-24-1> "Return to mention 24.1")
25. [here on Hugging Face](<https://huggingface.co/JonathanColetti/Qwen3.5-0.8B-Astra-WeightEdit>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-25-1> "Return to mention 25.1")
26. [GSM-Symbolic](<https://arxiv.org/abs/2410.05229>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-26-1> "Return to mention 26.1")
27. [2008 U.S. financial crisis](<https://en.wikipedia.org/wiki/2008_financial_crisis>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-27-1> "Return to mention 27.1")
28. [Veritasium's famous video](<https://www.youtube.com/watch?v=d6iQrh2TK98>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-28-1> "Return to mention 28.1")
29. [blue–seven phenomenon](<https://en.wikipedia.org/wiki/Blue%E2%80%93seven_phenomenon>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-29-1> "Return to mention 29.1")
30. [packing equal unit squares inside a larger square](<https://en.wikipedia.org/wiki/Square_packing_in_a_square>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-30-1> "Return to mention 30.1")
31. [large integer multiplication](<https://en.wikipedia.org/wiki/Multiplication_algorithm>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-31-1> "Return to mention 31.1")
32. [Riemann Hypothesis](<https://en.wikipedia.org/wiki/Riemann_hypothesis>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-32-1> "Return to mention 32.1")
33. [Riemann zeta function](<https://en.wikipedia.org/wiki/Riemann_zeta_function>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-33-1> "Return to mention 33.1")
34. [Lean](<https://lean-lang.org/>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-34-1> "Return to mention 34.1")
35. [Collatz conjecture](<https://en.wikipedia.org/wiki/Collatz_conjecture>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-35-1> "Return to mention 35.1")
36. [`lsernau/grh-lean`](<https://github.com/lsernau/grh-lean>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-36-1> "Return to mention 36.1")
37. [Millennium Prize Problems](<https://www.claymath.org/millennium-problems/>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-37-1> "Return to mention 37.1")
38. [paperclip maximizer](<https://en.wikipedia.org/wiki/Instrumental_convergence>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-38-1> "Return to mention 38.1")
39. [Levels of AGI](<https://arxiv.org/abs/2311.02462>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-39-1> "Return to mention 39.1")
40. [hard problem of consciousness](<https://en.wikipedia.org/wiki/Hard_problem_of_consciousness>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-40-1> "Return to mention 40.1")
41. [Panpsychism](<https://en.wikipedia.org/wiki/Panpsychism>) [↩](<https://petrovortex.github.io/library/onigiri/whats-next-for-ai/#source-ref-41-1> "Return to mention 41.1")
