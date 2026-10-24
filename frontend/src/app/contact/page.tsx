import React from 'react';
import { Mail, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';
import { EnquiryType } from '@/types';

interface ContactPageProps {
  searchParams?: {
    type?: EnquiryType;
    course?: string;
  };
}

export default function ContactPage({ searchParams }: ContactPageProps) {
  const initialType: EnquiryType = searchParams?.type || 'STUDENT';
  const initialCourse = searchParams?.course || '';

  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-vibha-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vibha-teal/20 text-vibha-teal text-xs font-semibold uppercase tracking-wider border border-vibha-teal/30">
            <Mail className="w-4 h-4" />
            <span>Direct Communication</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Contact & Academic Enquiries
          </h1>
          <p className="text-lg text-vibha-grey/90 max-w-2xl leading-relaxed">
            Have questions about syllabus content, college partnership proposals, corporate upskilling, or cohort dates? Submit your enquiry below.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form on left (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-vibha-teal">
                Secure Submission
              </span>
              <h2 className="text-2xl font-bold text-vibha-navy">
                Send Us an Enquiry
              </h2>
              <p className="text-xs text-vibha-slate-light leading-relaxed">
                All submissions receive an automated unique reference code and are routed directly to our curriculum advisors.
              </p>
            </div>

            <EnquiryForm
              initialType={initialType}
              initialCourseSlug={initialCourse}
            />
          </div>

          {/* Contact Details & Office info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-vibha-slate-border shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-vibha-navy">
                Office & Campus Coordinates
              </h3>

              <div className="space-y-4 text-sm text-vibha-slate">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-vibha-navy text-xs uppercase tracking-wide">
                      Location
                    </div>
                    <div className="text-xs mt-0.5 leading-relaxed">
                      VIBHA EdTech Education Center, 4th Floor, Tech Hub Towers, Outer Ring Road, Bengaluru, Karnataka 560103, India
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-vibha-navy text-xs uppercase tracking-wide">
                      Email
                    </div>
                    <div className="text-xs mt-0.5">
                      General: contact@vibha-edtech.com <br />
                      College Partnerships: partnerships@vibha-edtech.com
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-vibha-navy text-xs uppercase tracking-wide">
                      Telephone
                    </div>
                    <div className="text-xs mt-0.5">
                      +91 80 4123 4567 (Mon - Sat, 9:00 AM - 6:00 PM IST)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-vibha-teal-subtle text-vibha-teal-dark flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-vibha-navy text-xs uppercase tracking-wide">
                      Academic Advising Hours
                    </div>
                    <div className="text-xs mt-0.5">
                      Monday through Friday: 9:00 AM – 7:00 PM IST <br />
                      Saturday: 10:00 AM – 4:00 PM IST
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-vibha-grey/60 border border-vibha-slate-border text-xs text-vibha-slate space-y-1">
                <div className="font-bold text-vibha-navy flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-vibha-teal" />
                  <span>Data Protection & Privacy</span>
                </div>
                <p className="leading-relaxed">
                  Your contact details are strictly used for answering your educational enquiry. We never sell or share learner information with third-party marketing brokers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
