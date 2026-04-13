export default function PrivacyPage() {
  return (
    <div className="max-w-screen-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
          <p>
            We collect information you provide directly, such as your name, email address,
            phone number, shipping address, and payment information when you create an account
            or place an order.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
          <p>
            Your information is used to process orders, communicate with you about your account
            and orders, improve our services, and send promotional communications (with your consent).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">3. Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information with
            third-party service providers who assist in operating our platform, processing
            payments, and delivering orders.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information.
            However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">5. Cookies</h2>
          <p>
            We use cookies and similar technologies to enhance your browsing experience,
            analyze site traffic, and personalize content. You can manage cookie preferences
            through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">6. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal information.
            Contact us at privacy@zaykaur.com to exercise these rights.
          </p>
        </section>
      </div>
    </div>
  );
}
