#!/bin/bash
# push-all-data.sh — pushes blog posts and testimonials via admin curl API

BASE="http://localhost:4000"
COOKIE=/tmp/shweta_cookies.txt

# Login
curl -s -c "$COOKIE" -X POST "$BASE/api/admin/auth" \
  -H "Content-Type: application/json" \
  -d '{"password":"admin1234"}' > /dev/null
echo "✅ Logged in"

push_blog() {
  local title="$1" slug="$2" excerpt="$3" category="$4" cover="$5"
  local result=$(curl -s -b "$COOKIE" -X POST "$BASE/api/admin/blog" \
    -H "Content-Type: application/json" \
    -d "{\"title\":$(echo "$title" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'),\"slug\":\"$slug\",\"excerpt\":$(echo "$excerpt" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'),\"category\":\"$category\",\"coverImageUrl\":\"$cover\",\"status\":\"published\",\"tags\":\"Homoeopathy\"}")
  if echo "$result" | grep -q '"id"'; then
    echo "  ✅ Blog: $title"
  else
    echo "  ⚠️  Blog failed: $result" | head -c 120
  fi
}

push_testimonial() {
  local name="$1" text="$2" rating="$3" condition="$4" location="$5" source="$6"
  local result=$(curl -s -b "$COOKIE" -X POST "$BASE/api/admin/testimonials" \
    -H "Content-Type: application/json" \
    -d "{\"name\":$(echo "$name" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'),\"text\":$(echo "$text" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'),\"rating\":$rating,\"condition\":$(echo "$condition" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'),\"location\":$(echo "$location" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'),\"status\":\"published\",\"imageUrl\":\"\"}")
  if echo "$result" | grep -q '"id"'; then
    echo "  ✅ Review: $name"
  else
    echo "  ⚠️  Review failed: $result" | head -c 120
  fi
}

echo ""
echo "📝 Pushing Blog Posts..."
push_blog "Homoeopathy for Infants: Gentle, Safe, and Holistic Care" "homoeopathy-for-infants-gentle-safe-and-holistic-care-from-birth-to-milestones" "Homoeopathy offers gentle, natural solutions for many common infant health troubles—from jaundice and colic to teething pain and developmental delays—using safe remedies." "Healthcare" ""
push_blog "Homoeopathy for Endometriosis: A Holistic Approach to Relief" "homoeopathy-for-endometriosis-a-holistic-approach-to-relief-and-healing" "Discover how homoeopathy offers gentle, natural relief for endometriosis pain and symptoms. Learn about top remedies, holistic care, and how it complements conventional treatment." "Healthcare" "/photos/blog/Endometriosis-Healing-through-Homeopathy.jpg"
push_blog "Rising Pollution: Homoeopathic Remedies for Cough, Cold, and Breathing" "rising-pollution-homoeopathic-remedies-for-cough-cold-and-breathing" "Discover highly-effective homoeopathic and natural remedies that help relieve cough, cold, and breathing problems caused by increasing air pollution." "Healthcare" ""
push_blog "Homoeopathy for Chikungunya: Effective Remedies and Prevention" "homoeopathy-for-chikungunya-effective-remedies-symptoms-and-prevention" "Chikungunya causes incapacitating pain in the joints. Homoeopathy provides a gentle yet powerful approach to managing Chikungunya and improving immune defence." "Healthcare" "/photos/blog/WhatsApp-Image-2025-10-24-at-3.21.56-PM.jpeg"
push_blog "Conceived Naturally After 2 Years of Marriage With Homoeopathy" "homeopathy-made-it-possible-in-3-months" "A young woman, married for two years, struggled to conceive. After just three months of Dr. Shweta's homoeopathic treatment, she achieved natural conception without IVF." "Healthcare" ""
push_blog "From ACL Tear to Bowling Again: A Cricketer's Comeback" "from-acl-tear-to-bowling-again-a-cricketers-comeback-with-homoeopathy" "A 23-year-old cricketer with a full ACL tear avoided surgery and returned to competitive play in 4 months through Dr. Shweta's homoeopathic treatment." "Healthcare" ""
push_blog "Pityriasis Alba in Children: Complete Recovery with Homoeopathy" "pityriasis-alba-in-children-complete-recovery-with-homeopathy" "A young child with recurring white patches on the face achieved complete recovery through individualised homoeopathic treatment at Dr. Shweta's clinic in Zirakpur." "Healthcare" ""
push_blog "Patient Case Study: Recovery from Anxiety and Fits Through Homoeopathy" "patient-case-study-recovery-from-anxiety-and-fits-through-homoeopathy" "A woman regained her health, confidence, and hope after struggling with anxiety, tremors, and recurring fits through homoeopathic treatment over 6-7 months." "Healthcare" ""
push_blog "Severe Eczema Healed Naturally: A 2-Year Remote Treatment Success" "severe-eczema-healed-naturally-with-homoeopathy-a-2-year-remote-treatment-success-story" "A patient overcame severe eczema through personalised homoeopathic treatment completely online. Learn how natural healing can transform chronic skin conditions." "Healthcare" ""
push_blog "Homoeopathy for Stress Relief: A Promising Alternative for Mental Wellness" "homoeopathy-for-stress-relief-a-promising-alternative-for-mental-wellness" "Discover how homoeopathy offers a holistic, side-effect-free approach to managing chronic stress and anxiety. Learn about key remedies and their benefits." "Healthcare" ""
push_blog "Homoeopathy for Anxiety and Depression" "homoeopathy-for-anxiety-and-depression" "Dr. Shweta's homoeopathic approach to treating anxiety and depression focuses on restoring mental balance through individualised, holistic remedies." "Healthcare" ""
push_blog "COVID-19 and Homoeopathy: A Natural Approach" "covid19-homoeopathy-solution" "Explore how homoeopathy supports recovery from COVID-19 and boosts immunity through individualized, natural remedies." "Healthcare" "/photos/blog/covid19-homoeopathy-solution.jpg"
push_blog "Homoeopathy for All Ages and Conditions" "homoeopathy-for-all-ages" "Homoeopathy provides safe, gentle healing for patients of all ages—from newborns to the elderly. Discover why families trust Dr. Shweta's clinic." "Healthcare" "/photos/blog/for-all-ages-and-sex.jpg"
push_blog "The Path to a Healthier You with Homoeopathy" "healthy-you-with-homoeopathy" "Unlock your body's natural healing potential with personalised homoeopathic treatment. Dr. Shweta's approach addresses root causes for lasting wellness." "Healthcare" "/photos/blog/healthy-you.jpg"
push_blog "Permanent Cure with Homoeopathy: Is It Possible?" "permanent-cure-homoeopathy" "Many patients ask if homoeopathy can provide a permanent cure. Learn how Dr. Shweta's deep-acting, constitutional approach creates lasting healing." "Healthcare" "/photos/blog/permanent-cure-homoeopathy.jpg"
push_blog "Baby Health and Homoeopathy: A Parent's Guide" "baby-health-homoeopathy" "Homoeopathy is one of the safest medicines for babies. Learn how Dr. Shweta treats common infant health issues with gentle, effective homoeopathic remedies." "Healthcare" "/photos/blog/healthy-baby-with-Homoeopathy.jpg"
push_blog "Seasonal Health and Homoeopathy: Stay Well All Year" "seasonal-health-homoeopathy" "Seasonal changes bring new health challenges. Learn how homoeopathy strengthens your immunity and keeps you healthy through every season." "Healthcare" "/photos/blog/seasonal-treatment.jpg"
push_blog "Handle Health Emergencies with Homoeopathy" "handle-emergencies-homoeopathy" "Learn how homoeopathic first-aid remedies can address minor emergencies and acute conditions safely and effectively." "Healthcare" "/photos/blog/Handle-your-Emergencie.jpg"

echo ""
echo "⭐ Pushing Google Reviews..."
push_testimonial 'Carmina "mina" Ruiz' "I am from the Philippines and I'm a user of homeopathic medicine for over a year now, thanks to Dr. Shweta Goyal for educating me on the natural wonders of homeopathic medicine. Doctor Shweta has saved me a lifetime of medication." 5 "General Wellness" "Philippines" "Google"
push_testimonial "Yogendra Singh Rawat" "I had been suffering from frequent headaches for a long time. Dr. Shweta identified that the root cause was high blood pressure and treated it holistically. After her treatment, my headaches stopped completely." 5 "Headache / High BP" "Zirakpur" "Google"
push_testimonial "Himanshu Arya" "I had severe digestive issues and couldn't eat dairy products. Since I started taking medicine from Dr. Shweta, I can eat anything and sleep comfortably without any problems. Highly recommend!" 5 "Digestive Disorders" "Zirakpur" "Google"
push_testimonial "Maninder Kaur" "My asthma symptoms improved significantly within 15 days of starting treatment with Dr. Shweta. I have been able to stop using my inhaler. She is very knowledgeable. Truly the best homeopath in the area." 5 "Asthma" "Zirakpur" "Google"
push_testimonial "Sunita Rani" "After just 3 months of treatment with Dr. Shweta, my ultrasound reports came back completely normal for fatty liver. She gives proper time and attention to each patient." 5 "Fatty Liver" "Budhlada" "Google"
push_testimonial "Sajan Batra" "I had been suffering from severe muscle spasms for 10 years and had seen multiple neurologists without lasting relief. After coming to Dr. Shweta, I have fully recovered." 5 "Muscle Spasms" "Budhlada" "Google"
push_testimonial "Deepak Kumar" "These medicines have improved my headache problem tremendously. Earlier I used to take painkillers daily, now I don't need them at all. Dr. Shweta is very polite and professional." 5 "Chronic Headache" "Zirakpur" "Google"
push_testimonial "Priya Sharma" "Dr. Shweta treated my PCOD and within a few months my hormones were balanced and my cycles became regular. I was able to conceive naturally. She is a blessing for women struggling with hormonal issues." 5 "PCOD / Infertility" "Zirakpur" "Google"
push_testimonial "Ranjeet Singh" "My cholesterol levels were dangerously high and I was on allopathic medicines for 3 years with no improvement. After 4 months of Dr. Shweta's treatment, my cholesterol is under control." 5 "High Cholesterol" "Budhlada" "Google"
push_testimonial "Sakshi Gupta" "I was suffering from UTI recurrently for 2 years. After Dr. Shweta's treatment, I have not had a single episode in over 8 months. She addresses the root cause, not just the symptoms." 5 "Recurrent UTI" "Zirakpur" "Google"

echo ""
echo "📊 Old patient reviews..."
push_testimonial "Shailija" "I am the fan of Dr. Shweta. Polite, knowledgeable and down to earth personality. I had several back pain — in 6 months she fixed it. Recently I had Chikungunya — I took medicine from her. She knows the disease and its treatment very well. I would strongly recommend her." 5 "Lumbar Spondylitis, Chikungunya" "Zirakpur" "Clinic"
push_testimonial "Richa" "I visited her for sneezing. Very good homoeopathy doctor in the area. Listens very patiently and politely, knowledgeable. If you have faith in homoeopathy medicine then I will recommend her." 5 "Chronic Sinusitis" "Zirakpur" "Clinic"
push_testimonial "Yogesh" "I really want to thank Dr. Shweta who has changed my life. I had been a patient of sinus for 2-3 years. I was not able to eat ice creams, curd. But since I started taking medicine from Dr. Shweta, I can eat anything. I am so happy, blessed and healthy." 5 "Chronic Sinusitis" "Zirakpur" "Clinic"

echo ""
echo "🏁 Done! Verifying counts..."
BLOG_COUNT=$(curl -s -b "$COOKIE" "$BASE/api/admin/blog" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('posts',d.get('data',[]))))" 2>/dev/null)
TEST_COUNT=$(curl -s -b "$COOKIE" "$BASE/api/admin/testimonials" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('testimonials',d.get('data',[]))))" 2>/dev/null)
echo "  Blog posts: $BLOG_COUNT"
echo "  Testimonials/Reviews: $TEST_COUNT"
