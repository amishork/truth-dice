import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <PageMeta
        title="Privacy Policy | Words Incarnate"
        description="How Words Incarnate collects, uses, and protects your personal information."
        path="/privacy"
      />
      <Navigation />
      <main className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last updated: April 8, 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed text-foreground/90">
            <section>
              <h2 className="text-xl font-semibold text-foreground">Who We Are</h2>
              <p>
                Words Incarnate is operated by Providentia Limited LLC, doing business as Words Incarnate. We provide values formation services for families, schools, and organizations. Our principal place of business is in Fort Worth, Texas.
              </p>
              <p>
                For questions about this policy or your data, contact us at{" "}
                <a href="mailto:alex@wordsincarnate.com" className="text-primary hover:underline">
                  alex@wordsincarnate.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>

              <h3 className="text-lg font-medium text-foreground mt-6">Information You Provide</h3>
              <p>
                <strong>Email capture and newsletter signup:</strong> When you enter your email address on our homepage or download our free guide, we store your email address, the source of the signup, and a timestamp.
              </p>
              <p>
                <strong>Contact form:</strong> When you submit our contact form, we collect your name, email address, phone number (if provided), and your message.
              </p>
              <p>
                <strong>Values assessment:</strong> When you take our values discovery quiz, we store your selected area of life, the values you choose throughout the process, your final six core values, and session duration. If you create an account, this data is linked to your user profile. If you take the quiz as a guest, the data is stored with an anonymous session identifier.
              </p>
              <p>
                <strong>AI values coach:</strong> When you use our conversational values coach, we store booking details you provide (name, contact information, preferred offering, and timing) if you choose to schedule a session. We do not store the conversation itself.
              </p>
              <p>
                <strong>Testimonials:</strong> If you submit a testimonial through our guided form, we collect your name, role or title, email (optional), audience type, star rating, and your written testimonial. Testimonials are reviewed before being published. By submitting, you grant permission for us to display your name, role, and testimonial on our website and marketing materials.
              </p>
              <p>
                <strong>Account creation:</strong> If you create an account, we store your email address and authentication credentials. We support email/password authentication.
              </p>

              <h3 className="text-lg font-medium text-foreground mt-6">Information Collected Automatically</h3>
              <p>
                <strong>Analytics:</strong> We use Vercel Analytics to understand how visitors use our site. Vercel Analytics is privacy-focused and does not use cookies. It collects anonymized page view data including page URL, referrer, browser type, operating system, device type, and country. This data is aggregated and cannot be used to identify individual visitors. For more information, see{" "}
                <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Vercel's Analytics privacy policy
                </a>.
              </p>
              <p>
                <strong>Cookies and local storage:</strong> We use browser local storage (not traditional cookies) to save your quiz progress so you can return to where you left off, remember your cookie consent preference, store your authentication session, and remember your theme preference (light or dark mode). We do not use third-party advertising cookies or tracking pixels.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Deliver the free values guide you requested</li>
                <li>Save and display your quiz results</li>
                <li>Respond to your contact form inquiries</li>
                <li>Process and confirm booking requests</li>
                <li>Send transactional emails related to your interactions with our site</li>
                <li>Display approved testimonials on our website</li>
                <li>Understand how visitors use our site so we can improve it</li>
              </ul>
              <p>
                We do not sell, rent, or share your personal information with third parties for marketing purposes. We will never send you unsolicited marketing emails unless you have explicitly opted in.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">How We Store Your Information</h2>
              <p>
                Your data is stored securely using Supabase, a hosted database platform with encryption at rest and in transit. Supabase servers are located in the United States. Access to the database is restricted to authorized personnel only.
              </p>
              <p>
                Transactional emails (such as your free guide delivery and booking confirmations) are sent through Resend, an email delivery service. Resend processes your email address solely for the purpose of delivering these messages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy. If you would like your data deleted, contact us at{" "}
                <a href="mailto:alex@wordsincarnate.com" className="text-primary hover:underline">
                  alex@wordsincarnate.com
                </a>{" "}
                and we will remove your information within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Request access to the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent for data processing at any time</li>
              </ul>
              <p>
                To exercise any of these rights, email{" "}
                <a href="mailto:alex@wordsincarnate.com" className="text-primary hover:underline">
                  alex@wordsincarnate.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Third-Party Services</h2>
              <p>We use the following third-party services to operate this site:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Supabase</strong> — database hosting, authentication, and serverless functions</li>
                <li><strong>Vercel</strong> — website hosting and privacy-focused analytics</li>
                <li><strong>Resend</strong> — transactional email delivery</li>
                <li><strong>Anthropic (Claude)</strong> — powers our AI values coach conversation</li>
                <li><strong>Shopify</strong> — product storefront for physical goods</li>
              </ul>
              <p>
                Each of these services has its own privacy policy governing how they handle data. We encourage you to review their policies if you have concerns.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Children's Privacy</h2>
              <p>
                Our services are not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. When we do, we will update the "Last updated" date at the top of this page. We encourage you to review this page periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Governing Law</h2>
              <p>
                This privacy policy is governed by and construed in accordance with the laws of the State of Texas, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Contact</h2>
              <p>
                Providentia Limited LLC, doing business as Words Incarnate
                <br />
                Fort Worth, Texas
                <br />
                <a href="mailto:alex@wordsincarnate.com" className="text-primary hover:underline">
                  alex@wordsincarnate.com
                </a>
                <br />
                <a href="tel:+16822333559" className="text-primary hover:underline">
                  (682) 233-3559
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Privacy;
