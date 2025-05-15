import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Privacy Policy</h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600"><strong>Last Updated:</strong> May 15, 2025</p>
          <p className="mt-4 text-gray-700">
            At [Your Blog Platform Name], accessible from [Your Website URL], we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our blog platform or use our services. If you have any questions, please contact us at <Link href="mailto:support@[yourdomain].com" className="text-blue-600 hover:underline">support@[yourdomain].com</Link>.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
          <p className="text-gray-700">We may collect the following types of information:</p>
          <ul className="list-disc pl-5 mt-2 text-gray-700">
            <li><strong>Personal Information:</strong> Name, email address, and other details you provide when you register, comment on posts, or subscribe to our newsletter.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our platform, such as IP address, browser type, pages visited, and time spent on the site, collected via cookies and analytics tools.</li>
            <li><strong>Content Data:</strong> Comments, posts, or other content you submit to our platform.</li>
          </ul>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700">We use the collected information to:</p>
          <ul className="list-disc pl-5 mt-2 text-gray-700">
            <li>Provide and improve our blog platform, including personalizing content.</li>
            <li>Manage your account and subscriptions.</li>
            <li>Respond to your comments, inquiries, or support requests.</li>
            <li>Analyze usage trends to enhance user experience.</li>
            <li>Send newsletters or promotional content (with your consent).</li>
          </ul>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Cookies and Tracking Technologies</h2>
          <p className="text-gray-700">
            We use cookies to enhance your experience, such as remembering your preferences and analyzing site traffic. You can disable cookies in your browser settings, but this may affect some features. For more details, see our <Link href="/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</Link>.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Sharing Your Information</h2>
          <p className="text-gray-700">
            We do not sell or rent your personal information. We may share your information with:
          </p>
          <ul className="list-disc pl-5 mt-2 text-gray-700">
            <li>Third-party service providers (e.g., analytics tools, email services) to support our platform.</li>
            <li>Legal authorities if required by law or to protect our rights.</li>
          </ul>
          <p className="text-gray-700 mt-2">
            Our blog may contain links to third-party websites. We are not responsible for their privacy practices.[](https://websoftskills-yndd.vercel.app/privacy-policy/)
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
          <p className="text-gray-700">
            We implement reasonable security measures to protect your information. However, no system is 100% secure, and we cannot guarantee absolute security.[](https://xor.art/posts/privacy-policy)
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
          <p className="text-gray-700">
            Depending on your location, you may have rights under laws like GDPR or CCPA, including:
          </p>
          <ul className="list-disc pl-5 mt-2 text-gray-700">
            <li>Accessing or correcting your personal data.</li>
            <li>Requesting deletion of your data.</li>
            <li>Opting out of marketing communications.</li>
          </ul>
          <p className="text-gray-700 mt-2">
            To exercise these rights, contact us at <Link href="mailto:support@[yourdomain].com" className="text-blue-600 hover:underline">support@[yourdomain].com</Link>.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Children’s Privacy</h2>
          <p className="text-gray-700">
            Our platform is not intended for users under 13. We do not knowingly collect data from children under 13. If you believe we have such data, please contact us.[](https://artemisengineering.mobi/posts/privacy-policy)
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Changes to This Privacy Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy periodically. Changes will be posted on this page with an updated “Last Updated” date. We encourage you to review this page regularly.[](https://artemisengineering.mobi/posts/privacy-policy)
          </p>
        </div>

        <div className="text-center text-gray-600 text-sm mt-8">
          <p>© 2025 [Your Blog Platform Name]. All rights reserved.</p>
          <p>
            <Link href="/" className="text-blue-600 hover:underline">Home</Link> |{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Use</Link>
          </p>
        </div>
      </div>
    </div>
  );
}