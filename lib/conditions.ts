// Static data for conditions — used across SSR pages
export type ConditionCategory =
  | "Women's Health"
  | 'Skin'
  | 'Respiratory'
  | 'Pediatric'
  | 'Chronic Care'
  | 'Lifestyle'
  | 'Supportive Care';

export interface Condition {
  slug: string;
  name: string;
  category: ConditionCategory;
  shortDesc: string;
  intro: string;
  symptoms: string[];
  howHomeopathyHelps: string;
  icon: string;
}

export const conditions: Condition[] = [
  {
    slug: 'alopecia-hair-loss',
    name: 'Alopecia & Hair Loss',
    category: 'Skin',
    shortDesc: 'Holistic treatment for hair fall, alopecia areata, and pattern baldness.',
    intro: 'Hair loss can affect confidence and quality of life deeply. Homeopathy addresses the root constitutional cause — stress, hormonal imbalance, nutritional deficiency, or hereditary factors — rather than just the symptom.',
    symptoms: ['Patchy hair loss','Receding hairline','Thinning across scalp','Hair loss with dandruff','Hair loss during hormonal changes'],
    howHomeopathyHelps: 'Remedies like Phosphorus, Lycopodium, and Silicea are selected individually based on the patient\'s constitution, strengthening hair follicles and addressing underlying causes.',
    icon: 'Leaf',
  },
  {
    slug: 'cancer-supportive-care',
    name: 'Cancer Supportive Care',
    category: 'Supportive Care',
    shortDesc: 'Complementary homeopathic support alongside conventional cancer treatment.',
    intro: 'Homeopathy is used as a complementary treatment to help manage side effects of chemotherapy and radiation, improve immunity, and support the body\'s natural healing capacity.',
    symptoms: ['Fatigue from chemo','Nausea and vomiting','Loss of appetite','Reduced immunity','Emotional distress'],
    howHomeopathyHelps: 'Individualized constitutional remedies help improve vitality, manage side effects, and enhance overall quality of life during and after cancer treatment.',
    icon: 'Flower',
  },
  {
    slug: 'joint-problems-arthritis',
    name: 'Joint Problems & Arthritis',
    category: 'Chronic Care',
    shortDesc: 'Natural, side-effect-free relief for arthritis, gout, and joint pain.',
    intro: 'Joint problems including rheumatoid arthritis, osteoarthritis, and gout cause significant pain and restrict mobility. Homeopathy offers curative treatment targeting the root inflammatory and metabolic imbalances.',
    symptoms: ['Morning stiffness','Swelling and redness','Pain on movement','Restricted range of motion','Joint deformity'],
    howHomeopathyHelps: 'Remedies such as Rhus Tox, Bryonia, and Colchicum reduce inflammation, improve joint mobility, and provide long-term relief without NSAIDs or steroids.',
    icon: 'Bone',
  },
  {
    slug: 'female-diseases',
    name: "Women's Health",
    category: "Women's Health",
    shortDesc: 'Expert homeopathic care for PCOD, endometriosis, menstrual disorders, and fertility.',
    intro: "Women's health requires a sensitive, holistic approach. Dr. Shweta specializes in treating hormonal imbalances, PCOD, endometriosis, menstrual irregularities, and fertility concerns with individualized homeopathic treatment.",
    symptoms: ['Irregular periods','PCOD / PCOS','Heavy or painful menstruation','Endometriosis','Leucorrhoea','Fertility concerns'],
    howHomeopathyHelps: 'Constitutional remedies like Pulsatilla, Sepia, and Lachesis are chosen based on the complete symptom picture, regulating hormones and restoring reproductive health naturally.',
    icon: 'Activity',
  },
  {
    slug: 'diabetes-mellitus',
    name: 'Diabetes Mellitus',
    category: 'Lifestyle',
    shortDesc: 'Managing blood sugar and preventing complications through homeopathy.',
    intro: 'Homeopathy helps manage Type 2 diabetes by improving metabolic function, reducing complications, and enhancing overall wellbeing. It works alongside conventional management for a comprehensive approach.',
    symptoms: ['High blood sugar','Increased thirst and urination','Fatigue','Slow wound healing','Tingling in hands or feet'],
    howHomeopathyHelps: 'Remedies like Syzygium, Uranium Nitricum, and Phosphorus help regulate glucose metabolism, manage complications, and improve energy levels.',
    icon: 'Pill',
  },
  {
    slug: 'geriatric-disorders',
    name: 'Geriatric Disorders',
    category: 'Chronic Care',
    shortDesc: 'Gentle, effective homeopathic care for elderly patients.',
    intro: 'The elderly often suffer from multiple chronic conditions with complex medication interactions. Homeopathy offers gentle, safe treatment without side effects, improving quality of life in the golden years.',
    symptoms: ['Memory decline','Insomnia','Multiple joint pains','Digestive weakness','Loneliness and depression'],
    howHomeopathyHelps: 'Individualized constitutional treatment improves vitality, memory, digestion, and emotional wellbeing. Remedies are safe even with long-term use.',
    icon: 'TreePine',
  },
  {
    slug: 'depression-anxiety',
    name: 'Depression & Anxiety',
    category: 'Lifestyle',
    shortDesc: 'Holistic mental health support without sedatives or dependency.',
    intro: 'Mental health conditions like depression, anxiety, and panic disorders have deep constitutional roots. Homeopathy treats the whole person — mind and body together — offering lasting relief.',
    symptoms: ['Persistent sadness','Excessive worry','Panic attacks','Sleep disturbances','Lack of motivation','Social withdrawal'],
    howHomeopathyHelps: 'Remedies like Ignatia, Natrum Mur, and Argentum Nitricum are matched to the individual\'s emotional and physical symptom pattern, providing natural, non-addictive support.',
    icon: 'Brain',
  },
  {
    slug: 'gastrointestinal-disorders',
    name: 'Gastrointestinal Disorders',
    category: 'Chronic Care',
    shortDesc: 'Treating IBS, acidity, colitis, and digestive disorders holistically.',
    intro: 'The gut is central to overall health. Homeopathy effectively treats chronic GI conditions like IBS, acid reflux, Crohn\'s disease, and colitis by addressing the underlying constitutional imbalance.',
    symptoms: ['Chronic acidity / GERD','IBS (bloating, alternating bowels)','Chronic constipation or diarrhea','Gastric ulcers','Inflammatory bowel disease'],
    howHomeopathyHelps: 'Remedies such as Nux Vomica, Carbo Veg, and Lycopodium heal the digestive lining, reduce inflammation, and restore normal gut function.',
    icon: 'Activity',
  },
  {
    slug: 'pediatric-diseases',
    name: 'Pediatric Diseases',
    category: 'Pediatric',
    shortDesc: 'Safe, gentle homeopathy for children of all ages.',
    intro: 'Children respond beautifully to homeopathic treatment because their vital force is strong. Dr. Shweta has extensive experience treating childhood illnesses — from recurrent infections to developmental concerns — safely.',
    symptoms: ['Recurrent cold and cough','Ear infections','Asthma in children','ADHD and behavioral issues','Bedwetting','Skin allergies'],
    howHomeopathyHelps: 'Homeopathic remedies for children are sweet, gentle, and completely safe. They boost immunity and treat the root cause, reducing recurrence of infections and allergies.',
    icon: 'Baby',
  },
  {
    slug: 'skin-disease',
    name: 'Skin Diseases',
    category: 'Skin',
    shortDesc: 'Eczema, psoriasis, acne, and chronic skin conditions treated holistically.',
    intro: 'Skin diseases often reflect internal constitutional imbalances. Homeopathy treats from within — not just topically — producing deep, lasting resolution of chronic skin conditions.',
    symptoms: ['Eczema / Atopic dermatitis','Psoriasis','Acne and rosacea','Urticaria (hives)','Vitiligo','Fungal infections'],
    howHomeopathyHelps: 'Constitutional remedies like Sulphur, Graphites, and Arsenicum Album address the internal terrain causing skin disease, avoiding dependence on steroids or harsh topical treatments.',
    icon: 'Sparkles',
  },
  {
    slug: 'respiratory-diseases',
    name: 'Respiratory Diseases',
    category: 'Respiratory',
    shortDesc: 'Breathe easier with homeopathic treatment for asthma, sinusitis, and allergies.',
    intro: 'Chronic respiratory conditions like asthma, sinusitis, and allergic rhinitis significantly impact quality of life. Homeopathy strengthens respiratory immunity and addresses allergic predisposition at the constitutional level.',
    symptoms: ['Asthma and wheezing','Chronic sinusitis','Allergic rhinitis / hay fever','Recurrent bronchitis','Post-nasal drip'],
    howHomeopathyHelps: 'Remedies like Arsenicum Album, Natrum Mur, and Spongia address the allergic diathesis, reducing frequency and severity of attacks over time.',
    icon: 'Droplets',
  },
  {
    slug: 'thyroid-disorders',
    name: 'Thyroid Disorders',
    category: 'Chronic Care',
    shortDesc: 'Treating hypothyroidism and hyperthyroidism through constitutional homeopathy.',
    intro: 'Thyroid disorders affect metabolism, energy, weight, and hormonal balance. Homeopathy can significantly improve thyroid function, sometimes reducing dependence on thyroid medication over time.',
    symptoms: ['Weight gain or loss','Fatigue and sluggishness','Hair thinning','Cold or heat intolerance','Mood swings','Swelling of thyroid (goitre)'],
    howHomeopathyHelps: 'Remedies like Thyroidinum, Lycopus, and Calcarea Carb are matched to the patient\'s constitutional type and thyroid pattern for safe, natural regulation.',
    icon: 'Sprout',
  },
];

export function getConditionBySlug(slug: string): Condition | undefined {
  return conditions.find((c) => c.slug === slug);
}
