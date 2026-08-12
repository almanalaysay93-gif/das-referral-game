/**
 * EMR-DAS Referral Game — Patient Scenario Data
 * Style: Mission Control (clinical telemetry console)
 *
 * Each patient scenario is built on the EMR-DAS Alert Logic v1.0 from the
 * SPMC technical packet:
 *
 *   ALERT TRIGGER (refer to SHARE / Donor Coordinator):
 *     Severe acute neurologic injury diagnosis (stroke/hemorrhage, massive TBI,
 *     brainstem injury, hypoxic-ischemic injury, etc.)
 *     PLUS
 *       GCS ≤ 7 documented within the past 6 hours
 *       OR invasive mechanical ventilation with GCS ≤ 7 within the past 24 hours
 *
 *   HIGH-PRIORITY FLAG:
 *     Documented brain-death evaluation/declaration → urgent referral review
 *
 *   NO ALERT:
 *     Neurologic diagnosis but GCS > 7 and not ventilated
 *     GCS 8–12 without qualifying neurologic source term (surveillance only)
 *     Ventilated but GCS > 7 within 24 h (ventilation alone does not qualify)
 *     Stale/improved readings (old GCS ≤ 7, now recovered above 7)
 *     No neurologic injury at all
 *
 * Action choices:
 *   "share"   → REFER TO SHARE TEAM (Donor Coordinator)  = alert-trigger positive
 *   "surv"    → CONTINUE SURVEILLANCE (GCS 8–12 cohort, monitor)
 *   "none"    → NO ALERT NEEDED (continue routine specialty care)
 */

export type Action = "share" | "surv" | "none";

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F";
  unit: string;
  hour: string; // when the latest data was charted
  diagnosis: string;
  gcs: {
    score: number;
    note: string;
  };
  ventilated: {
    onVent: boolean;
    note: string;
  };
  brainDeathEval: boolean;
  extra?: string;
  action: Action;
  explanation: string;
  ruleCited: string;
}

export interface Level {
  id: number;
  name: string;
  tagline: string;
  focus: string;
  patients: Patient[];
}

export const levels: Level[] = [
  /* ============ LEVEL 1: Clear signals — learn the basic trigger ============ */
  {
    id: 1,
    name: "Signal Training",
    tagline: "Learn the golden rule: neurologic injury + GCS ≤ 7",
    focus: "Every referral case is obvious. Neurologic injury with a documented GCS of 7 or below within 6 hours, or obvious no-alert cases.",
    patients: [
      {
        id: "1-1",
        name: "Patient R.M.",
        age: 58,
        sex: "M",
        unit: "ER → ICU",
        hour: "08:14",
        diagnosis: "Massive spontaneous intracerebral hemorrhage",
        gcs: { score: 5, note: "E1 V2 M2 — documented 4 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Classic EMR-DAS Alert Logic v1.0 trigger: a severe acute neurologic injury (intracerebral hemorrhage) plus a documented GCS of 5 (≤ 7) within the past 6 hours. This encounter is referral-alert positive — notify the SHARE Donor Coordinator for validation.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 within 6 h",
      },
      {
        id: "1-2",
        name: "Patient L.C.",
        age: 34,
        sex: "F",
        unit: "Surgery Ward",
        hour: "09:02",
        diagnosis: "Mild concussion, no intracranial injury on CT",
        gcs: { score: 15, note: "Fully awake and oriented" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. The patient has a mild head injury with a GCS of 15 — far above the ≤ 7 threshold and no severe acute neurologic source term. Continue routine care.",
        ruleCited: "No qualifying diagnosis; GCS > 7",
      },
      {
        id: "1-3",
        name: "Patient A.T.",
        age: 67,
        sex: "M",
        unit: "Stroke Unit",
        hour: "10:47",
        diagnosis: "Massive middle cerebral artery infarct with malignant edema",
        gcs: { score: 6, note: "E1 V1t M4 — documented 2 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: severe neurologic injury (massive hemispheric infarct) plus GCS 6 (≤ 7) documented within the past 6 hours. Alert the SHARE coordinator.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 within 6 h",
      },
      {
        id: "1-4",
        name: "Patient M.S.",
        age: 45,
        sex: "F",
        unit: "Medical Ward",
        hour: "11:20",
        diagnosis: "Uncontrolled type 2 diabetes, diabetic ketoacidosis",
        gcs: { score: 14, note: "Alert, mildly confused" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. This is a purely metabolic emergency with no acute neurologic injury source term, and GCS is 14. EMR-DAS alerts require a neurologic source term.",
        ruleCited: "No neurologic source term",
      },
      {
        id: "1-5",
        name: "Patient J.P.",
        age: 29,
        sex: "M",
        unit: "ER → ICU",
        hour: "12:05",
        diagnosis: "Severe traumatic brain injury with diffuse cerebral edema",
        gcs: { score: 4, note: "E1 V1t M3 — documented 1 hour ago" },
        ventilated: { onVent: true, note: "Intubated in ER" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: severe TBI (a qualifying neurologic source term) with GCS 4 (≤ 7) within 6 hours. Refer to the SHARE team for coordinator validation.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 within 6 h",
      },
      {
        id: "1-6",
        name: "Patient B.A.",
        age: 72,
        sex: "F",
        unit: "Medical Ward",
        hour: "13:30",
        diagnosis: "Community-acquired pneumonia, recovering well",
        gcs: { score: 15, note: "Fully oriented" },
        ventilated: { onVent: false, note: "On nasal cannula only" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. Stable respiratory infection, no neurologic injury, GCS 15. Continue specialty care.",
        ruleCited: "No neurologic source term; GCS 15",
      },
      {
        id: "1-7",
        name: "Patient K.R.",
        age: 52,
        sex: "M",
        unit: "Neurosurgery ICU",
        hour: "14:12",
        diagnosis: "Large subarachnoid hemorrhage, Hunt & Hess grade V",
        gcs: { score: 3, note: "E1 V1t M1 — documented 5 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: ruptured SAH is a severe neurologic source term, and GCS 3 (≤ 7) was documented 5 hours ago, within the 6-hour window. Refer to SHARE immediately.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 within 6 h",
      },
      {
        id: "1-8",
        name: "Patient D.G.",
        age: 40,
        sex: "F",
        unit: "Surgery Ward",
        hour: "15:00",
        diagnosis: "Post-cholecystectomy, uncomplicated recovery",
        gcs: { score: 15, note: "Ambulating, tolerating diet" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. Routine postoperative patient with no neurologic injury and normal GCS.",
        ruleCited: "No neurologic source term; GCS 15",
      },
      {
        id: "1-9",
        name: "Patient S.L.",
        age: 61,
        sex: "M",
        unit: "Stroke Unit → ICU",
        hour: "15:48",
        diagnosis: "Cerebellar hemorrhage with hydrocephalus",
        gcs: { score: 7, note: "E2 V1t M4 — documented 3 hours ago" },
        ventilated: { onVent: true, note: "Airway protected, ventilated" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: GCS of exactly 7 (≤ 7) with a qualifying cerebellar hemorrhage, documented 3 hours ago. Note: GCS ≤ 7, not GCS < 7 — 7 qualifies. Alert SHARE.",
        ruleCited: "Alert Logic v1.0: GCS ≤ 7 (7 counts!) within 6 h",
      },
      {
        id: "1-10",
        name: "Patient F.N.",
        age: 23,
        sex: "F",
        unit: "ER",
        hour: "16:25",
        diagnosis: "Ankle fracture, planned for OR tomorrow",
        gcs: { score: 15, note: "Fully conscious, pain-limited movement" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. Orthopedic case, no neurologic injury, GCS 15. Continue routine orthopedic care.",
        ruleCited: "No neurologic source term; GCS 15",
      },
    ],
  },

  /* ============ LEVEL 2: GCS boundary cases & surveillance zone ============ */
  {
    id: 2,
    name: "GCS Boundary Drill",
    tagline: "Where does 7 end and 8 begin? Learn the surveillance zone.",
    focus: "GCS 8–12 patients enter the surveillance cohort (GCS ≤ 12) but do not trigger an alert on their own. Watch the exact threshold.",
    patients: [
      {
        id: "2-1",
        name: "Patient C.O.",
        age: 48,
        sex: "M",
        unit: "ER → Stroke Unit",
        hour: "07:30",
        diagnosis: "Acute ischemic stroke (left MCA territory)",
        gcs: { score: 9, note: "E3 V4 M2 — documented 2 hours ago" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "surv",
        explanation:
          "No alert yet, but the patient is in the surveillance cohort: acute neurologic injury with GCS 9 (≤ 12). Monitor closely — if GCS falls to 7 or below within 6 hours, trigger the SHARE referral.",
        ruleCited: "Surveillance cohort: GCS ≤ 12 — monitor for deterioration",
      },
      {
        id: "2-2",
        name: "Patient H.V.",
        age: 55,
        sex: "F",
        unit: "ICU",
        hour: "08:45",
        diagnosis: "Large basal ganglia hemorrhage with intraventricular extension",
        gcs: { score: 7, note: "E2 V1t M4 — documented 5 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: qualifying hemorrhage plus GCS 7 (≤ 7) within the 6-hour window, whether or not ventilated. Refer to SHARE.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 within 6 h",
      },
      {
        id: "2-3",
        name: "Patient W.E.",
        age: 38,
        sex: "M",
        unit: "Medical Ward",
        hour: "09:15",
        diagnosis: "Viral upper respiratory infection",
        gcs: { score: 12, note: "Groggy from antihistamines, no focal deficit" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. Although GCS is 12, there is no acute neurologic injury source term — the drowsiness is medication-related. No EMR-DAS trigger applies.",
        ruleCited: "No qualifying neurologic source term",
      },
      {
        id: "2-4",
        name: "Patient Y.U.",
        age: 66,
        sex: "F",
        unit: "Neurosurgery ICU",
        hour: "10:02",
        diagnosis: "Bilateral subdural hematomas post-fall, midline shift",
        gcs: { score: 8, note: "E2 V1t M5 — documented 4 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "surv",
        explanation:
          "Surveillance, no alert yet: GCS 8 is above the ≤ 7 threshold. The patient is in the GCS ≤ 12 surveillance cohort with a serious neurologic injury — deterioration to GCS 7 would trigger an immediate referral.",
        ruleCited: "GCS 8–12 + neurologic injury = surveillance, watch for GCS ≤ 7",
      },
      {
        id: "2-5",
        name: "Patient I.O.",
        age: 43,
        sex: "M",
        unit: "ICU",
        hour: "11:30",
        diagnosis: "Hypoxic-ischemic brain injury after out-of-hospital cardiac arrest",
        gcs: { score: 6, note: "E1 V1t M5 — documented 3 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: anoxic (hypoxic-ischemic) brain injury is a qualifying severe neurologic source term, and GCS 6 (≤ 7) is documented within 6 hours. Alert SHARE.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 within 6 h",
      },
      {
        id: "2-6",
        name: "Patient Q.A.",
        age: 51,
        sex: "F",
        unit: "Medical Ward",
        hour: "12:10",
        diagnosis: "Exacerbation of COPD, responding to treatment",
        gcs: { score: 13, note: "Mild sedation effect, improving" },
        ventilated: { onVent: false, note: "BiPAP only, non-invasive" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. GCS 13 is above the surveillance threshold, non-invasive ventilation does not count as invasive mechanical ventilation, and there is no neurologic injury.",
        ruleCited: "GCS > 12, no qualifying criteria",
      },
      {
        id: "2-7",
        name: "Patient Z.X.",
        age: 30,
        sex: "M",
        unit: "ER → Neuro ICU",
        hour: "13:05",
        diagnosis: "Gunshot wound to the cranium, bilateral hemispheric injury",
        gcs: { score: 3, note: "E1 V1t M1 — documented 30 minutes ago" },
        ventilated: { onVent: true, note: "Intubated on arrival" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: devastating neurologic trauma with GCS 3 within 6 hours. This is one of the highest-urgency referral cases. Alert SHARE now.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 within 6 h",
      },
      {
        id: "2-8",
        name: "Patient P.I.",
        age: 70,
        sex: "F",
        unit: "Medical Ward",
        hour: "14:40",
        diagnosis: "Congestive heart failure, diuresing well",
        gcs: { score: 14, note: "Fatigued but oriented" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. Cardiac patient with no neurologic injury and GCS 14. No trigger criteria met.",
        ruleCited: "No neurologic source term; GCS > 12",
      },
      {
        id: "2-9",
        name: "Patient O.K.",
        age: 46,
        sex: "M",
        unit: "Stroke Unit",
        hour: "15:22",
        diagnosis: "Large right hemispheric infarct with hemorrhagic conversion",
        gcs: { score: 7, note: "E1 V2 M4 — documented 1 hour ago" },
        ventilated: { onVent: false, note: "Not yet ventilated" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: the 6-hour GCS rule applies regardless of ventilation. GCS 7 (≤ 7) documented 1 hour ago with a qualifying infarct — refer to SHARE.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 within 6 h (ventilation not required)",
      },
      {
        id: "2-10",
        name: "Patient L.W.",
        age: 35,
        sex: "F",
        unit: "ER",
        hour: "16:50",
        diagnosis: "Generalized tonic-clonic seizure, now post-ictal",
        gcs: { score: 10, note: "Drowsy post-ictal state, no structural lesion on CT" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. A post-ictal seizure without a structural lesion does not match Alert Logic v1.0's curated neurologic-injury source terms. Drowsiness is medication/seizure-related and expected to clear — document and reassess, but no EMR-DAS trigger applies.",
        ruleCited: "No qualifying source term in Alert Logic v1.0 list",
      },
    ],
  },

  /* ============ LEVEL 3: The 24-hour ventilation pathway ============ */
  {
    id: 3,
    name: "Ventilator Watch",
    tagline: "Ventilated patients get a longer window — 24 hours.",
    focus: "Invasive mechanical ventilation with GCS ≤ 7 within 24 hours qualifies. Watch for traps: ventilation alone, or GCS > 7 in the last 24 h.",
    patients: [
      {
        id: "3-1",
        name: "Patient E.R.",
        age: 54,
        sex: "M",
        unit: "ICU",
        hour: "07:00",
        diagnosis: "Massive pontine hemorrhage",
        gcs: { score: 6, note: "E1 V1t M5 — documented 18 hours ago (still current)" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: brainstem (pontine) hemorrhage plus GCS 6 within 24 hours in an invasively ventilated patient — the 24-hour rule applies. Refer to SHARE.",
        ruleCited: "Alert Logic v1.0: Ventilated + GCS ≤ 7 within 24 h",
      },
      {
        id: "3-2",
        name: "Patient T.Y.",
        age: 28,
        sex: "F",
        unit: "ICU",
        hour: "08:30",
        diagnosis: "Bilateral pneumonia with ARDS — no brain injury",
        gcs: { score: 6, note: "Deep sedation for ARDS protocol" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. Although GCS is 6 on the vent, the coma is iatrogenic (deep sedation) and there is NO severe acute neurologic injury source term. Alert Logic v1.0 requires both components.",
        ruleCited: "No neurologic source term — sedation alone doesn't qualify",
      },
      {
        id: "3-3",
        name: "Patient U.I.",
        age: 60,
        sex: "M",
        unit: "Neurosurgery ICU",
        hour: "09:10",
        diagnosis: "Ruptured basilar artery aneurysm, post-coiling",
        gcs: { score: 8, note: "E2 V1t M5 — documented 20 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "surv",
        explanation:
          "Surveillance: ventilated patient, but the documented GCS is 8 (> 7) within the 24-hour window. Mechanical ventilation alone does not trigger an alert. Continue close monitoring.",
        ruleCited: "Ventilated + GCS > 7 within 24 h = no alert; surveillance",
      },
      {
        id: "3-4",
        name: "Patient A.S.",
        age: 41,
        sex: "F",
        unit: "ICU",
        hour: "10:20",
        diagnosis: "Severe TBI with brainstem contusion, day 2 of ventilation",
        gcs: { score: 5, note: "E1 V1t M4 — documented 22 hours ago (latest documented score)" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation, day 2" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: severe neurologic injury plus GCS 5 documented within the 24-hour window for a ventilated patient. Refer to SHARE.",
          ruleCited: "Alert Logic v1.0: Ventilated + GCS ≤ 7 within 24 h",
      },
      {
        id: "3-5",
        name: "Patient D.F.",
        age: 74,
        sex: "M",
        unit: "Medical ICU",
        hour: "11:45",
        diagnosis: "Guillain-Barré syndrome with respiratory failure",
        gcs: { score: 15, note: "Fully awake — paralysis is peripheral, not cerebral" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. The patient is ventilated but has normal GCS (15) and no central neurologic injury — GBS is a peripheral nerve disease. Ventilation alone never triggers the alert.",
        ruleCited: "Ventilation alone ≠ alert; GCS 15, no central injury",
      },
      {
        id: "3-6",
        name: "Patient G.H.",
        age: 50,
        sex: "F",
        unit: "Neuro ICU",
        hour: "13:00",
        diagnosis: "Meningoencephalitis with cerebral edema and seizures",
        gcs: { score: 6, note: "E1 V1t M5 — documented 12 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: meningoencephalitis with cerebral edema is a qualifying acute neurologic injury, and GCS 6 was documented 12 hours ago — within the 24-hour ventilated window (and also within 6 hours). Alert SHARE.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 within 24 h (ventilated)",
      },
      {
        id: "3-7",
        name: "Patient J.K.",
        age: 33,
        sex: "M",
        unit: "Surgery ICU",
        hour: "14:15",
        diagnosis: "Post-cardiac surgery, expected to extubate today",
        gcs: { score: 14, note: "Waking up, follows commands" },
        ventilated: { onVent: true, note: "Ventilated, expected extubation" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. Postoperative cardiac patient on a ventilator with GCS 14 and no neurologic injury. Continue routine care.",
        ruleCited: "No neurologic source term; GCS > 7",
      },
      {
        id: "3-8",
        name: "Patient N.B.",
        age: 57,
        sex: "F",
        unit: "Stroke Unit → ICU",
        hour: "15:40",
        diagnosis: "Malignant MCA syndrome with herniation, post-decompressive craniectomy",
        gcs: { score: 4, note: "E1 V1t M3 — documented 2 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: devastating cerebral injury with GCS 4 within both the 6-hour and 24-hour windows. This is a top-priority referral. Alert SHARE immediately.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 within 6 h",
      },
      {
        id: "3-9",
        name: "Patient V.C.",
        age: 44,
        sex: "M",
        unit: "ICU",
        hour: "16:20",
        diagnosis: "Status epilepticus, refractory, cerebral edema developing",
        gcs: { score: 7, note: "E1 V1t M5 — documented 16 hours ago (ongoing coma)" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation, propofol infusion" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: refractory status epilepticus with cerebral edema is a qualifying neurologic injury, and GCS 7 was documented 16 hours ago — within the 24-hour ventilated window. The coma must be reassessed carefully, but the alert stands for coordinator review. Refer to SHARE.",
        ruleCited: "Alert Logic v1.0: Ventilated + GCS ≤ 7 within 24 h",
      },
      {
        id: "3-10",
        name: "Patient X.Z.",
        age: 65,
        sex: "F",
        unit: "Medical Ward",
        hour: "17:05",
        diagnosis: "Hypoglycemic coma — resolved after IV dextrose",
        gcs: { score: 5, note: "Was 5 three hours ago; now 13 after treatment" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. The low GCS was transient and metabolic (hypoglycemia), now corrected to 13, with no structural neurologic injury. A recovered, non-neurologic coma does not qualify. Document and continue care.",
        ruleCited: "Transient metabolic coma, corrected; no neurologic source term",
      },
    ],
  },

  /* ============ LEVEL 4: Stale data, duplicates & priority flags ============ */
  {
    id: 4,
    name: "Coordinator Verification",
    tagline: "Data changes. Old alerts expire. Brain death flags escalate.",
    focus: "Real EMR data is messy: improved GCS values, duplicate alerts with recent coordinator disposition, and brain-death evaluation flags that escalate priority.",
    patients: [
      {
        id: "4-1",
        name: "Patient B.Q.",
        age: 49,
        sex: "M",
        unit: "Neuro ICU",
        hour: "08:00",
        diagnosis: "Brain death evaluation formally documented by two physicians",
        gcs: { score: 3, note: "E1 V1t M1 — brain-death evaluation in progress" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: true,
        action: "share",
        explanation:
          "HIGH-PRIORITY referral: a documented brain-death evaluation creates an urgent referral-review flag subject to coordinator confirmation. Refer to SHARE immediately — the team must initiate brain-death declaration protocols, database update, and family approach.",
        ruleCited: "Brain-death evaluation = high-priority referral flag",
      },
      {
        id: "4-2",
        name: "Patient C.D.",
        age: 56,
        sex: "F",
        unit: "ICU",
        hour: "09:30",
        diagnosis: "System alert: 'GCS 5 within 24 h — vented patient' (chart from yesterday)",
        gcs: { score: 10, note: "Yesterday 19:00 GCS was 5; today re-assessed at GCS 10, improving" },
        ventilated: { onVent: true, note: "Still ventilated, neurological recovery" },
        brainDeathEval: false,
        action: "surv",
        explanation:
          "No new alert. The GCS 5 was documented more than 24 hours ago and the patient has since improved to GCS 10. Alerts are based on the latest documented scores — stale data that has improved should not fire. Continue surveillance while ventilated.",
        ruleCited: "Stale/improved data — latest GCS 10 > 7, no alert",
      },
      {
        id: "4-3",
        name: "Patient E.F.",
        age: 37,
        sex: "M",
        unit: "Neuro ICU",
        hour: "10:15",
        diagnosis: "Traumatic subdural hematoma, GCS 6, ventilated",
        gcs: { score: 6, note: "Documented 3 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        extra: "HIS shows: 'Coordinator disposition documented 8 hours ago: VALIDATED — REFERRAL ACCEPTED'",
        action: "none",
        explanation:
          "No NEW alert needed. EMR-DAS suppresses duplicate alerts when a documented coordinator disposition already exists within the prior 24 hours. The patient was already validated and accepted 8 hours ago — the SHARE team is engaged. The suppression reason is retained in the audit trail.",
        ruleCited: "Duplicate suppression: disposition within prior 24 h",
      },
      {
        id: "4-4",
        name: "Patient H.J.",
        age: 62,
        sex: "F",
        unit: "Stroke Unit",
        hour: "11:00",
        diagnosis: "Extensive cerebral venous sinus thrombosis with hemorrhagic infarcts",
        gcs: { score: 7, note: "E2 V2 M3 — documented 5 hours ago" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: severe neurologic injury with GCS 7 (≤ 7) within 6 hours. There is no prior coordinator disposition on record, so no duplicate suppression. Alert SHARE.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 within 6 h",
      },
      {
        id: "4-5",
        name: "Patient K.L.",
        age: 45,
        sex: "M",
        unit: "ICU",
        hour: "12:25",
        diagnosis: "Severe TBI, GCS 6, brain-stem testing ordered by neurology",
        gcs: { score: 6, note: "E1 V1t M5 — documented 4 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: true,
        action: "share",
        explanation:
          "HIGH-PRIORITY referral: brain-stem testing has been ordered (brain-death evaluation underway) in a patient meeting Alert Logic v1.0. This creates the urgent referral-review flag. SHARE must coordinate immediately.",
        ruleCited: "Alert Logic v1.0 + brain-death evaluation = high-priority flag",
      },
      {
        id: "4-6",
        name: "Patient M.P.",
        age: 71,
        sex: "F",
        unit: "Medical Ward",
        hour: "13:40",
        diagnosis: "Hepatic encephalopathy, chronic liver disease",
        gcs: { score: 9, note: "E2 V4 M3 — fluctuating over the day" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "surv",
        explanation:
          "Surveillance, no alert: metabolic encephalopathy with GCS 9 is in the GCS ≤ 12 monitoring cohort. No alert unless a qualifying neurologic injury appears or GCS falls to 7 or below.",
        ruleCited: "GCS ≤ 12 surveillance — metabolic cause, no structural injury",
      },
      {
        id: "4-7",
        name: "Patient R.S.",
        age: 39,
        sex: "M",
        unit: "Neuro ICU",
        hour: "14:50",
        diagnosis: "Cerebellar infarct with compression of brainstem, EVD in place",
        gcs: { score: 5, note: "E1 V1t M4 — documented 1 hour ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: posterior fossa infarct with brainstem compression plus GCS 5 within 6 hours (and within the 24-hour ventilated window). Dual-pathway trigger. Alert SHARE.",
        ruleCited: "Alert Logic v1.0: meets both the 6-h and 24-h pathways",
      },
      {
        id: "4-8",
        name: "Patient T.U.",
        age: 53,
        sex: "F",
        unit: "ER",
        hour: "15:35",
        diagnosis: "Syncope of unclear cause, transient hypotension",
        gcs: { score: 11, note: "E3 V4 M4 — documented 1 hour ago, improving" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "surv",
        explanation:
          "Surveillance: GCS 11 puts the patient in the ≤ 12 monitoring cohort. No neurologic injury source term is documented yet. Investigate the cause; escalate if GCS deteriorates to 7 or below.",
        ruleCited: "GCS ≤ 12 surveillance cohort",
      },
      {
        id: "4-9",
        name: "Patient V.W.",
        age: 47,
        sex: "M",
        unit: "Neuro ICU",
        hour: "16:10",
        diagnosis: "Bilateral thalamic hemorrhage, day 3",
        gcs: { score: 6, note: "Documented 26 hours ago; no newer documented GCS in HIS" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "surv",
        explanation:
          "Tricky case: the last documented GCS 6 is 26 hours old — outside the 24-hour ventilated window — and no newer score exists in the HIS. EMR-DAS triggers only on documented data within the window. This should prompt a real-time GCS re-assessment at the bedside; if the new score is ≤ 7, an alert fires. Until then: surveillance, and ask the team to chart a current GCS.",
        ruleCited: "No documented GCS ≤ 7 within 24 h — reassess at bedside",
      },
      {
        id: "4-10",
        name: "Patient Y.Z.",
        age: 68,
        sex: "F",
        unit: "ICU",
        hour: "17:20",
        diagnosis: "Cardiogenic shock, multi-organ failure — no brain injury",
        gcs: { score: 6, note: "E1 V1t M5 — deep shock, documented 2 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. Although GCS is 6 on ventilation, there is no severe acute neurologic injury source term — the coma is from shock/hypoperfusion. EMR-DAS v1.0 requires the neurologic component. A false alert here would burden the coordinator queue.",
        ruleCited: "No neurologic source term — false-alert trap",
      },
    ],
  },

  /* ============ LEVEL 5: Full-shift mixed gauntlet ============ */
  {
    id: 5,
    name: "Full Shift Gauntlet",
    tagline: "Ten patients, zero hints. Earn your coordinator badge.",
    focus: "The complete mix: clear triggers, surveillance cases, sedation traps, stale data, duplicates, and high-priority brain-death flags — exactly like a real night shift.",
    patients: [
      {
        id: "5-1",
        name: "Patient A.B.",
        age: 52,
        sex: "M",
        unit: "ER → ICU",
        hour: "19:05",
        diagnosis: "Fallen from height: severe TBI, bilateral contusions",
        gcs: { score: 4, note: "E1 V1t M3 — documented 45 minutes ago" },
        ventilated: { onVent: true, note: "Intubated in ER" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: severe TBI plus GCS 4 within 6 hours. Textbook trigger. Alert SHARE.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 within 6 h",
      },
      {
        id: "5-2",
        name: "Patient C.D.",
        age: 30,
        sex: "F",
        unit: "ICU",
        hour: "19:50",
        diagnosis: "Asthma status asthmaticus, intubated",
        gcs: { score: 15, note: "Awake and anxious on the vent" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. Ventilated but GCS 15 and no neurologic injury. Remember: ventilation alone never triggers EMR-DAS.",
        ruleCited: "Ventilation alone ≠ alert",
      },
      {
        id: "5-3",
        name: "Patient E.F.",
        age: 59,
        sex: "M",
        unit: "Neuro ICU",
        hour: "20:15",
        diagnosis: "Intracerebral hemorrhage, midline shift, brain death declaration completed",
        gcs: { score: 3, note: "Brain death formally declared under hospital protocol" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: true,
        action: "share",
        explanation:
          "HIGH-PRIORITY referral: brain death has been formally declared. The coordinator must now proceed with the donation pathway — database update, family approach, consent, and PHILNOS coordination for organ allocation. EMR-DAS doesn't declare brain death, but it must flag it instantly.",
        ruleCited: "Brain-death declaration = maximum priority referral",
      },
      {
        id: "5-4",
        name: "Patient G.H.",
        age: 42,
        sex: "F",
        unit: "Medical Ward",
        hour: "21:00",
        diagnosis: "Alcohol withdrawal, tremulous but responsive",
        gcs: { score: 14, note: "Oriented, CIWA protocol" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. GCS 14, no neurologic injury. Continue withdrawal management.",
        ruleCited: "GCS > 12, no qualifying criteria",
      },
      {
        id: "5-5",
        name: "Patient I.J.",
        age: 66,
        sex: "M",
        unit: "Stroke Unit → ICU",
        hour: "21:40",
        diagnosis: "Massive left hemispheric stroke, deteriorating",
        gcs: { score: 8, note: "E2 V3 M3 — documented 2 hours ago, was 12 yesterday" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "surv",
        explanation:
          "Surveillance, no alert yet: GCS 8 is one point above the threshold. Deterioration from 12 to 8 is a warning — reassess frequently, and if GCS drops to 7 or below within the next hours, trigger the alert.",
        ruleCited: "GCS 8–12 = surveillance; trending down — watch closely",
      },
      {
        id: "5-6",
        name: "Patient K.L.",
        age: 35,
        sex: "F",
        unit: "ICU",
        hour: "22:10",
        diagnosis: "Drowning with hypoxic-ischemic brain injury, day 1",
        gcs: { score: 5, note: "E1 V1t M4 — documented 6 hours ago (targeted temperature management)" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation, TTM" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: hypoxic-ischemic injury is a qualifying source term and GCS 5 was documented exactly within the 24-hour ventilated window. Coordinator validation is essential here because TTM/sedation can depress scores — but the alert must fire for review.",
        ruleCited: "Alert Logic v1.0: Ventilated + GCS ≤ 7 within 24 h",
      },
      {
        id: "5-7",
        name: "Patient M.N.",
        age: 78,
        sex: "F",
        unit: "Medical Ward",
        hour: "22:45",
        diagnosis: "UTI, dehydrated, drowsy",
        gcs: { score: 13, note: "Improving with fluids and antibiotics" },
        ventilated: { onVent: false, note: "Not ventilated" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. Mild depressed consciousness from infection/dehydration, no neurologic injury, GCS above surveillance threshold.",
        ruleCited: "GCS 13, no neurologic source term",
      },
      {
        id: "5-8",
        name: "Patient O.P.",
        age: 48,
        sex: "M",
        unit: "Neuro ICU",
        hour: "23:20",
        diagnosis: "Ruptured AVM with intraventricular hemorrhage",
        gcs: { score: 6, note: "E1 V1t M5 — documented 3 hours ago" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        extra: "HIS shows: 'Coordinator disposition 26 hours ago: REJECTED — family declined early; no current disposition'",
        action: "share",
        explanation:
          "Referral-alert positive: qualifying hemorrhage plus GCS 6 within 6 hours. The previous coordinator disposition is 26 hours old — beyond the 24-hour duplicate-suppression window — so a new alert is required.",
        ruleCited: "Alert Logic v1.0; prior disposition expired (> 24 h)",
      },
      {
        id: "5-9",
        name: "Patient Q.R.",
        age: 26,
        sex: "F",
        unit: "ICU",
        hour: "23:55",
        diagnosis: "Viral myocarditis with cardiogenic shock",
        gcs: { score: 8, note: "E2 V1t M5 — sedated for shock management" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation, ECMO team consulted" },
        brainDeathEval: false,
        action: "none",
        explanation:
          "No alert. Sedation-driven GCS 8 with no neurologic injury source term — a cardiac case, not a brain-injury case. This is a false-alert trap the coordinator queue must be spared from.",
        ruleCited: "No neurologic source term — sedation/shock coma",
      },
      {
        id: "5-10",
        name: "Patient S.T.",
        age: 55,
        sex: "M",
        unit: "Neurosurgery ICU",
        hour: "00:30",
        diagnosis: "Massive SAH, aneurysm secured, GCS deteriorating again",
        gcs: { score: 7, note: "E2 V1t M4 — documented 20 minutes ago, down from 9 at 22:00" },
        ventilated: { onVent: true, note: "Invasive mechanical ventilation" },
        brainDeathEval: false,
        action: "share",
        explanation:
          "Referral-alert positive: the SAH qualifies and the fresh GCS of 7 was documented 20 minutes ago — within both the 6-hour and 24-hour windows. Deterioration from 9 to 7 is exactly the change EMR-DAS exists to catch. Alert SHARE now.",
        ruleCited: "Alert Logic v1.0: Neurologic injury + GCS ≤ 7 (fresh data)",
      },
    ],
  },
];

export const actions = [
  { value: "share", label: "REFER TO SHARE TEAM", detail: "Donor Alert — notify the Donor Coordinator" },
  { value: "surv", label: "CONTINUE SURVEILLANCE", detail: "GCS ≤ 12 cohort — monitor for deterioration" },
  { value: "none", label: "NO ALERT NEEDED", detail: "Continue routine specialty care" },
] as const;
