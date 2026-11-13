import { PrismaClient } from '@prisma/client'
import { createHash, randomBytes, scryptSync } from 'crypto'

const db = new PrismaClient()

// Password hashing using scrypt (Node built-in, no external deps)
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function main() {
  console.log('Seeding BALAND database...')

  // --- Admin user ---
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@baland.local'
  const adminPassword = process.env.ADMIN_PASSWORD || 'baland-admin-2026'
  const existingAdmin = await db.adminUser.findFirst({ where: { email: adminEmail } })
  if (!existingAdmin) {
    await db.adminUser.create({
      data: {
        email: adminEmail,
        name: 'BALAND Admin',
        passwordHash: hashPassword(adminPassword),
        role: 'admin',
      },
    })
    console.log(`Created admin: ${adminEmail}`)
  } else {
    console.log('Admin already exists, skipping.')
  }

  // --- Site settings (no fake contact info — left empty by design) ---
  await db.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      brandNameFa: 'بالند',
      brandNameEn: 'BALAND',
      sloganFa: 'بالند تا بالندگی همراه شماست',
      sloganEn: 'BALAND — Growing together toward flourishing',
      addressFa: null,
      addressEn: null,
      phone: null,
      email: null,
      footerNoteFa: 'بالند، مجموعه‌ای فرهنگی و آموزشی برای رشد همه‌جانبه کودکان.',
      footerNoteEn: 'BALAND — a cultural and educational community for the flourishing of every child.',
    },
  })

  // --- Social links (no fake URLs; admins add real ones later) ---
  const platforms = [
    { platform: 'instagram', labelFa: 'اینستاگرام', labelEn: 'Instagram', order: 1 },
    { platform: 'telegram', labelFa: 'تلگرام', labelEn: 'Telegram', order: 2 },
    { platform: 'whatsapp', labelFa: 'واتساپ', labelEn: 'WhatsApp', order: 3 },
  ]
  for (const p of platforms) {
    const exists = await db.socialLink.findUnique({ where: { platform: p.platform } })
    if (!exists) {
      await db.socialLink.create({ data: { ...p, url: '', visible: false } })
    }
  }

  // --- Content sections ---
  const sections = [
    {
      key: 'hero',
      titleFa: 'هر کودک، یک جهان منحصربه‌فرد برای کشف شدن',
      titleEn: 'Every child is a unique world waiting to be discovered',
      subtitleFa: 'در بالند، یادگیری و تربیت را بر پایه شناخت علمی از ذهن، توانمندی‌ها و مسیر رشد کودکان دنبال می‌کنیم.',
      subtitleEn: 'At BALAND, learning is grounded in a scientific understanding of the mind, abilities, and growth of every child.',
      order: 0,
    },
    {
      key: 'school',
      titleFa: 'مدرسه‌ای برای شناخت، رشد و بالندگی',
      titleEn: 'A school for understanding, growth and flourishing',
      subtitleFa: 'در بالند، آموزش تنها انتقال دانش نیست؛ بلکه مسیری برای شناخت توانمندی‌ها، پرورش استعدادها و رشد همه‌جانبه کودکان است.',
      subtitleEn: 'At BALAND, education is more than knowledge transfer — it is a journey of discovering abilities, nurturing talents, and holistic growth.',
      order: 1,
    },
    {
      key: 'children',
      titleFa: 'دنیای فرزندان را بهتر بشناسیم',
      titleEn: 'Understanding the world of our children',
      subtitleFa: 'فضایی برای شناخت موضوعات مرتبط با رشد و یادگیری کودکان.',
      subtitleEn: 'A space for understanding topics related to children\'s growth and learning.',
      order: 2,
    },
    {
      key: 'parenting',
      titleFa: 'همراهی خانواده، بخشی از مسیر بالندگی',
      titleEn: 'Family companionship is part of the journey to flourishing',
      subtitleFa: 'رشد کودکان در فضای خانواده، ارتباطات روزمره و تجربه‌های مشترک شکل می‌گیرد. شناخت بهتر دنیای فرزندان می‌تواند همراهی مؤثرتری را رقم بزند.',
      subtitleEn: 'Children grow within the family — through everyday relationships and shared experiences. Understanding their world leads to more meaningful companionship.',
      order: 3,
    },
    {
      key: 'games',
      titleFa: 'بازی کنیم، کشف کنیم و رشد کنیم',
      titleEn: 'Play, discover, grow',
      subtitleFa: 'فضایی برای تجربه بازی‌های فکری و فعالیت‌های ساده آموزشی.',
      subtitleEn: 'A space for cognitive play and simple educational activities.',
      order: 4,
    },
    {
      key: 'contact',
      titleFa: 'با بالند در ارتباط باشید',
      titleEn: 'Get in touch with BALAND',
      subtitleFa: 'ما خوشحال می‌شویم که با ما در ارتباط باشید.',
      subtitleEn: 'We would be glad to hear from you.',
      order: 5,
    },
  ]
  for (const s of sections) {
    await db.contentSection.upsert({
      where: { key: s.key },
      update: {},
      create: { id: undefined, ...s } as any,
    })
  }

  // --- School stages ---
  const stages = [
    {
      key: 'preschool',
      titleFa: 'مرکز پیش‌دبستانی',
      titleEn: 'Preschool Center',
      descriptionFa: 'آغاز مسیر یادگیری با تجربه، بازی، کشف و پرورش مهارت‌های بنیادین.',
      descriptionEn: 'The beginning of the learning journey — through experience, play, discovery, and the nurturing of foundational skills.',
      ageRangeFa: '۳ تا ۶ سال',
      ageRangeEn: 'Ages 3–6',
      icon: 'sparkles',
      order: 1,
    },
    {
      key: 'elementary1',
      titleFa: 'دبستان دوره اول',
      titleEn: 'Elementary — First Cycle',
      descriptionFa: 'ساختن پایه‌های یادگیری، تقویت کنجکاوی و پرورش مهارت‌های شناختی و اجتماعی.',
      descriptionEn: 'Building the foundations of learning, strengthening curiosity, and nurturing cognitive and social skills.',
      ageRangeFa: '۷ تا ۹ سال',
      ageRangeEn: 'Ages 7–9',
      icon: 'compass',
      order: 2,
    },
    {
      key: 'elementary2',
      titleFa: 'دبستان دوره دوم',
      titleEn: 'Elementary — Second Cycle',
      descriptionFa: 'گسترش توانمندی‌ها، تفکر مستقل، مسئولیت‌پذیری و آمادگی برای مراحل بعدی رشد.',
      descriptionEn: 'Expanding abilities, independent thinking, responsibility, and readiness for the next stages of growth.',
      ageRangeFa: '۱۰ تا ۱۲ سال',
      ageRangeEn: 'Ages 10–12',
      icon: 'mountain',
      order: 3,
    },
  ]
  for (const st of stages) {
    await db.schoolStage.upsert({
      where: { key: st.key },
      update: {},
      create: { id: undefined, ...st } as any,
    })
  }

  // --- Articles: Children section ---
  const childrenSection = await db.contentSection.findUnique({ where: { key: 'children' } })
  if (childrenSection) {
    const childrenArticles = [
      {
        slug: 'children-mind',
        titleFa: 'شناخت دنیای ذهنی کودکان',
        titleEn: 'Understanding the Child\'s Inner World',
        excerptFa: 'ذهن کودک جهانی پر از تخیل، پرسش و کشف است.',
        excerptEn: 'A child\'s mind is a world full of imagination, questions, and discovery.',
        icon: 'brain',
        order: 1,
      },
      {
        slug: 'cognitive-growth',
        titleFa: 'رشد شناختی',
        titleEn: 'Cognitive Development',
        excerptFa: 'چگونه تفکر، حافظه و یادگیری کودک در طول زمان شکل می‌گیرد.',
        excerptEn: 'How thinking, memory, and learning take shape over time.',
        icon: 'puzzle',
        order: 2,
      },
      {
        slug: 'emotional-intelligence',
        titleFa: 'هوش هیجانی',
        titleEn: 'Emotional Intelligence',
        excerptFa: 'شناخت و مدیریت هیجان‌ها، پایه‌ای برای سلامت روان.',
        excerptEn: 'Recognizing and managing emotions — a foundation for mental well-being.',
        icon: 'heart',
        order: 3,
      },
      {
        slug: 'creativity',
        titleFa: 'خلاقیت و تخیل',
        titleEn: 'Creativity and Imagination',
        excerptFa: 'فضایی برای رشد تفکر خلاق و بیان اصیل.',
        excerptEn: 'A space for growing creative thinking and authentic expression.',
        icon: 'palette',
        order: 4,
      },
      {
        slug: 'play-based-learning',
        titleFa: 'یادگیری از طریق بازی',
        titleEn: 'Play-Based Learning',
        excerptFa: 'بازی، زبان طبیعی یادگیری در کودکی است.',
        excerptEn: 'Play is the natural language of childhood learning.',
        icon: 'gamepad',
        order: 5,
      },
      {
        slug: 'talent-discovery',
        titleFa: 'کشف استعدادها',
        titleEn: 'Discovering Talents',
        excerptFa: 'هر کودک استعدادهای منحصربه‌فردی دارد که انتظار کشف دارند.',
        excerptEn: 'Every child holds unique talents waiting to be discovered.',
        icon: 'star',
        order: 6,
      },
      {
        slug: 'communication-skills',
        titleFa: 'مهارت‌های ارتباطی',
        titleEn: 'Communication Skills',
        excerptFa: 'چگونه کودکان با دیگران ارتباط سالم و مؤثر برقرار کنند.',
        excerptEn: 'How children build healthy, meaningful relationships with others.',
        icon: 'message-circle',
        order: 7,
      },
      {
        slug: 'individual-differences',
        titleFa: 'تفاوت‌های فردی',
        titleEn: 'Individual Differences',
        excerptFa: 'هیچ دو کودکی یکسان نیستند؛ تفاوت‌ها، فرصت‌ها هستند.',
        excerptEn: 'No two children are alike — differences are opportunities.',
        icon: 'users',
        order: 8,
      },
    ]
    for (const a of childrenArticles) {
      await db.article.upsert({
        where: { slug: a.slug },
        update: {},
        create: { id: undefined, sectionId: childrenSection.id, ...a } as any,
      })
    }
  }

  // --- Articles: Parenting section ---
  const parentingSection = await db.contentSection.findUnique({ where: { key: 'parenting' } })
  if (parentingSection) {
    const parentingArticles = [
      {
        slug: 'effective-communication',
        titleFa: 'ارتباط مؤثر با کودک',
        titleEn: 'Effective Communication with Children',
        excerptFa: 'گوش دادن فعال و گفت‌وگوی صمیمانه، پایه‌ی ارتباط سالم.',
        excerptEn: 'Active listening and warm conversation build healthy connection.',
        icon: 'message-circle',
        order: 1,
      },
      {
        slug: 'emotional-needs',
        titleFa: 'شناخت نیازهای عاطفی',
        titleEn: 'Understanding Emotional Needs',
        excerptFa: 'هر رفتار، پیامی درباره نیاز درونی کودک است.',
        excerptEn: 'Every behavior carries a message about an inner need.',
        icon: 'heart',
        order: 2,
      },
      {
        slug: 'parenting-styles',
        titleFa: 'سبک‌های فرزندپروری',
        titleEn: 'Parenting Styles',
        excerptFa: 'آگاهی از سبک‌های فرزندپروری کمک می‌کند آگاهانه‌تر عمل کنیم.',
        excerptEn: 'Awareness of parenting styles helps us act more intentionally.',
        icon: 'compass',
        order: 3,
      },
      {
        slug: 'play-in-family',
        titleFa: 'نقش بازی در تعامل خانواده',
        titleEn: 'The Role of Play in Family Interaction',
        excerptFa: 'بازی، پلی میان دنیای کودک و بزرگسالان است.',
        excerptEn: 'Play is a bridge between a child\'s world and adults.',
        icon: 'gamepad',
        order: 4,
      },
      {
        slug: 'independence',
        titleFa: 'استقلال و مسئولیت‌پذیری',
        titleEn: 'Independence and Responsibility',
        excerptFa: 'رشد استقلال، گامی کلیدی در مسیر بالندگی است.',
        excerptEn: 'Growing independence is a key step on the path to flourishing.',
        icon: 'mountain',
        order: 5,
      },
      {
        slug: 'conflict-management',
        titleFa: 'مدیریت تعارض‌های روزمره',
        titleEn: 'Managing Everyday Conflicts',
        excerptFa: 'تعارض‌ها فرصتی برای یادگیری مهارت‌های حل مسئله هستند.',
        excerptEn: 'Conflicts are opportunities to learn problem-solving.',
        icon: 'puzzle',
        order: 6,
      },
      {
        slug: 'supporting-learning',
        titleFa: 'حمایت از مسیر یادگیری کودک',
        titleEn: 'Supporting a Child\'s Learning Journey',
        excerptFa: 'همراهی آگاهانه، رشد یادگیری را پایدار می‌کند.',
        excerptEn: 'Mindful companionship sustains a child\'s learning.',
        icon: 'sparkles',
        order: 7,
      },
    ]
    for (const a of parentingArticles) {
      await db.article.upsert({
        where: { slug: a.slug },
        update: {},
        create: { id: undefined, sectionId: parentingSection.id, ...a } as any,
      })
    }
  }

  // --- Games settings ---
  const games = [
    { key: 'memory', titleFa: 'حافظه تصویری', titleEn: 'Visual Memory', descriptionFa: 'جفت‌های مشابه را پیدا کن.', descriptionEn: 'Find the matching pairs.', order: 1 },
    { key: 'patterns', titleFa: 'کشف الگو', titleEn: 'Pattern Discovery', descriptionFa: 'الگوی درست را تکمیل کن.', descriptionEn: 'Complete the correct pattern.', order: 2 },
    { key: 'focus', titleFa: 'تمرکز و مشاهده', titleEn: 'Focus & Observation', descriptionFa: 'شکل هدف را پیدا کن.', descriptionEn: 'Find the target shape.', order: 3 },
  ]
  for (const g of games) {
    await db.gameSettings.upsert({
      where: { key: g.key },
      update: {},
      create: { id: undefined, ...g } as any,
    })
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
