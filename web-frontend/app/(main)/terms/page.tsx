export default function TermsPage() {
  return (
    <div className="max-w-screen-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
          <p>
            By accessing and using ZayKaur, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">2. Use of Service</h2>
          <p>
            You must be at least 18 years old to use this service. You are responsible for
            maintaining the confidentiality of your account credentials and for all activities
            that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">3. Orders and Payments</h2>
          <p>
            All orders are subject to availability and confirmation. Prices are listed in INR
            and include applicable taxes unless stated otherwise. We reserve the right to
            cancel orders in case of pricing errors or stock unavailability.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">4. Returns and Refunds</h2>
          <p>
            Products may be returned within 7 days of delivery, subject to our return policy.
            Refunds will be processed within 5-7 business days after the returned item is received
            and inspected.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">5. Intellectual Property</h2>
          <p>
            All content on ZayKaur, including text, images, logos, and software, is the property
            of ZayKaur or its licensors and is protected by intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">6. Contact</h2>
          <p>
            For any questions regarding these terms, please contact us at support@zaykaur.com.
          </p>
        </section>
      </div>
    </div>
  );
}
