import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { Reveal } from "@/components/motion";
import BookingForm from "./BookingForm";

export const metadata: Metadata = {
  title: "Booking",
  description:
    "Begin an inquiry for HVB Weddings, HVB Studio or a private commission. Share the place, the date and the feeling — receive availability and a tailored proposal.",
};

export default function BookingPage() {
  return (
    <>
      <PageHero
        kicker="Booking"
        lines={["Begin with", "the feeling."]}
        standfirst="Share the shoot, the date, the place and the budget range. You will receive availability, approach and a tailored proposal — personally."
      />
      <section className="bg-noir px-6 pb-32 md:px-12 md:pb-48">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-20 md:grid-cols-12">
            <Reveal className="md:col-span-7 md:col-start-1">
              <BookingForm />
            </Reveal>
            <Reveal delay={0.2} className="md:col-span-3 md:col-start-10">
              <div className="space-y-10 border-t border-line-dark pt-8 md:sticky md:top-32">
                <div>
                  <p className="label text-smoke-dark">Response</p>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/85">
                    Every inquiry is answered personally, usually within two working
                    days.
                  </p>
                </div>
                <div>
                  <p className="label text-smoke-dark">Weddings</p>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/85">
                    One wedding per date. Popular dates are reserved early.
                  </p>
                </div>
                <div>
                  <p className="label text-smoke-dark">Based in</p>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/85">
                    Tunis — available across Tunisia and internationally.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
