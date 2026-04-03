import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">Privacy Policy</h1>
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
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p className="text-muted-foreground">
              Origins ("we," "us," "our," or "Company") operates the Origins app. This Privacy Policy explains our practices regarding the collection, use, and protection of your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">Account Information</h3>
                <p className="text-muted-foreground">
                  When you register, we collect your email address, name, and profile information to create and maintain your account.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Card Collection Data</h3>
                <p className="text-muted-foreground">
                  We collect information about trading cards you register, including card images, names, sets, estimated values, purchase prices, and condition details. This data helps you track your collection value and trading history.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Location Information</h3>
                <p className="text-muted-foreground">
                  When you enable BOLO (Be On The Look Out) alerts, we collect your location coordinates and city/state information to notify you of stolen cards reported near you. This requires your permission.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Media & Messages</h3>
                <p className="text-muted-foreground">
                  We store video messages, photos, and text you upload to share about your cards. These are associated with specific cards and visible to other app users through your card's public page.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Device Information</h3>
                <p className="text-muted-foreground">
                  We automatically collect device type, OS version, and browser information to improve app performance and compatibility.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Payment Information</h3>
                <p className="text-muted-foreground">
                  For paid subscriptions, we use Stripe for payment processing. We do not store full credit card details—Stripe handles all payment data securely.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Manage your account and provide app functionality</li>
              <li>• Send you BOLO alerts for stolen cards matching your collection</li>
              <li>• Display your collection publicly on your profile page (unless made private)</li>
              <li>• Process payments for paid features and subscriptions</li>
              <li>• Analyze market data and trending cards for premium users</li>
              <li>• Improve app performance, security, and user experience</li>
              <li>• Communicate important updates or policy changes</li>
              <li>• Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal data. We may share information in these cases:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>Service providers:</strong> We use third parties for payment processing (Stripe), file storage, and analytics</li>
              <li>• <strong>Public profile data:</strong> Your card collection and trading activity are visible to other app users</li>
              <li>• <strong>Legal requirements:</strong> We may disclose information if required by law or to protect safety</li>
              <li>• <strong>Business transfers:</strong> In case of merger or acquisition, data may be transferred to the new entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Device Permissions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">Camera (Photo Upload)</h3>
                <p className="text-muted-foreground">
                  When registering cards or uploading messages, we request camera/gallery access to let you capture or select card images.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Location (Optional - BOLO Alerts)</h3>
                <p className="text-muted-foreground">
                  We request location permission only if you enable BOLO alerts. You can revoke this anytime in your app settings.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Contacts & Microphone (Video Messages)</h3>
                <p className="text-muted-foreground">
                  Video recording requires microphone access. We never access your contacts without permission.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your account and card data as long as your account is active. You can request deletion of your account and associated data anytime. Deleted data will be removed from our systems within 30 days, except where legally required to retain it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Security</h2>
            <p className="text-muted-foreground">
              We use encryption, secure authentication, and regular security updates to protect your data. However, no online system is 100% secure. We cannot guarantee absolute security against all attacks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Your Rights</h2>
            <p className="text-muted-foreground mb-3">
              Depending on your location, you may have rights including:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Access your personal data</li>
              <li>• Correct inaccurate information</li>
              <li>• Request deletion of your data</li>
              <li>• Opt-out of marketing communications</li>
              <li>• Data portability (receive your data in a standard format)</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              To exercise these rights, contact us at support@origins.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Third-Party Services</h2>
            <p className="text-muted-foreground">
              We use external services including Stripe (payments), Google Cloud (storage), and analytics providers. These services have their own privacy policies—we encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this policy occasionally. We'll notify you of significant changes via email. Your continued use of the app after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact Us</h2>
            <p className="text-muted-foreground">
              For privacy questions or concerns, contact us at:<br />
              Email: privacy@origins.com
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}