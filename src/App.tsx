import { Children, cloneElement, isValidElement, useRef, useState, type ReactNode } from 'react';

const photo = 'https://images.unsplash.com/photo-1607357910286-1ff94ac13c24?auto=format&fit=crop&w=1800&q=85';
const sections = ['The invitation', 'Our story', 'Our moments', 'The celebration', 'Your RSVP'];
const gallery = [
  { id: '1519741497674-611481863552', alt: 'A newlywed couple with a bouquet', credit: 'Nathan Dumlao' },
  { id: '1606216794079-73f85bbd57d5', alt: 'A bride in a flowing white wedding dress', credit: 'Jakob Owens' },
  { id: '1465495976277-4387d4b0b4c6', alt: 'A couple holding hands on their wedding day', credit: 'Drew Coffman' },
  { id: '1591700331354-f7eea65d1ce8', alt: 'A dried flower bouquet and hands held together', credit: 'Sinitta Leunen' },
];

function EventIcon({ kind }: { kind: 'calendar' | 'clock' | 'pin' }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {kind === 'calendar' ? <><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v5m8-5v5M4 11h16"/></> : kind === 'clock' ? <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> : <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>}
  </svg>;
}

function saveEvent(reception: boolean) {
  const name = reception ? 'Resepsi' : 'Akad Nikah';
  const content = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Evelyn and Raymond//Wedding//EN',
    'BEGIN:VEVENT', `UID:${reception ? 'reception' : 'ceremony'}-20261231@evelyn-raymond.wedding`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:20261231T${reception ? '090000' : '070000'}Z`,
    `DTEND:20261231T${reception ? '140000' : '080000'}Z`,
    `SUMMARY:Evelyn & Raymond - ${name}`, 'LOCATION:The Glass House\\, Bali\\, Indonesia',
    'DESCRIPTION:We look forward to celebrating with you.', 'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `evelyn-raymond-${reception ? 'resepsi' : 'akad'}.ics`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function AnimatedSlide({ children, index, active, name }: { children: ReactNode; index: number; active: boolean; name: string }) {
  let wordIndex = 0;
  function animateWords(nodes: ReactNode): ReactNode {
    return Children.map(nodes, node => {
      if (typeof node === 'string' || typeof node === 'number') {
        return <span className="word-group">{String(node).split(/(\s+)/).map((word, position) =>
          word.trim() ? <span className="animated-word" key={position} style={{ animationDelay: `${180 + wordIndex++ * 22}ms` }}>{word}</span> : word
        )}</span>;
      }
      if (!isValidElement<{ children?: ReactNode }>(node)) return node;
      if (typeof node.type === 'string' && ['input', 'select', 'textarea', 'svg'].includes(node.type)) return node;
      return node.props.children === undefined ? node : cloneElement(node, { children: animateWords(node.props.children) });
    });
  }
  return <section className={`slide slide-${index}`} aria-label={name} aria-hidden={!active} inert={!active}>{animateWords(children)}</section>;
}

function Arrow({ back = false }: { back?: boolean }) {
  return <svg width="20" height="16" viewBox="0 0 24 18" fill="none" aria-hidden="true" style={back ? { transform: 'rotate(180deg)' } : undefined}><path d="M2 9h19m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.3" /></svg>;
}

export default function App() {
  const [page, setPage] = useState(-1);
  const guestName = new URLSearchParams(window.location.search).get('to')?.trim() || 'Our dear family & friends';
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const touchStart = useRef<number | null>(null);
  const changePage = (next: number) => setPage(Math.max(0, Math.min(sections.length - 1, next)));

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch { setCopied(false); }
  }

  return (
    <div className={`app${page === -1 ? ' is-cover' : ''}`} onKeyDown={e => { if (page === -1 || (e.target as HTMLElement).matches('input, select, textarea')) return; if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); changePage(page + (e.key === 'ArrowDown' ? 1 : -1)); } }}>
      <header className="header">
        <a className="monogram" href="#" onClick={e => { e.preventDefault(); changePage(0); }} aria-label="Evelyn and Raymond invitation">e<span>&</span>r<i /></a>
        <span className="header-note">A LITTLE INVITATION. A LIFETIME OF LOVE.</span>
        <button className="share" onClick={share}>{copied ? 'Link copied' : 'Share invitation'}<svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M12 3h5v5M17 3l-9 9M8 4H4v13h13v-5" stroke="currentColor" strokeWidth="1.2"/></svg></button>
      </header>

      <main className="invitation" onTouchStart={e => { touchStart.current = page === -1 || (e.target as HTMLElement).closest('input, select, textarea') ? null : e.touches[0].clientY; }} onTouchCancel={() => { touchStart.current = null; }} onTouchEnd={e => { if (touchStart.current === null) return; const delta = touchStart.current - e.changedTouches[0].clientY; if (Math.abs(delta) > 55) changePage(page + (delta > 0 ? 1 : -1)); touchStart.current = null; }}>
        <div className="photo-panel">
          <img src={photo} alt="Evelyn and Raymond sharing a quiet moment in a sunlit garden" />
          <div className="photo-shade" />
          <span className="photo-top">TOGETHER IS A BEAUTIFUL PLACE TO BE</span>
          <div className="photo-caption"><span>THE WEDDING OF</span><p>Evelyn & Raymond</p><div>31 DECEMBER 2026 <span>·</span> BALI, INDONESIA</div></div>
          <span className="photo-credit">Photography by Vadim Paripa / Unsplash</span>
        </div>

        <div className="content-panel">
          <div className="corner-flower" aria-hidden="true">❧</div>
          <div className="page-number">{page === -1 ? 'A PERSONAL INVITATION' : <><span>0{page + 1}</span> / 0{sections.length}</>}</div>
          <div className="slide-viewport">
          <div className="slide-track" style={{ transform: `translateY(-${(page + 1) * 100}%)` }}>
          <AnimatedSlide index={-1} name="Welcome to our wedding" active={page === -1}>
            <div className="eyebrow"><span /> THE WEDDING OF <span /></div>
            <h1>Evelyn<span className="ampersand">&</span>Raymond</h1>
            <p className="description">Thursday, 31 December 2026</p>
            <div className="guest cover-guest"><span>To our special guest</span><p>{guestName}</p></div>
            <button className="primary open-invitation" onClick={() => changePage(0)}>Open invitation <span className="open-arrow"><Arrow /></span></button>
            <p className="swipe-hint">A beautiful day awaits. Let’s begin.</p>
          </AnimatedSlide>
          {sections.map((name, index) => <AnimatedSlide key={name} index={index} name={name} active={index === page}>
            {index === 0 && <>
              <div className="eyebrow"><span /> YOU’RE INVITED <span /></div>
              <p className="intro">With full hearts and open arms,</p>
              <h1>Evelyn<span className="ampersand">&</span>Raymond</h1>
              <p className="description">invite you to share in the joy of their wedding.<br />A day for love, laughter, and happily ever after.</p>
              <div className="date-block"><span>THURSDAY</span><strong>31 <i>/</i> 12 <i>/</i> 2026</strong><span>THE GLASS HOUSE · BALI</span></div>
              <div className="guest"><span>Lovingly invited</span><p>{guestName}</p></div>
              <button className="primary" onClick={() => changePage(1)}>Discover our story <Arrow /></button>
              <p className="swipe-hint">Geser ke atas untuk membuka cerita kami</p>
            </>}
            {index === 1 && <>
              <div className="eyebrow"><span /> OUR LITTLE LOVE STORY <span /></div>
              <h2>Some things are<br /><em>meant to be.</em></h2>
              <p className="description story-intro">A chance hello. A thousand little moments.<br />And a love that feels like coming home.</p>
              <div className="story-timeline">
                <div><span>2020</span><section><h3>The first hello</h3><p>Two coffees, one mutual friend, and a conversation neither of us wanted to end.</p></section></div>
                <div><span>2023</span><section><h3>Our favorite adventure</h3><p>From little weekend escapes to building a life together, we kept choosing each other.</p></section></div>
                <div><span>2026</span><section><h3>A forever kind of yes</h3><p>Now, we’re starting our next chapter. And it wouldn’t be the same without you.</p></section></div>
              </div>
              <button className="primary" onClick={() => changePage(2)}>Our moments <Arrow /></button>
            </>}
            {index === 2 && <>
              <div className="eyebrow"><span /> LITTLE MOMENTS, BIG LOVE <span /></div>
              <h2>A glimpse of<br /><em>forever.</em></h2>
              <div className="gallery-grid">
                {gallery.map((image, imageIndex) => <figure key={image.id} style={{ animationDelay: `${200 + imageIndex * 100}ms` }}>
                  <img src={`https://images.unsplash.com/photo-${image.id}?auto=format&fit=crop&w=650&q=85`} alt={image.alt} loading="lazy" />
                  <figcaption>{image.credit} / Unsplash</figcaption>
                </figure>)}
              </div>
              <button className="primary" onClick={() => changePage(3)}>The celebration <Arrow /></button>
            </>}
            {index === 3 && <>
              <div className="eyebrow"><span /> SAVE THE DATE <span /></div>
              <h2>A day to<br /><em>remember.</em></h2>
              <p className="description event-intro">Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.</p>
              <div className="event-cards">
                {[false, true].map(reception => <article className="event-card" key={String(reception)}>
                  <h3>{reception ? 'Resepsi' : 'Akad Nikah'}</h3>
                  <p><EventIcon kind="calendar" /> Kamis, 31 Desember 2026</p>
                  <p><EventIcon kind="clock" /> {reception ? '17:00 WITA – Selesai' : '15:00 – 16:00 WITA'}</p>
                  <p><EventIcon kind="pin" /> The Glass House, Bali</p>
                  <button className="calendar-button" onClick={() => saveEvent(reception)}><EventIcon kind="calendar" /> Simpan ke Kalender</button>
                </article>)}
              </div>
              <div className="venue-map">
                <iframe title="The Glass House, Bali — Google Maps" src="https://maps.google.com/maps?q=The%20Glass%20House%20Bali&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen tabIndex={page === 3 ? 0 : -1} />
              </div>
              <a className="text-link" href="https://www.google.com/maps/search/?api=1&query=The%20Glass%20House%20Bali" target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
              <button className="primary" onClick={() => changePage(4)}>Save your seat <Arrow /></button>
            </>}
            {index === 4 && <>
              <div className="eyebrow"><span /> THE BEST PART IS YOU <span /></div>
              <h2>{submitted ? <>See you at<br /><em>the celebration.</em></> : <>Come for the love.<br /><em>Stay for the party.</em></>}</h2>
              {submitted ? <div className="confirmation"><div className="confirmation-mark">✓</div><p>Your RSVP has been saved for this visit.</p><p>Thank you for being part of our story.<br />With love, Evelyn & Raymond</p><button className="text-link" onClick={() => setSubmitted(false)}>Update your response</button></div> : <>
                <p className="description">Kindly reply by 1 December 2026.<br />We can’t wait to celebrate with you.</p>
                <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
                  <label>Your full name<input name="name" placeholder="Name & surname" required autoComplete="name" /></label>
                  <div className="form-row"><label>Will you join us?<select name="attendance"><option>Joyfully accepts</option><option>Regretfully declines</option></select></label><label>Guests<select name="guests"><option>1 guest</option><option>2 guests</option><option>3 guests</option><option>4 guests</option></select></label></div>
                  <label>A little note <span>(optional)</span><textarea name="note" placeholder="Send a little love to the couple…" rows={2}/></label>
                  <button className="primary" type="submit">Send my RSVP <Arrow /></button>
                </form>
              </>}
            </>}
          </AnimatedSlide>)}
          </div>
          </div>
          <div className="slide-controls" inert={page === -1}><button onClick={() => changePage(page - 1)} disabled={page === 0} aria-label="Previous slide"><Arrow back /></button><div className="dots">{sections.map((name, index) => <button key={name} className={index === page ? 'active' : ''} onClick={() => changePage(index)} aria-label={name} aria-current={index === page ? 'step' : undefined}/>)}</div><button onClick={() => changePage(page + 1)} disabled={page === sections.length - 1} aria-label="Next slide"><Arrow /></button></div>
        </div>
      </main>
      <footer inert={page === -1}><span>MADE WITH LOVE, FOR OUR FAVORITE PEOPLE</span><nav aria-label="Invitation sections">{sections.map((name, index) => <button key={name} onClick={() => changePage(index)} className={index === page ? 'selected' : ''}><span>0{index + 1}</span> {name}</button>)}</nav><span className="footer-date">E & R <i>·</i> 31.12.26</span></footer>
    </div>
  );
}
