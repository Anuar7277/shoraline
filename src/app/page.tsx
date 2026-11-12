"use client";

import {
  Bell,
  ChevronDown,
  ChevronRight,
  Clock3,
  Heart,
  LayoutGrid,
  ListMusic,
  Mic2,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Plus,
  Search,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Track = {
  id: number;
  title: string;
  artist: string;
  genre: string;
  language: "Русский" | "Қазақша" | "English";
  duration: string;
  durationSeconds: number;
  key: string;
  color: string;
  accent: string;
  hot?: boolean;
  new?: boolean;
  singers?: number;
};

const tracks: Track[] = [
  {
    id: 1,
    title: "Между нами тает лёд",
    artist: "Грибы",
    genre: "Поп",
    language: "Русский",
    duration: "03:42",
    durationSeconds: 222,
    key: "Am",
    color: "sunset",
    accent: "#ff7a58",
    hot: true,
    singers: 18,
  },
  {
    id: 2,
    title: "Сен емес",
    artist: "Moldanazar",
    genre: "Инди-поп",
    language: "Қазақша",
    duration: "03:58",
    durationSeconds: 238,
    key: "Fm",
    color: "violet",
    accent: "#a779ff",
    new: true,
    singers: 11,
  },
  {
    id: 3,
    title: "Вахтёрам",
    artist: "Бумбокс",
    genre: "Рок",
    language: "Русский",
    duration: "04:07",
    durationSeconds: 247,
    key: "Dm",
    color: "blue",
    accent: "#60a8ff",
    singers: 26,
  },
  {
    id: 4,
    title: "Ауырмайды жүрек",
    artist: "Қайрат Нұртас",
    genre: "Поп",
    language: "Қазақша",
    duration: "03:29",
    durationSeconds: 209,
    key: "Gm",
    color: "gold",
    accent: "#f5bd52",
    hot: true,
    singers: 37,
  },
  {
    id: 5,
    title: "Бесконечность",
    artist: "Земфира",
    genre: "Рок",
    language: "Русский",
    duration: "05:12",
    durationSeconds: 312,
    key: "Cm",
    color: "rose",
    accent: "#f06f9c",
    singers: 14,
  },
  {
    id: 6,
    title: "Love Story",
    artist: "Taylor Swift",
    genre: "Поп",
    language: "English",
    duration: "03:55",
    durationSeconds: 235,
    key: "C",
    color: "aqua",
    accent: "#5edac5",
    new: true,
    singers: 9,
  },
  {
    id: 7,
    title: "Атамекен",
    artist: "Ескендір Хасанғалиев",
    genre: "Классика",
    language: "Қазақша",
    duration: "03:50",
    durationSeconds: 230,
    key: "Em",
    color: "forest",
    accent: "#71bf83",
    singers: 42,
  },
  {
    id: 8,
    title: "Не надо стесняться",
    artist: "Иван Дорн",
    genre: "Танцевальная",
    language: "Русский",
    duration: "03:45",
    durationSeconds: 225,
    key: "Bm",
    color: "peach",
    accent: "#fa9669",
    singers: 16,
  },
];

const lyricSets = [
  [
    "Таял лёд, и мы остались в нём",
    "Под шум дождя мы говорим о важном",
    "Только голосом друг друга найдём",
    "И этот вечер будет самым нашим",
    "Пой со мной, не отпускай ладонь",
  ],
  [
    "Сен мені түсінесің бе?",
    "Жүрекке жақын әуен бар",
    "Біз бүгін бірге айтамыз",
    "Түннің ішінде жанған шамдар",
    "Бұл ән тек бізге арналар",
  ],
  [
    "Кто-то молчит, а кто-то поёт",
    "В каждом слове есть свой поворот",
    "Сцена сегодня только для нас",
    "Сделай громче этот прекрасный час",
    "Музыка снова ведёт вперёд",
  ],
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${rest}`;
}

export default function Home() {
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(67);
  const [volume, setVolume] = useState(72);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("Все языки");
  const [queue, setQueue] = useState<Track[]>([tracks[1], tracks[3], tracks[2]]);
  const [favorites, setFavorites] = useState<number[]>([2, 5]);
  const [showQueue, setShowQueue] = useState(false);
  const [toast, setToast] = useState("");
  const [isPartyOpen, setIsPartyOpen] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setElapsed((time) => {
        if (time >= currentTrack.durationSeconds) {
          setIsPlaying(false);
          return currentTrack.durationSeconds;
        }
        return time + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying, currentTrack.durationSeconds]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredTracks = useMemo(() => {
    const words = query.trim().toLocaleLowerCase();
    return tracks.filter((track) => {
      const matchesQuery = !words || `${track.title} ${track.artist}`.toLocaleLowerCase().includes(words);
      const matchesLanguage = language === "Все языки" || track.language === language;
      return matchesQuery && matchesLanguage;
    });
  }, [query, language]);

  const lyrics = lyricSets[currentTrack.id % lyricSets.length];
  const activeLine = Math.min(lyrics.length - 1, Math.floor((elapsed / currentTrack.durationSeconds) * lyrics.length));
  const progress = Math.min(100, (elapsed / currentTrack.durationSeconds) * 100);

  function playTrack(track: Track) {
    setCurrentTrack(track);
    setElapsed(0);
    setIsPlaying(true);
    setToast(`Сейчас звучит: «${track.title}»`);
  }

  function addToQueue(track: Track) {
    if (track.id === currentTrack.id || queue.some((item) => item.id === track.id)) {
      setToast("Эта песня уже в очереди");
      return;
    }
    setQueue((items) => [...items, track]);
    setToast(`«${track.title}» добавлена в очередь`);
  }

  function nextTrack() {
    if (queue.length) {
      const [next, ...rest] = queue;
      setQueue(rest);
      playTrack(next);
      return;
    }
    const currentIndex = tracks.findIndex((track) => track.id === currentTrack.id);
    playTrack(tracks[(currentIndex + 1) % tracks.length]);
  }

  function toggleFavorite(id: number) {
    setFavorites((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Shora Line">
          <span className="brand-mark"><Mic2 size={18} strokeWidth={2.6} /></span>
          <span>shora<span>line</span></span>
        </button>

        <nav className="main-nav" aria-label="Основная навигация">
          <a className="active" href="#discover">Главная</a>
          <a href="#catalog">Каталог</a>
          <a href="#party">Вечеринки</a>
          <a href="#history">История</a>
        </nav>

        <div className="topbar-actions">
          <button className="icon-button notification" aria-label="Уведомления"><Bell size={19} /><i /></button>
          <button className="profile-button" aria-label="Профиль Амины">
            <span className="avatar">А</span>
            <span className="profile-name">Амина</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </header>

      <section className="hero-grid" id="discover">
        <div className="welcome-copy">
          <p className="eyebrow"><Sparkles size={14} /> твой вечер, твой голос</p>
          <h1>Спой то, что<br /><em>чувствуешь.</em></h1>
          <p className="hero-text">Выбирай любимые песни, собирай друзей и превращай обычный вечер в маленькую сцену.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}>
              <Play size={16} fill="currentColor" /> Найти песню
            </button>
            <button className="text-button" onClick={() => setIsPartyOpen(true)}><Users size={17} /> Создать вечеринку</button>
          </div>
          <div className="people-list">
            <div className="faces" aria-label="Друзья онлайн">
              <span className="face face-a">Д</span><span className="face face-b">М</span><span className="face face-c">Л</span><span className="face face-d">С</span>
            </div>
            <span><b>12 друзей</b> сейчас поют</span>
          </div>
        </div>

        <section className="now-playing-card" aria-label="Сейчас играет">
          <div className="playing-art sunset" aria-hidden="true">
            <div className="art-sun" />
            <div className="art-mic"><Mic2 size={44} /></div>
            <span className="art-artist">GRIBY</span>
          </div>
          <div className="now-playing-content">
            <div className="now-title-row"><span className="live-label"><i /> Сейчас поём</span><button className="icon-button small" aria-label="Другие действия"><MoreHorizontal size={20} /></button></div>
            <div>
              <h2>{currentTrack.title}</h2>
              <p>{currentTrack.artist} <span>·</span> оригинальная тональность {currentTrack.key}</p>
            </div>
            <div className="lyrics-preview" aria-live="polite">
              {lyrics.slice(0, 2).map((line, index) => <p className={index === activeLine ? "current-lyric" : ""} key={line}>{line}</p>)}
            </div>
            <div className="player-progress">
              <input aria-label="Позиция песни" type="range" min="0" max={currentTrack.durationSeconds} value={elapsed} onChange={(event) => setElapsed(Number(event.target.value))} style={{ "--range-progress": `${progress}%` } as React.CSSProperties} />
              <span>{formatTime(elapsed)}</span><span>{currentTrack.duration}</span>
            </div>
            <div className="player-controls">
              <button className="control-button" onClick={() => setElapsed(Math.max(0, elapsed - 10))} aria-label="Назад на 10 секунд"><SkipBack size={18} /></button>
              <button className="big-play" onClick={() => setIsPlaying((playing) => !playing)} aria-label={isPlaying ? "Пауза" : "Воспроизвести"}>
                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
              </button>
              <button className="control-button" onClick={nextTrack} aria-label="Следующая песня"><SkipForward size={18} /></button>
              <div className="volume"><Volume2 size={17} /><input aria-label="Громкость" type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} style={{ "--range-progress": `${volume}%` } as React.CSSProperties} /></div>
              <button className="queue-toggle" onClick={() => setShowQueue((value) => !value)}><ListMusic size={17} /> Очередь <b>{queue.length}</b></button>
            </div>
          </div>

          {showQueue && <div className="queue-popover">
            <div className="popover-heading"><b>В очереди</b><button onClick={() => setShowQueue(false)} aria-label="Закрыть очередь"><X size={17} /></button></div>
            {queue.length ? queue.map((track, index) => <button className="queue-row" key={track.id} onClick={() => { setQueue((items) => items.filter((item) => item.id !== track.id)); playTrack(track); }}><span>{index + 1}</span><div><b>{track.title}</b><small>{track.artist}</small></div><Play size={15} /></button>) : <p className="empty-queue">Добавьте песни из каталога</p>}
          </div>}
        </section>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="section-heading">
          <div><p className="section-kicker">Всё для твоей сцены</p><h2>Выбери настроение</h2></div>
          <button className="all-link" onClick={() => { setQuery(""); setLanguage("Все языки"); }}>Смотреть каталог <ChevronRight size={17} /></button>
        </div>
        <div className="mood-grid">
          <button className="mood-card mood-pop" onClick={() => setQuery("Кайрат")}><span className="mood-icon">✦</span><b>Поп-хиты</b><small>Подпевай каждому припеву</small><span className="mood-arrow">↗</span></button>
          <button className="mood-card mood-duet" onClick={() => setLanguage("Қазақша")}><span className="mood-icon">♡</span><b>Казахстанское</b><small>Голоса, которые помним</small><span className="mood-arrow">↗</span></button>
          <button className="mood-card mood-dance" onClick={() => setQuery("Love")}><span className="mood-icon">◌</span><b>Для танцев</b><small>Никто не усидит на месте</small><span className="mood-arrow">↗</span></button>
          <button className="mood-card mood-rock" onClick={() => setQuery("Вахтёрам")}><span className="mood-icon">ϟ</span><b>Рок-вечер</b><small>Делаем громче</small><span className="mood-arrow">↗</span></button>
        </div>
      </section>

      <section className="library-section">
        <div className="library-heading">
          <div><p className="section-kicker">Более 50 000 песен</p><h2>Найди свою песню</h2></div>
          <div className="view-switch" aria-label="Вид каталога"><button className="active"><LayoutGrid size={17} /></button><button><ListMusic size={17} /></button></div>
        </div>
        <div className="search-row">
          <label className="search-field"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название песни или исполнитель" /><kbd>⌘ K</kbd></label>
          <label className="select-field"><SlidersHorizontal size={17} /><select value={language} onChange={(event) => setLanguage(event.target.value)}><option>Все языки</option><option>Русский</option><option>Қазақша</option><option>English</option></select><ChevronDown size={16} /></label>
        </div>
        <div className="result-meta"><span>{filteredTracks.length ? `Нашли ${filteredTracks.length} песен` : "Ничего не нашли"}</span><button onClick={() => setQuery("")}>Сбросить фильтры</button></div>

        <div className="track-grid">
          {filteredTracks.map((track) => <article className="track-card" key={track.id}>
            <button className={`track-cover ${track.color}`} onClick={() => playTrack(track)} aria-label={`Включить ${track.title}`}>
              <span className="cover-glow" />
              <span className="cover-mic"><Music2 size={30} /></span>
              <span className="cover-title">{track.title}</span>
              <span className="cover-play"><Play size={18} fill="currentColor" /></span>
              {track.hot && <span className="badge hot">Хит</span>}{track.new && <span className="badge new">Новинка</span>}
            </button>
            <div className="track-info">
              <div><h3>{track.title}</h3><p>{track.artist}</p></div>
              <button className={`heart-button ${favorites.includes(track.id) ? "liked" : ""}`} onClick={() => toggleFavorite(track.id)} aria-label="Добавить в избранное"><Heart size={18} fill={favorites.includes(track.id) ? "currentColor" : "none"} /></button>
            </div>
            <div className="track-meta"><span>{track.language}</span><i /> <span>{track.duration}</span><button onClick={() => addToQueue(track)}><Plus size={16} /> В очередь</button></div>
          </article>)}
        </div>
        {!filteredTracks.length && <div className="no-results"><Search size={25} /><p>Попробуйте другое название или исполнителя</p></div>}
      </section>

      <section className="bottom-grid" id="party">
        <article className="party-card">
          <div className="party-illustration"><span className="disco-ball">✦</span><span className="music-note note-one">♪</span><span className="music-note note-two">♫</span><span className="party-lights" /></div>
          <div className="party-copy"><p className="section-kicker">ВМЕСТЕ ВЕСЕЛЕЕ</p><h2>Домашняя<br />вечеринка</h2><p>Приглашай друзей. Пусть каждый добавит песню в общую очередь прямо со своего телефона.</p><button className="light-button" onClick={() => setIsPartyOpen(true)}>Создать вечеринку <ChevronRight size={17} /></button></div>
        </article>
        <article className="recent-card" id="history">
          <div className="recent-heading"><div><p className="section-kicker">НЕДА В МУЗЫКЕ</p><h2>Пели недавно</h2></div><button className="all-link">Вся история <ChevronRight size={16} /></button></div>
          <div className="recent-list">
            {[tracks[4], tracks[6], tracks[5]].map((track, index) => <button key={track.id} className="recent-row" onClick={() => playTrack(track)}><span className={`mini-cover ${track.color}`}>{index + 1}</span><span className="recent-track"><b>{track.title}</b><small>{track.artist}</small></span><span className="recent-time"><Clock3 size={14} /> {index === 0 ? "вчера" : `${index + 2} дня назад`}</span><Play size={16} /></button>)}
          </div>
        </article>
      </section>

      <footer><span>© 2026 Shora Line</span><span>Пой громко. Пой от сердца.</span><div><a href="#catalog">Помощь</a><a href="#party">О сервисе</a></div></footer>

      {toast && <div className="toast"><Music2 size={17} />{toast}</div>}

      {isPartyOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setIsPartyOpen(false)}><section className="party-modal" role="dialog" aria-modal="true" aria-labelledby="party-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setIsPartyOpen(false)} aria-label="Закрыть"><X size={19} /></button><div className="modal-icon"><Users size={24} /></div><p className="section-kicker">ДОМАШНЯЯ ВЕЧЕРИНКА</p><h2 id="party-title">Сцена готова!</h2><p>Отправьте друзьям код комнаты — они смогут добавлять песни в общую очередь.</p><div className="room-code"><span>Код комнаты</span><b>SHORA–82</b><button onClick={() => { navigator.clipboard?.writeText("SHORA-82"); setToast("Код комнаты скопирован"); }}><Share2 size={16} /> Скопировать</button></div><button className="primary-button wide" onClick={() => { setIsPartyOpen(false); setToast("Вечеринка создана — приглашайте друзей!"); }}><Sparkles size={17} /> Начать вечеринку</button></section></div>}
    </main>
  );
}
