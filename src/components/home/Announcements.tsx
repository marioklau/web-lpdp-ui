import { CalendarClock, Phone } from 'lucide-react';
import { HIGHLIGHT_NEWS } from '@/data';

function phoneLabel(href: string): string {
  const digits = href.replace(/\D/g, '');
  if (digits.startsWith('62')) return `+${digits}`;
  return href;
}

export default function Announcements() {
  return (
    <section className="bg-white py-14 sm:py-20" aria-labelledby="pengumuman-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          Pengumuman
        </span>
        <h2
          id="pengumuman-title"
          className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-navy-900 sm:text-4xl"
        >
          Kabar yang perlu diketahui sekarang
        </h2>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          {HIGHLIGHT_NEWS.map((item) => {
            const memorial = item.tone === 'memorial';
            return (
              <article
                key={item.id}
                className={`overflow-hidden rounded-2xl border shadow-soft ${
                  memorial
                    ? 'border-navy-200 bg-navy-50'
                    : 'border-gold-400/40 bg-white'
                }`}
              >
                <div className={`h-1.5 ${memorial ? 'bg-navy-800' : 'bg-gold-400'}`} />
                <div className="p-5 sm:p-7">
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      memorial ? 'text-navy-500' : 'text-gold-700'
                    }`}
                  >
                    {item.category}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight text-navy-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-700 sm:text-base">
                    {item.summary}
                  </p>

                  <dl className="mt-5 space-y-2">
                    {item.facts.map((fact) => (
                      <div key={fact.label} className="grid grid-cols-[7.5rem_1fr] gap-2 text-sm">
                        <dt className="font-medium text-navy-500">{fact.label}</dt>
                        <dd className="font-semibold text-navy-900">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    {item.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${
                          memorial
                            ? 'border border-navy-300 bg-white text-navy-900 hover:bg-navy-100'
                            : 'bg-gold-400 text-navy-900 hover:bg-gold-300'
                        }`}
                      >
                        <CalendarClock className="h-4 w-4" aria-hidden="true" />
                        {link.label}
                      </a>
                    ))}
                    {item.contacts.map((contact) => (
                      <a
                        key={contact.href}
                        href={contact.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-50"
                      >
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        {contact.label} · {phoneLabel(contact.href)}
                      </a>
                    ))}
                  </div>

                  {item.note && (
                    <p className="mt-4 text-xs leading-relaxed text-navy-500">{item.note}</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
