// 📲 오프라인 지원: 한 번 접속하면 인터넷이 끊겨도 앱이 열려요.
// 앱을 고쳐서 배포할 때는 CACHE 이름의 숫자를 올려 주세요.
const CACHE = 'agpe-v30';
// 같은 주소(gmlduqzhd123-lab.github.io)의 다른 앱들과 저장소를 함께 쓰므로, 이 앱의 이전 캐시만 지운다.
const CACHE_PREFIX = 'agpe-v';
const THUMBS = [
    './thumbs/archery.jpg', './thumbs/badminton.jpg', './thumbs/baseball.jpg', './thumbs/basketball.jpg',
    './thumbs/breaking.jpg', './thumbs/equestrian.jpg', './thumbs/esports.jpg', './thumbs/fencing.jpg',
    './thumbs/golf.jpg', './thumbs/gymnastics.jpg', './thumbs/handball.jpg', './thumbs/hurdle.jpg',
    './thumbs/judo.jpg', './thumbs/longjump.jpg', './thumbs/pentathlon.jpg', './thumbs/relay.jpg',
    './thumbs/roller.jpg', './thumbs/rowing.jpg', './thumbs/shooting.jpg', './thumbs/skateboard.jpg',
    './thumbs/soccer.jpg', './thumbs/softtennis.jpg', './thumbs/swimming.jpg', './thumbs/tabletennis.jpg',
    './thumbs/taekwondo.jpg', './thumbs/teqball.jpg', './thumbs/volleyball.jpg', './thumbs/weightlifting.jpg'
];
const CORE = ['./', './index.html', './manifest.webmanifest', './ys-install.js', './icons/icon-192.png', './icons/icon-512.png', ...THUMBS];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    // 앱 화면: 인터넷이 되면 항상 최신 버전, 안 되면 저장해 둔 버전
    if (req.mode === 'navigate') {
        e.respondWith(fetch(req).then(res => {
            if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
            return res;
        }).catch(() => caches.match('./index.html').then(r => r || caches.match('./'))));
        return;
    }
    // 같은 사이트 파일과 글꼴만 저장 (유튜브 등은 저장하지 않음)
    // 배경음악은 큰 파일이라 저장하지 않고 그때그때 받아요 (구간 요청도 그대로 전달)
    if (url.pathname.includes('/audio/') || req.headers.has('range')) return;
    const cacheable = url.origin === self.location.origin || /(^|\.)fonts\.(googleapis|gstatic)\.com$|(^|\.)cdn\.jsdelivr\.net$/.test(url.hostname);
    if (!cacheable) return;
    e.respondWith(caches.match(req).then(hit => {
        const net = fetch(req).then(res => {
            if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
            return res;
        }).catch(() => hit);
        return hit || net;
    }));
});
