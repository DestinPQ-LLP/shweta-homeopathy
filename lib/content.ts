// Static testimonials data
export interface Testimonial {
  id: string;
  name: string;
  condition: string;
  text: string;
  rating: number;
  location?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Shailija',
    condition: 'Back Pain',
    text: "I am a die-heart fan of Dr Shweta. Polite, knowledgeable and down to earth personality. I had several back pain issues. In 6 months she fixed it and now I have no issues. I must say she knows the disease and its treatment very well. I would strongly recommend her.",
    rating: 5,
  },
  {
    id: 't2',
    name: 'Richa',
    condition: 'Chronic Sinusitis',
    text: "I really want to thank Dr. Shweta who has changed my life. I had been a patient of Sinus for 2–3 years. I was not able to eat ice cream, curd, or sleep due to nasal obstruction. Since I started taking medicine from Dr. Shweta, I can eat anything and sleep comfortably. She listens to the patient very carefully and gives treatment accordingly. I was so depressed when I first came — today I am happy, blessed, and healthy.",
    rating: 5,
  },
  {
    id: 't3',
    name: 'Yogesh Verma',
    condition: 'Headache & Migraines',
    text: "I visited her for sneezing. Very good homeopathy doctor in the area. Listens very patiently and is polite and knowledgeable. If you have faith in homeopathy medicine then I will recommend her. I am feeling so much better now.",
    rating: 5,
    location: 'Zirakpur',
  },
  {
    id: 't4',
    name: 'Deshbir Singh',
    condition: 'Headache',
    text: "I was suffering from headache problems but after meeting Dr. Shweta I am feeling better and I have no headache problems now. She is very loyal, experienced, and a good doctor. Thanks to her.",
    rating: 5,
  },
  {
    id: 't5',
    name: 'Arvinder Singh',
    condition: 'Lifestyle Disorders',
    text: "I was suffering from multiple lifestyle disorders — high sugar levels, blood pressure, high cholesterol, migraine issues and many other nagging issues. Post getting the treatment from Dr Shweta I am feeling much better. My sugar level has come drastically down in just 3 months and cholesterol levels have also come down. I highly recommend Dr. Shweta Homeopathy Clinic. Stay patient and let the medication do its work.",
    rating: 5,
    location: 'Punjab',
  },
  {
    id: 't6',
    name: 'Priya M.',
    condition: 'PCOD',
    text: "After years of struggling with irregular periods and PCOD, Dr. Shweta's treatment has brought remarkable improvement in just 4 months. My cycles are regular, energy levels are up, and I feel like myself again. The gentle approach of homeopathy and her thorough case-taking made all the difference.",
    rating: 5,
    location: 'Chandigarh',
  },
  {
    id: 't7',
    name: 'Ramesh K.',
    condition: 'Eczema',
    text: "I had severe eczema for years and nothing seemed to work. Dr. Shweta took a detailed history over an online consultation and prescribed accordingly. Within 2 months I started seeing dramatic improvement. The patches are almost gone now. Homeopathy truly works when done right.",
    rating: 5,
    location: 'Delhi',
  },
];

// Static FAQ data
export interface FAQ {
  question: string;
  answer: string;
}

export const faqs: FAQ[] = [
  {
    question: 'Is homeopathy safe for children and pregnant women?',
    answer: 'Yes, homeopathy is one of the safest systems of medicine, making it ideal for children, pregnant women, nursing mothers, and the elderly. The remedies are highly diluted natural substances with no harmful side effects.',
  },
  {
    question: 'How long does homeopathic treatment take to show results?',
    answer: 'The timeline varies based on the condition, its chronicity, and the individual. Acute conditions often respond within hours or days. Chronic conditions typically require 3–6 months of treatment for significant improvement. Dr. Shweta will give you a realistic timeline at your first consultation.',
  },
  {
    question: 'Can I continue my conventional medications alongside homeopathy?',
    answer: 'Yes. Homeopathic treatment can safely run alongside conventional medications. Dr. Shweta will review your current medications and coordinate care. As your condition improves, your conventional doctor may reduce your medication dose over time.',
  },
  {
    question: 'Do you offer online consultations?',
    answer: 'Yes, Dr. Shweta offers online consultations with doorstep delivery of medicines across India and internationally. You can request an appointment through our online form and we will get in touch to schedule your video session.',
  },
  {
    question: 'What conditions does Dr. Shweta specialize in?',
    answer: 'Dr. Shweta specializes in chronic illness, women\'s health (PCOD, endometriosis, fertility), skin diseases, joint problems, pediatric conditions, respiratory diseases, thyroid disorders, and mental health conditions like anxiety and depression.',
  },
  {
    question: 'Will I need to stop eating or drinking anything during treatment?',
    answer: 'Certain dietary and lifestyle suggestions may be made based on your case. Commonly, coffee and strong mint-based products are avoided as they can interfere with some remedies. Dr. Shweta will provide specific guidance at your consultation.',
  },
  {
    question: 'What are Dr. Shweta\'s qualifications?',
    answer: 'Dr. Shweta Goyal holds a B.H.M.S degree (Gold Medalist, Panjab University), an MD in Homeopathy, and a post-graduate qualification from the International Academy of Classical Homeopathy (IACH), Greece — one of the most prestigious classical homeopathy institutions in the world.',
  },
  {
    question: 'How do I book an appointment?',
    answer: 'You can book an appointment by filling in the appointment request form on our website. Our team will contact you within 24 hours to confirm your slot. You can also reach us by phone or email directly.',
  },
];
