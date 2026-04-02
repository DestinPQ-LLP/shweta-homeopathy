/**
 * Static fallback conditions — used when the Google Sheet is empty or inaccessible.
 * These 12 conditions are seeded from the clinic's content briefs.
 */
import type { ConditionCategory } from './conditions';
import type { HealingCondition } from './healing-conditions';

export const STATIC_CONDITIONS: HealingCondition[] = [
  {
    slug: 'alopecia-hair-loss',
    name: 'Alopecia & Hair Loss',
    category: 'Lifestyle' as ConditionCategory,
    shortDesc: 'Restore scalp health and stimulate natural regrowth with constitutional homeopathic care.',
    intro:
      'Alopecia refers to partial or complete hair loss from the scalp or body. It ranges from androgenic alopecia (pattern hair loss) to alopecia areata, an autoimmune condition causing patchy bald spots. Homeopathy addresses the underlying cause — hormonal imbalance, nutritional deficiency, chronic stress, or autoimmune triggers — rather than merely stimulating the scalp superficially. Treatment is tailored to the individual\'s constitution, stress levels, and associated symptoms.',
    symptoms: [
      'Patchy or diffuse hair thinning',
      'Excessive hair fall on combing or washing',
      'Receding hairline or widening parting',
      'Dry, itchy, or inflamed scalp',
      'Brittle hair prone to breakage',
      'Eyebrow or eyelash loss (areata)',
      'Slow regrowth after hair fall',
    ],
    howHomeopathyHelps:
      'Remedies such as Phosphorus, Natrum Muriaticum, Lycopodium, and Silicea are selected based on the patient\'s emotional state, diet, and hormonal history. Constitutional treatment corrects the immune dysregulation in areata, supports thyroid balance, and reduces stress-related cortisol spikes that trigger telogen effluvium. Most patients notice reduced shedding within 6–8 weeks and visible regrowth by 3–4 months.',
    icon: '🌿',
    status: 'published',
  },
  {
    slug: 'cancer-supportive-care',
    name: 'Cancer Supportive Care',
    category: 'Supportive Care' as ConditionCategory,
    shortDesc: 'Gentle integrative support to ease side effects of conventional cancer treatment and strengthen vitality.',
    intro:
      'Homeopathy does not claim to cure cancer; it serves as a compassionate adjunct to oncology care. It focuses on improving the patient\'s quality of life during and after chemotherapy, radiation, or surgery. By addressing fatigue, nausea, mucositis, peripheral neuropathy, emotional distress, and immune suppression, homeopathic support helps patients tolerate conventional treatment better and recover faster.',
    symptoms: [
      'Severe fatigue and weakness after chemotherapy',
      'Nausea, vomiting, and appetite loss',
      'Mouth sores and dry mouth (mucositis)',
      'Numbness or tingling in hands and feet',
      'Skin reactions from radiation',
      'Anxiety, depression, or fear',
      'Recurrent infections due to low immunity',
    ],
    howHomeopathyHelps:
      'Remedies like Cadmium Sulphuratum (chemo nausea), Radium Bromatum (radiation burns), Phosphoric Acid (post-treatment debility), and Arsenicum Album (restlessness and anxiety) are carefully selected. Homeopathy is prescribed alongside oncology treatment — never as a replacement. The goal is to strengthen the body\'s resilience, reduce suffering, and support emotional wellbeing through a deeply challenging journey.',
    icon: '🕊️',
    status: 'published',
  },
  {
    slug: 'joint-problems-arthritis',
    name: 'Joint Problems & Arthritis',
    category: 'Chronic Care' as ConditionCategory,
    shortDesc: 'Reduce inflammation, ease pain, and slow joint degeneration with individualised homeopathic treatment.',
    intro:
      'Arthritis encompasses over 100 conditions affecting the joints, including osteoarthritis (OA), rheumatoid arthritis (RA), gout, ankylosing spondylitis, and psoriatic arthritis. Conventional management relies on NSAIDs and DMARDs with significant long-term side effects. Homeopathy modulates the inflammatory and immune response, slows cartilage degradation, and addresses the constitutional tendencies that predispose a person to joint disease.',
    symptoms: [
      'Morning stiffness lasting more than 30 minutes',
      'Swollen, warm, and tender joints',
      'Reduced range of motion',
      'Crepitus (cracking sounds on movement)',
      'Deformity or nodule formation in advanced OA',
      'Gout attacks — severe pain in big toe or foot',
      'Back pain and stiffness (ankylosing spondylitis)',
    ],
    howHomeopathyHelps:
      'Rhus Tox, Bryonia, Calcarea Carbonica, Colchicum, and Benzoic Acid are among the key remedies chosen based on modalities (better or worse with motion, warmth, rest), joint distribution, and patient constitution. RA patients often see reduction in ESR/CRP markers alongside symptomatic relief. Homeopathy can be integrated with existing DMARDs under medical supervision, and many patients are able to reduce NSAID dependence over time.',
    icon: '🦴',
    status: 'published',
  },
  {
    slug: 'womens-health',
    name: "Women's Health",
    category: "Women's Health" as ConditionCategory,
    shortDesc: 'Holistic hormonal balance for PCOS, endometriosis, menstrual disorders, and menopause.',
    intro:
      "Women's health encompasses a wide spectrum of hormonal and reproductive concerns — irregular or painful periods, PCOS, endometriosis, uterine fibroids, premenstrual syndrome, leucorrhoea, and menopause. Homeopathy recognises that these conditions are often expressions of a deeper constitutional imbalance involving hormones, the nervous system, and emotional health. Treatment is non-hormonal, gentle, and free from the side effects of OCP or HRT.",
    symptoms: [
      'Irregular, heavy, or painful menstrual cycles',
      'PCOS symptoms: acne, weight gain, facial hair',
      'Endometriosis pain radiating to back and thighs',
      'PMS: mood swings, bloating, breast tenderness',
      'Hot flashes and night sweats (menopause)',
      'White or yellow vaginal discharge (leucorrhoea)',
      'Difficulty conceiving (subfertility)',
    ],
    howHomeopathyHelps:
      'Lachesis, Pulsatilla, Sepia, Calcarea Carbonica, and Thuja are deeply acting constitutional remedies tailored to the woman\'s hormonal pattern, emotional landscape, and body type. PCOS cases see regularisation of cycles and reduction in androgen levels. Endometriosis patients report significant pain reduction. Menopausal women experience fewer hot flashes and improved sleep without synthetic hormones. Treatment duration is typically 6–12 months for chronic issues.',
    icon: '🌸',
    status: 'published',
  },
  {
    slug: 'diabetes-mellitus',
    name: 'Diabetes Mellitus',
    category: 'Lifestyle' as ConditionCategory,
    shortDesc: 'Support blood sugar regulation and prevent diabetic complications with constitutional homeopathy.',
    intro:
      'Diabetes mellitus — both Type 1 and Type 2 — is a chronic metabolic condition involving impaired glucose regulation. While homeopathy cannot replace insulin in Type 1, it provides significant adjunct support for blood sugar control in Type 2, reduces insulin resistance, and prevents or delays complications such as peripheral neuropathy, nephropathy, and retinopathy. Constitutional treatment also addresses the lifestyle and emotional factors that drive metabolic syndrome.',
    symptoms: [
      'Frequent urination and excessive thirst',
      'Unexplained fatigue and weakness',
      'Blurred vision',
      'Slow-healing wounds or frequent infections',
      'Tingling or numbness in hands and feet (neuropathy)',
      'Increased hunger despite eating',
      'Recurrent fungal or skin infections',
    ],
    howHomeopathyHelps:
      'Uranium Nitricum, Syzygium Jambolanum, Phosphoric Acid, and Lycopodium are selected based on the patient\'s metabolic profile, craving patterns, emotional state, and complications. Type 2 patients on metformin frequently achieve better HbA1c control with homeopathy alongside dietary changes. Neuropathy symptoms improve significantly with nerve-targeted remedies. Homeopathy is always prescribed as an adjunct — never a replacement for medical management.',
    icon: '🩸',
    status: 'published',
  },
  {
    slug: 'geriatric-disorders',
    name: 'Geriatric Disorders',
    category: 'Chronic Care' as ConditionCategory,
    shortDesc: 'Safe, gentle care for the elderly — managing multiple chronic conditions without adverse drug effects.',
    intro:
      'The elderly often manage multiple co-existing conditions — hypertension, diabetes, osteoarthritis, dementia, incontinence, and chronic pain — while taking 5–10 medications simultaneously. Polypharmacy increases the risk of adverse events. Homeopathy offers a safe, non-toxic alternative for symptom management that does not interact with conventional medicines. It also addresses age-related cognitive decline, emotional isolation, and sleep disturbances that other treatment modalities often overlook.',
    symptoms: [
      'Memory lapses and early-stage cognitive decline',
      'Chronic pain (joints, spine, muscles)',
      'Urinary incontinence or urgency',
      'Vertigo and balance issues',
      'Insomnia and early morning waking',
      'Constipation and digestive slowness',
      'Low energy, lethargy, and depression',
    ],
    howHomeopathyHelps:
      'Baryta Carbonica, Conium Maculatum, Alumina, and Calcarea Phosphorica are key geriatric remedies. They improve mental clarity, reduce joint pain, regulate bowel function, and lift mood without sedation or drug interactions. Treatment is adjusted for organ sensitivity in the elderly. A holistic approach also considers the emotional dimension — isolation, grief, and the sense of uselessness that compounds physical decline. Many elderly patients on homeopathy report dramatically improved quality of life within 2–3 months.',
    icon: '🧓',
    status: 'published',
  },
  {
    slug: 'depression-anxiety',
    name: 'Depression & Anxiety',
    category: 'Chronic Care' as ConditionCategory,
    shortDesc: 'Restore emotional balance naturally — without the dependence or side effects of antidepressants.',
    intro:
      'Depression and anxiety are among the most prevalent health challenges of our time. Conventional treatment with antidepressants and anxiolytics provides symptomatic relief but carries risks of dependence, weight gain, sexual dysfunction, and emotional blunting. Homeopathy treats the individual — not just the diagnosis. It recognises that behind every case of depression or anxiety lies a unique story of grief, disappointment, suppressed emotion, or constitutional vulnerability.',
    symptoms: [
      'Persistent sadness, hopelessness, or emptiness',
      'Loss of interest in activities once enjoyed',
      'Excessive worry, panic, or fear',
      'Sleep disturbances (insomnia or hypersomnia)',
      'Fatigue and lack of motivation',
      'Palpitations, breathlessness with anxiety',
      'Difficulty concentrating or making decisions',
    ],
    howHomeopathyHelps:
      'Natrum Muriaticum (grief, closed emotions), Ignatia (acute grief and disappointment), Aurum Metallicum (deep depression with suicidal ideation), Argentum Nitricum (anticipatory anxiety), and Arsenicum Album (OCD-like anxiety with restlessness) are matched to the patient\'s emotional and mental picture. Homeopathy is prescribed alongside psychological support when appropriate. Patients report improved sleep within the first weeks, followed by gradual lifting of mood, reduced panic episodes, and greater emotional resilience over 3–6 months.',
    icon: '🧠',
    status: 'published',
  },
  {
    slug: 'gastrointestinal-disorders',
    name: 'Gastrointestinal Disorders',
    category: 'Chronic Care' as ConditionCategory,
    shortDesc: 'Heal the gut from within — IBS, acid reflux, ulcers, and chronic indigestion addressed constitutionally.',
    intro:
      'Gastrointestinal disorders range from functional conditions like irritable bowel syndrome (IBS) and acid reflux to inflammatory conditions like ulcerative colitis, Crohn\'s disease, and peptic ulcers. The gut-brain axis means stress, anxiety, and suppressed emotions manifest as physical gut symptoms. Homeopathy recognises this connection and addresses both the physical inflammation and the underlying nervous system dysregulation that perpetuates it.',
    symptoms: [
      'Chronic bloating, gas, and abdominal distension',
      'Acid reflux, heartburn, or sour belching',
      'Alternating diarrhoea and constipation (IBS)',
      'Blood or mucus in stools (colitis)',
      'Nausea after meals',
      'Cramping pain before or during bowel movements',
      'Loss of appetite or food sensitivities',
    ],
    howHomeopathyHelps:
      'Nux Vomica, Lycopodium, Sulphur, Pulsatilla, Mercurius Corrosivus, and Phosphorus are among the most frequently indicated remedies — each matching a distinct gut presentation and patient constitution. IBS patients with anxiety respond beautifully to Argentum Nitricum or Gelsemium when stress-triggered. Ulcerative colitis patients see reduced flare frequency and intensity. Acid reflux cases often resolve without continuing antacids after 3–4 months of constitutional treatment.',
    icon: '🫁',
    status: 'published',
  },
  {
    slug: 'pediatric-diseases',
    name: 'Pediatric Diseases',
    category: 'Pediatric' as ConditionCategory,
    shortDesc: 'Safe, gentle, and effective homeopathic care for children — from recurrent infections to developmental concerns.',
    intro:
      'Children respond exceptionally well to homeopathy because their vital force is strong and reactive. Common pediatric concerns include recurrent respiratory infections (tonsilitis, sinusitis, ear infections), allergies, eczema, asthma, bedwetting, behavioural issues (ADHD), developmental delays, and poor immunity. Homeopathy avoids the suppression associated with chronic antibiotic or steroid use, allowing the child\'s immune system to mature naturally.',
    symptoms: [
      'Recurrent throat infections, ear infections, or colds',
      'Childhood asthma and wheezing',
      'Eczema, urticaria, or nappy rash',
      'Bedwetting beyond age 5',
      'Teething difficulties and colic in infants',
      'Behavioural issues — hyperactivity, tantrums, poor concentration',
      'Slow weight gain or persistent digestive issues',
    ],
    howHomeopathyHelps:
      'Calcarea Carbonica (stocky, slow, recurrent infections), Pulsatilla (clingy, weepy, prone to ear and sinus infections), Sulphur (hot, scratchy eczema), Chamomilla (teething, colic), and Medorrhinum (allergy-prone, hyperactive constitutions) are matched to the child\'s unique picture. Parents consistently report that homeopathy breaks the cycle of recurrent antibiotic use in their children. Developmental delays and behavioural concerns are addressed holistically alongside specialist support.',
    icon: '🧒',
    status: 'published',
  },
  {
    slug: 'skin-diseases',
    name: 'Skin Diseases',
    category: 'Skin' as ConditionCategory,
    shortDesc: 'Clear skin from the inside out — eczema, psoriasis, urticaria, and acne treated at the root.',
    intro:
      'The skin is a mirror of internal health. Chronic skin diseases like eczema, psoriasis, acne, urticaria, vitiligo, and lichen planus reflect deeper systemic imbalances — hormonal, immunological, or emotional. Conventional treatment suppresses symptoms with steroids or immunosuppressants, often causing rebound flares. Homeopathy stimulates the immune system to heal the underlying cause, resulting in long-term remission rather than temporary suppression.',
    symptoms: [
      'Itching, redness, and dry scaly patches (eczema/psoriasis)',
      'Raised, itchy welts that shift location (urticaria)',
      'Cystic or hormonal acne on face, back, or chest',
      'Loss of skin pigmentation (vitiligo)',
      'Thick, silvery plaques on elbows and scalp (psoriasis)',
      'Weeping or crusting skin lesions',
      'Seasonal aggravations or stress-triggered flares',
    ],
    howHomeopathyHelps:
      'Sulphur, Arsenicum Album, Graphites, Petroleum, Natrum Muriaticum, and Thuja are deeply curative skin remedies matched to the appearance, sensation, location, and triggers of each patient\'s skin disease. Psoriasis patients may experience a temporary initial aggravation as the deeper disease comes to the surface before clearing. Most eczema cases show significant improvement within 6–8 weeks. Vitiligo responds slowly but steadily over 12–18 months of treatment.',
    icon: '✨',
    status: 'published',
  },
  {
    slug: 'respiratory-diseases',
    name: 'Respiratory Diseases',
    category: 'Respiratory' as ConditionCategory,
    shortDesc: 'Breathe freely — asthma, chronic bronchitis, allergic rhinitis, and recurrent respiratory infections managed holistically.',
    intro:
      'Respiratory diseases — from allergic rhinitis and chronic sinusitis to asthma and chronic obstructive pulmonary disease (COPD) — significantly impact quality of life. Many patients cycle through repeated antibiotics and steroids without addressing the underlying allergic or immune dysregulation. Homeopathy offers a roadmap to reducing reactivity, improving lung function, and progressively reducing dependence on bronchodilators and steroids.',
    symptoms: [
      'Wheezing, chest tightness, and shortness of breath',
      'Nocturnal cough that worsens lying down',
      'Persistent post-nasal drip and congestion',
      'Seasonal allergic rhinitis — sneezing, watery eyes',
      'Chronic sinusitis with thick yellow or green discharge',
      'Recurrent chest infections and prolonged coughs',
      'Exercise-induced breathlessness',
    ],
    howHomeopathyHelps:
      'Arsenicum Album, Ipecacuanha, Natrum Muriaticum, Allium Cepa, Silicea, and Hepar Sulphuris are matched to the patient\'s respiratory pattern, aggravating factors (dust, cold air, emotions), and constitution. Asthmatic children and adults see reduced frequency and severity of attacks. Homeopathy is always integrated with conventional inhalers — never as a replacement until medically supervised weaning is appropriate. Allergic rhinitis patients typically achieve histamine-free summers within 2 seasons of treatment.',
    icon: '🫀',
    status: 'published',
  },
  {
    slug: 'thyroid-disorders',
    name: 'Thyroid Disorders',
    category: 'Lifestyle' as ConditionCategory,
    shortDesc: 'Balance thyroid function naturally — hypothyroidism, hyperthyroidism, and Hashimoto\'s addressed constitutionally.',
    intro:
      'Thyroid disorders — hypothyroidism, hyperthyroidism (Graves\' disease), and Hashimoto\'s thyroiditis — affect metabolism, energy, weight, mood, and fertility. Conventional management involves lifelong thyroid hormone replacement (levothyroxine) or anti-thyroid drugs, but does not address the autoimmune root cause. Homeopathy works at the immunological level to reduce thyroid antibodies (TPO, anti-TG), normalise TSH, and support the patient\'s constitution through the metabolic disruption.',
    symptoms: [
      'Unexplained weight gain or difficulty losing weight (hypothyroid)',
      'Unexplained weight loss, palpitations, tremors (hyperthyroid)',
      'Persistent fatigue and lethargy',
      'Hair thinning and dry skin',
      'Cold intolerance (hypothyroid) or heat intolerance (hyperthyroid)',
      'Brain fog, poor memory, and low mood',
      'Irregular or absent menstrual cycles',
    ],
    howHomeopathyHelps:
      'Calcarea Carbonica, Sepia, Thyroidinum, Iodum, and Lycopodium are selected based on the patient\'s thyroid pattern, body type, emotional tendencies, and associated symptoms. Hashimoto\'s patients see measurable reduction in antibody titre over 6–12 months. Hypothyroid patients may gradually reduce their levothyroxine dose under medical supervision. Homeopathy restores hormonal balance without the calcification and cardiovascular risks associated with long-term thyroid medication overdose.',
    icon: '🦋',
    status: 'published',
  },
];
