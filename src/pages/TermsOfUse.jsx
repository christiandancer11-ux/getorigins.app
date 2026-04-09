import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">Terms of Use</h1>
          </div>
          <p className="text-muted-foreground">Last updated: April 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-invert max-w-none space-y-6"
        >
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By using the Origins app, you agree to these Terms of Use. If you disagree with any part, you may not use the app. We reserve the right to modify these terms at any time—changes take effect immediately upon posting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Use License</h2>
            <p className="text-muted-foreground mb-3">
              We grant you a personal, non-exclusive, revocable license to use the Origins app for lawful purposes. You may not:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Modify, copy, or create derivative works</li>
              <li>• Reverse engineer, decompile, or hack the app</li>
              <li>• Use automated tools to scrape data</li>
              <li>• Transmit viruses or malicious code</li>
              <li>• Impersonate other users or create fake accounts</li>
              <li>• Harass, threaten, or abuse other users</li>
              <li>• Post illegal, defamatory, or infringing content</li>
              <li>• Exceed reasonable rate limits or access the app inappropriately</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
            <p className="text-muted-foreground mb-3">
              When creating an account, you agree to:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Provide accurate, complete information</li>
              <li>• Keep your password confidential</li>
              <li>• Notify us immediately of unauthorized access</li>
              <li>• Accept responsibility for all activities under your account</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. User-Generated Content</h2>
            <p className="text-muted-foreground mb-3">
              You retain ownership of content you create (card photos, messages, videos). By uploading to Origins, you grant us a worldwide, non-exclusive license to:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Store and display your content on your profile</li>
              <li>• Share it with other app users as part of card details</li>
              <li>• Use it for app analytics and improvements</li>
              <li>• Create backups for security purposes</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              You certify that your content does not infringe on anyone's rights and comply with all laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Intellectual Property Rights</h2>
            <p className="text-muted-foreground">
              Origins and its content (design, code, logos, trademarks) are owned by Origins or its licensors. You may not use our intellectual property without permission. User-generated content remains your property, but we have a license to display and use it as described above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Payment & Subscriptions</h2>
            <p className="text-muted-foreground mb-3">
              For paid features:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Prices are in USD and current as displayed</li>
              <li>• Subscriptions auto-renew unless cancelled</li>
              <li>• Refunds are not available except where required by law</li>
              <li>• We may change prices with 30 days notice</li>
              <li>• All transactions are processed securely through Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Disclaimers</h2>
            <p className="text-muted-foreground mb-3">
              The Origins app is provided "as is" without warranties. We do not guarantee:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Uninterrupted or error-free service</li>
              <li>• Accuracy of market data or card valuations</li>
              <li>• Reliability of BOLO alerts or other features</li>
              <li>• Security against all cyberattacks or breaches</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Market prices and card values are informational only—not financial advice. Always verify values independently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent allowed by law, Origins is not liable for indirect, incidental, special, or consequential damages arising from your use of the app. Our total liability is limited to the amount you paid us in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to defend and indemnify Origins against any claims arising from your violation of these terms, your misuse of the app, or your infringement of others' rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account immediately for violations of these terms. You can delete your account anytime through app settings. Upon termination, your right to use the app ceases, though we may retain your data as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Dispute Resolution</h2>
            <p className="text-muted-foreground mb-3">
              Any disputes will be governed by the laws of the United States. You agree to attempt resolution through good-faith negotiation before pursuing legal action. If that fails, disputes will be resolved through binding arbitration rather than court proceedings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Severability</h2>
            <p className="text-muted-foreground">
              If any provision of these terms is invalid, the remaining provisions remain in effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">13. Entire Agreement</h2>
            <p className="text-muted-foreground">
              These Terms of Use, along with our Privacy Policy, constitute the entire agreement between you and Origins regarding app use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">14. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these terms, contact us at:<br />
              Email: legal@getorigins.app
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}