# Samet — Portfolio

Bir yazılım geliştirici portföyü. **Next.js (App Router) + TypeScript + Framer Motion** ile yapıldı; "editorial dark" estetiği ve bol scroll animasyonu içerir.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
```

Üretim derlemesi:

```bash
npm run build
npm run start
```

## Yapı

```
app/
  layout.tsx     # fontlar (Inter / IBM Plex Mono) + i18n provider
  page.tsx       # tüm bölümlerin içeriği (hero, about, work, experience, contact)
  globals.css    # tasarım sistemi: renk değişkenleri, tipografi, layout, hover'lar
components/
  motion.tsx         # scroll animasyon yardımcıları (Reveal, RiseLine,
                     # Counter, Parallax, ScrollProgress) — Framer Motion
  scroll-hero.tsx    # sinematik, scroll'a tepkili pinned/sticky hero
  skills-orbit.tsx   # radial orbital yetenekler (tıklanabilir düğümler)
  i18n.tsx           # TR/EN sözlük + LanguageProvider + useT() hook
```

## Dil desteği (TR / EN)

Tüm metinler [`components/i18n.tsx`](components/i18n.tsx) içindeki `en` ve `tr`
sözlüklerinde. `LanguageProvider` (layout'ta) seçili dili tutar, tarayıcı dilini
algılar ve `localStorage`'a kaydeder; `<html lang>` otomatik güncellenir.
Bileşenler `useT()` ile `c` (içerik) ve `lang`'a erişir. Nav'daki **EN / TR**
düğmesiyle anında geçiş yapılır. Çeviri eklemek/düzenlemek için tek yer bu dosya.

## Renk & tipografi

Palet [`app/globals.css`](app/globals.css) `:root`'ta: derin gece mavisi zemin
(`--bg`), ay ışığı beyazı metin (`--ink`) ve aydınlık indigo/periwinkle vurgu
(`--accent`, `--accent-deep`). Tipografi: **Inter** (başlık/gövde) ve
**IBM Plex Mono** (etiketler).

## Hero (sinematik scroll)

[`components/scroll-hero.tsx`](components/scroll-hero.tsx) pinlenmiş (sticky) bir
sahnedir. Arka planda `public/galaxy/frame_0001.jpg` ile
`frame_0206.jpg` arasındaki 206 görsel kullanılır. Kullanıcı kaydırdıkça scroll
yüzdesi image sequence karelerine eşlenir; yakın kareler önden yüklenir, görsel
hafif ölçek/kayma hareketi alır ve `FRAMES` dizisindeki başlıklar (kicker +
büyük başlık) sırayla değişir. Başlıkları/sahne sayısını `FRAMES` dizisinden,
görsel kare sayısını `IMAGE_FRAME_COUNT` sabitinden düzenle.

## Yetenekler (radial orbital)

[`components/skills-orbit.tsx`](components/skills-orbit.tsx) içindeki `skills`
dizisi düğümleri tanımlar (başlık, ikon, yeterlilik %, `relatedIds` ile
bağlantılar). Otomatik döner; bir düğüme tıklayınca durur, kartı açar ve
bağlantılı yetenekleri vurgular. Orijinal shadcn/Tailwind bileşeni, sitenin
özel CSS sistemine ve lime/kömür paletine uyarlandı (yalnızca `lucide-react`
bağımlılığı eklendi).

## Animasyonlar

- **ScrollProgress** — sayfanın üstünde ilerleme çubuğu
- **RiseLine** — maskeli başlıkların aşağıdan yukarı açılması (hero & contact)
- **Reveal** — bölümler görünüme girince fade-up
- **Counter** — istatistiklerin görünüme girince sayarak dolması
- **Parallax** — scroll'a bağlı hafif derinlik efekti
- Marquee şeridi ve proje satırlarında hover geçişleri

`prefers-reduced-motion` açık kullanıcılarda animasyonlar devre dışı bırakılır.

## Kişiselleştirme

Tüm metin/içerik [`app/page.tsx`](app/page.tsx) içindeki `projects`, `experience`,
`skills` dizilerinde ve JSX'te. Renkler ve tipografi
[`app/globals.css`](app/globals.css) en üstteki `:root` değişkenlerinde.

İsim, e-posta (`hello@samet.dev`) ve sosyal bağlantılar şu an yer tutucu —
kendi bilgilerinle değiştir.
