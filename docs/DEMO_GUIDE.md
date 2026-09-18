# HACKATHON 3-MINUTE PITCH SEQUENCE

## PREPARATION (Before presenting)
1. Ensure XAMPP (Apache & MySQL) is running.
2. Run `.\scripts\start_all.ps1`.
3. Open `http://localhost:5173`.
4. Ensure the system is in **Scenario A: Normal**. The pipes should be Aqua, the active incident panel should say `NO ACTION REQUIRED`, and total loss should be `0.00`.

---

## 00:00 - 00:20 | Introduction & The Baseline
**Action**: Point to the KPI row and the Digital Twin.
**Script**: *"This is AquaRisk AI. Traditional leak detection uses static thresholds. AquaRisk doesn't. We built a Production-Aware AI that learns the exact baseline of the plant network in real-time, matching water consumption against active machine production states."*

## 00:20 - 00:40 | Scenario 2: Production Surge vs Leak
**Action**: Explain how the AI prevents false alarms.
**Script**: *"If a machine ramps up production, water use spikes. Old systems trigger false alarms. AquaRisk classifies this as a `NORMAL_PRODUCTION_VARIATION`. But what happens when a real leak occurs?"*

## 00:40 - 01:10 | Scenario 4: The Major Leak
**Action**: Use the Demo Control API or script to trigger the Major Leak on `P-104`.
**Script**: *"A pipe bursts. Instantly, our ML pipeline detects the flow deviation against the baseline. Our Intelligence engine classifies it as a Major Leak, and the Network Localization engine isolates the probability specifically to Segment P-104."*
*(Point to the Digital Twin where P-104 is now pulsing Red).*

## 01:10 - 01:50 | Quantification & Risk
**Action**: Point to the newly appeared Active Incident Card on the right.
**Script**: *"AquaRisk doesn't just find the leak, it quantifies the impact. We calculate the exact volumetric loss and the financial exposure. But more importantly, we project the future."*
*(Point to the Cost of Waiting box)*. *"The AI tells the operator that waiting just one hour will cost the plant an additional ₹1,500."*

## 01:50 - 02:40 | Explainable Action & Copilot
**Action**: Open the Copilot Drawer and click *"Why do you think it's a leak?"*
**Script**: *"Operators won't trust a black box. Our Decision Engine recommends isolating the pipe, and our RAG Copilot provides the exact evidence. The AI explicitly lists the flow deviation and pressure drops it used to reach this conclusion, guaranteeing zero hallucinations."*

## 02:40 - 03:00 | Resolution
**Action**: Click the `SIMULATE INTERVENTION` button on the Incident card.
**Script**: *"The operator acknowledges the AI's recommendation and isolates the valve. Flow returns to baseline, the Digital Twin recovers to green, and the system permanently logs exactly how much money and water was saved. This is the future of industrial water intelligence."*
