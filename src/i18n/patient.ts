// Patient-facing translations. Adding a language is a new entry here,
// no UI changes. RTL scripts set `rtl: true` and the app flips direction.

export interface Lang {
  code: string
  label: string
  rtl?: boolean
}

export const LANGS: Lang[] = [
  { code: 'en', label: 'English' },
  { code: 'cy', label: 'Cymraeg' },
  { code: 'pl', label: 'Polski' },
  { code: 'ro', label: 'Română' },
  { code: 'pt', label: 'Português' },
  { code: 'ur', label: 'اردو', rtl: true },
]

export interface Strings {
  sayItStraight: string
  titlePre: string
  titleEm: string
  lead: string
  share: string
  how: string
  counter: string
}

export const T: Record<string, Strings> = {
  en: {
    sayItStraight: 'Say it straight',
    titlePre: 'How was it,',
    titleEm: 'really?',
    lead: 'A kind word, a worry, or something we could do better. It all counts, it stays anonymous, and it takes about a minute.',
    share: 'Share your visit',
    how: 'See how it works',
    counter: 'voices shared this month',
  },
  cy: {
    sayItStraight: 'Dwedwch yn blaen',
    titlePre: 'Sut oedd hi,',
    titleEm: 'go iawn?',
    lead: 'Gair caredig, pryder, neu rywbeth y gallwn ei wneud yn well. Mae popeth yn cyfrif, mae’n aros yn ddienw, ac mae’n cymryd tua munud.',
    share: 'Rhannwch eich ymweliad',
    how: 'Gweld sut mae’n gweithio',
    counter: 'lleisiau wedi’u rhannu y mis hwn',
  },
  pl: {
    sayItStraight: 'Powiedz wprost',
    titlePre: 'Jak było,',
    titleEm: 'naprawdę?',
    lead: 'Miłe słowo, obawa albo coś, co moglibyśmy poprawić. Wszystko się liczy, pozostaje anonimowe i zajmuje około minuty.',
    share: 'Podziel się swoją wizytą',
    how: 'Zobacz, jak to działa',
    counter: 'opinii w tym miesiącu',
  },
  ro: {
    sayItStraight: 'Spuneți direct',
    titlePre: 'Cum a fost,',
    titleEm: 'cu adevărat?',
    lead: 'O vorbă bună, o îngrijorare sau ceva ce am putea face mai bine. Totul contează, rămâne anonim și durează aproximativ un minut.',
    share: 'Împărtășiți vizita',
    how: 'Vedeți cum funcționează',
    counter: 'opinii împărtășite luna aceasta',
  },
  pt: {
    sayItStraight: 'Diga sem rodeios',
    titlePre: 'Como foi,',
    titleEm: 'na verdade?',
    lead: 'Uma palavra amável, uma preocupação ou algo que podíamos fazer melhor. Tudo conta, é anónimo e demora cerca de um minuto.',
    share: 'Partilhe a sua visita',
    how: 'Veja como funciona',
    counter: 'opiniões partilhadas este mês',
  },
  ur: {
    sayItStraight: 'کھل کر بتائیں',
    titlePre: 'آپ کا تجربہ',
    titleEm: 'کیسا رہا؟',
    lead: 'ایک اچھی بات، کوئی فکر، یا کوئی چیز جو ہم بہتر کر سکتے ہیں۔ ہر بات اہم ہے، یہ گمنام رہتی ہے، اور اس میں تقریباً ایک منٹ لگتا ہے۔',
    share: 'اپنا تجربہ بتائیں',
    how: 'دیکھیں یہ کیسے کام کرتا ہے',
    counter: 'اس ماہ شیئر کیے گئے تاثرات',
  },
}
