import {
  Users,
  FlaskConical,
  FileText,
  Map,
  Briefcase,
  BookOpen,
  MessageSquareText,
  Handshake,
  HeartHandshake,
  GraduationCap,
  Globe2,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { useContent } from '@/lib/contentContext';

const iconMap: Record<string, LucideIcon> = {
  Users,
  FlaskConical,
  FileText,
  Map,
  Briefcase,
  BookOpen,
  MessageSquareText,
  Handshake,
  HeartHandshake,
  GraduationCap,
  Globe2,
  ShieldCheck,
};

export default function Programs() {
  const { programs } = useContent();

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
            Program Unggulan
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-navy-900">
            Agenda Nyata, Bukan Janji
          </h2>
          <p className="mt-4 text-navy-600">
            Enam program unggulan AKSARA untuk menghadirkan solusi konkret,
            memperkuat kolaborasi lintas angkatan, dan mewujudkan dampak nyata
            bagi Kelurahan LPDP UI.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => {
            const Icon = iconMap[p.icon] ?? FileText;
            return (
              <div
                key={p.id}
                className="group relative rounded-2xl border border-navy-100 bg-navy-50/50 p-7 transition-all hover:bg-white hover:shadow-card hover:-translate-y-1"
              >
                <span className="grid place-items-center h-12 w-12 rounded-xl bg-navy-900 text-gold-300 mb-5 transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-serif text-lg font-semibold text-navy-900">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-navy-600 leading-relaxed">
                  {p.description}
                </p>
                <div className="mt-5 h-0.5 w-10 bg-gold-300 group-hover:w-full transition-all duration-500" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
