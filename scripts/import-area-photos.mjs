import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const sources = [
  ['Dhanmondi', 'Dhanmondi Lake at road-5 Dhanmondi,Dhaka, Bangladesh.jpg', 'Dhanmondi Lake', 'ধানমন্ডি লেক'],
  ['Gulshan', 'Gulshan Lake Dhaka.jpg', 'Gulshan Lake', 'গুলশান লেক'],
  ['Mirpur', 'Mirpur DOHS (26088794555).jpg', 'Mirpur DOHS', 'মিরপুর ডিওএইচএস'],
  ['Uttara', 'Uttara, Dhaka (32949924072).jpg', 'Uttara, Dhaka', 'উত্তরা, ঢাকা'],
  ['Mohammadpur', 'Sat gambuj mosque.jpg', 'Sat Gambuj Mosque, Mohammadpur', 'সাত গম্বুজ মসজিদ, মোহাম্মদপুর'],
  ['Bogura Sadar', 'Gokul Medh.jpg', 'Gokul Medh, Bogura', 'গোকুল মেধ, বগুড়া'],
  ['Shibganj', 'Mahasthangarh.jpg', 'Mahasthangarh, Shibganj', 'মহাস্থানগড়, শিবগঞ্জ'],
  ['Savar — Birulia', 'বিরুলিয়া সেতু, সাভার.jpg', 'Birulia Bridge, Savar', 'বিরুলিয়া সেতু, সাভার'],
  ['Savar — Dattapara', "National Martyrs' Memorial in Savar.jpg", 'Savar landmark · National Martyrs’ Memorial', 'সাভারের দর্শনীয় স্থান · জাতীয় স্মৃতিসৌধ'],
];
await mkdir('public/areas', {recursive:true});
const photos = process.argv[2] ? JSON.parse(await readFile('src/content/area-photos.json','utf8')) : {};
for (const [area, file, caption, captionBn] of sources) {
  if (process.argv[2] && area !== process.argv[2]) continue;
  const query = new URLSearchParams({ action:'query', format:'json', titles:`File:${file}`, prop:'imageinfo', iiprop:'url|extmetadata', iiurlwidth:'800' });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${query}`, {headers:{'User-Agent':'Dropzo/1.0 (courier project; image attribution)'},signal:AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(`Metadata ${response.status}: ${file}`);
  const page = Object.values((await response.json()).query.pages)[0];
  const info = page.imageinfo?.[0];
  if (!info) throw new Error(`Missing photo: ${file}`);
  const meta = info.extmetadata;
  const clean = (v) => (v || '').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').trim();
  const license = clean(meta.LicenseShortName?.value);
  if (!/CC BY|CC0|Public domain/i.test(license)) throw new Error(`Review license ${license}: ${file}`);
  const image = await fetch(info.thumburl || info.url, {signal:AbortSignal.timeout(30000)});
  if (!image.ok) throw new Error(`Photo ${image.status}: ${file}`);
  const slug = area.toLowerCase().replace(/[^a-z]+/g,'-');
  await sharp(Buffer.from(await image.arrayBuffer())).resize({width:800,withoutEnlargement:true}).webp({quality:78}).toFile(`public/areas/${slug}.webp`);
  photos[area] = {src:`/areas/${slug}.webp`,caption,captionBn,author:clean(meta.Artist?.value),license,licenseUrl:meta.LicenseUrl?.value || 'https://creativecommons.org/publicdomain/zero/1.0/',source:info.descriptionurl};
  console.log(`${area}: ${license}`);
}
await writeFile('src/content/area-photos.json', JSON.stringify(photos,null,2)+'\n');
