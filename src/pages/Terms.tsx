import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <PageMeta
        title="Terms of Service | Words Incarnate"
        description="Terms and conditions for using the Words Incarnate website and services."
        path="/terms"
      />
      <Navigation />
      <main className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last updated: April 8, 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed text-foreground/90">
            <section>
              <h2 className="text-xl font-semibold text-foreground">Agreement to Terms</h2>
              <p>
                By accessing or using the Words Incarnate website at wordsincarnate.com (the "Site"), you agree to be bound by these Terms of Service. The Site is operated by Providentia Limited LLC, doing business as Words Incarnate ("we," "us," or "our"). If you do not agree to these terms, do not use the Site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Description of Services</h2>
              <p>
                Words Incarnate provides values formation services for families, schools, and organizations. Through the Site, we offer a free interactive values discovery assessment, an AI-powered values coaching conversation, educational content and resources, information about our consulting and workshop services, and the ability to purchase physical products through our integrated storefront.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Use of the Site</h2>
              <p>
                You agree to use the Site only for lawful purposes and in accordance with these Terms. You agree not to use the Site in any way that violates applicable law, to attempt to gain unauthorized access to any part of the Site or its systems, to interfere with the proper functioning of the Site, to submit false or misleading information, or to use automated tools to scrape or extract content from the Site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Accounts</h2>
              <p>
                Certain features of the Site (such as saving quiz results across sessions) require you to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to provide accurate information when creating an account and to notify us promptly of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">AI Values Coach</h2>
              <p>
                Our Site includes an AI-powered conversational values coach. This feature is provided for informational and reflective purposes only. It is not a substitute for professional counseling, therapy, or psychological services. The AI coach may produce responses that are inaccurate, incomplete, or not applicable to your specific circumstances. We make no warranties regarding the accuracy or suitability of AI-generated content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Intellectual Property</h2>
              <p>
                All content on the Site — including text, graphics, logos, the HOLD framework, quiz methodology, course materials, and software — is the property of Providentia Limited LLC or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content on the Site without our prior written consent.
              </p>
              <p>
                Your quiz results and personal values profile are yours. You may share them freely. However, the assessment methodology, question structure, and underlying system remain our intellectual property.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">User-Submitted Content</h2>
              <p>
                When you submit content to the Site (such as testimonials or contact form messages), you grant us a non-exclusive, royalty-free, perpetual license to use, display, and reproduce that content in connection with our services and marketing, as described at the time of submission. You represent that you own or have the right to submit any content you provide and that it does not violate the rights of any third party.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Products and Purchases</h2>
              <p>
                Physical products available through the Site are sold via our Shopify storefront. Purchases are subject to Shopify's terms of service and our product-specific return and refund policies, which are provided at the time of purchase. Prices, availability, and product descriptions are subject to change without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Consulting Services</h2>
              <p>
                Consulting, workshop, and formation services booked through the Site are subject to separate engagement agreements provided at the time of booking. These Terms govern your use of the Site itself, not the terms of any consulting engagement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Disclaimer of Warranties</h2>
              <p>
                The Site and all content, services, and features are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the Site will be uninterrupted, error-free, or free of harmful components. We disclaim all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Providentia Limited LLC and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site or services, whether based on warranty, contract, tort, or any other legal theory, even if we have been advised of the possibility of such damages. Our total liability for any claim arising from these Terms or your use of the Site shall not exceed the amount you paid us, if any, in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Providentia Limited LLC from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from your use of the Site, your violation of these Terms, or your violation of any rights of a third party.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Governing Law and Disputes</h2>
              <p>
                These Terms are governed by the laws of the State of Texas, without regard to conflict of law provisions. Any disputes arising from these Terms or your use of the Site shall be resolved in the state or federal courts located in Tarrant County, Texas, and you consent to the personal jurisdiction of those courts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Changes to These Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. When we do, we will update the "Last updated" date at the top of this page. Your continued use of the Site after changes are posted constitutes your acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
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

export default Terms;
