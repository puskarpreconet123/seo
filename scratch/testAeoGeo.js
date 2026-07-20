const aeoGeoService = require("../backend/services/aeoGeoService");

console.log("-----------------------------------------");
console.log("Testing AEO & GEO Service: Seeded Offline Mode");
console.log("-----------------------------------------");
const seededResult = aeoGeoService.analyzeDomain("preconetindia.com", null);
console.log(JSON.stringify(seededResult, null, 2));

console.log("\n-----------------------------------------");
console.log("Testing AEO & GEO Service: Parsing Mock HTML");
console.log("-----------------------------------------");
const mockHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Preconet India - Advanced Digital Marketing & Web Solutions</title>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": "What services does Preconet India provide?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Preconet India provides search engine optimization, web development, and local review dashboard analytics."
      }
    }]
  }
  </script>
</head>
<body>
  <h1>Preconet India SEO Dashboard</h1>
  <p>We are a leading tech company. In our tests, we analyzed over 100+ local businesses and found a 35% average organic growth in map ranking visibility. This is based on our custom algorithm.</p>
  <p>Our research shows that direct schema tagging improves citation opportunities. Here is a list of features:</p>
  <ul>
    <li>Technical SEO audits</li>
    <li>Google Business Profile integration</li>
    <li>AI citation analysis</li>
  </ul>
  
  <table>
    <tr><th>Feature</th><th>Availability</th></tr>
    <tr><td>Local GBP</td><td>Yes</td></tr>
    <tr><td>Schema Injector</td><td>Yes</td></tr>
  </table>

  <a href="/about-us">About Us</a>
  <a href="/privacy-policy">Privacy Policy</a>
  <a href="https://linkedin.com/company/preconet">LinkedIn Profile</a>
</body>
</html>
`;

const parsedResult = aeoGeoService.analyzeDomain("preconetindia.com", mockHtml);
console.log(JSON.stringify(parsedResult, null, 2));
console.log("\n✅ Verification Test Script Complete!");
